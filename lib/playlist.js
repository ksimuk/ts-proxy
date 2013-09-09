'use strict';

var request = require('request');
var querystring = require('querystring');
var config = require('./../config');
var parser = require('./playlist-parser');

var playlist = null;
var channels = {};

function buildPlaylist(data) {
	var res = ['#EXTM3U', '\n'];
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
	var playlist = res.join('');
	return playlist;
}


function parsePlaylist(data) {
	data = parser.parse(data);
	playlist = buildPlaylist(data);
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