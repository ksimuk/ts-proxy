'use strict';

var config = require('./../config');
var request = require('request');
var querystring = require('querystring');
var playlist = null;
var channels = {};
var COMMENT_RE, extended, parse;

COMMENT_RE = /:[-]?(\d+),(.+)\s*\n(.+)/;

function empty(line) {
	return !!line.trim().length;
}

function extended(line) {
	var match;
	match = line.match(COMMENT_RE);
	if (match && match.length === 4) {
		var name = match[2];
		var groups = name.match(/\([^\)]+\)/g);
		groups = (groups === null) ? [] : groups;
		for (var i = 0; i < groups.length; i++) {
			name = name.replace(groups[i], '');
			groups[i] = groups[i].replace(/[\(\)]/g, '').trim();
		}
		return {
			length: match[1],
			title: name.trim(),
			groups: groups,
			file: match[3].trim()
		};
	}
}

function parse(playlist) {
	var firstNewline;
	firstNewline = playlist.search('\n');
	return playlist.substr(firstNewline).split('#').filter(empty).map(extended);
}

function parsePlaylist(data) {
	data = parse(data);
	// todo use m3u creator library
	var res = ['EXTM3U', '\n'];
	channels = {};
	for (var i = 0; i < data.length; i++) {
		var item = data[i];

		channels[item.title] = {
			file: item.file,
			groups: item.groups
		};

		res.push('#EXTINF:-1,', item.title, ' (', item.groups.join(','), ')\n');
		res.push(config.local_domain, 'stream/', querystring.escape(item.title), '\n');
	}
	playlist = res.join('');
}

function get(url, callback) {
	request(url, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			callback(body);
		}
	});
}

function refresh() {
	get(config.playlist_url, parsePlaylist);
	if (config.refresh !== 0) {
		setTimeout(refresh, config.refresh * 100 * 60);
	}
}

exports.start = function () {
	refresh();
};

exports.getChannel = function (name) {
	if (channels[name]) {
		return channels[name].file;
	}
};

exports.request = function (res) {
	res.writeHead(200, {
		'Content-Type': 'text/plain; charset=utf-8'
	});
	res.end(playlist);
};