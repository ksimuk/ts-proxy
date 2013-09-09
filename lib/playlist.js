'use strict';

var config = require('./../config');
var request = require('request');

var playlist = null;

exports.start = function () {
	function refresh() {
		get(config.playlist_url, parse);

	}

	function parse(data) {
		data = data.split('\n');
		for (var i = data.length - 1; i > 0; i--) {
			if (data[i].indexOf('#EXTINF') !== 0) {
				data[i] = config.local_domain + 'stream/' + data[i];
			}
		}
		playlist = data.join('\n');
	}

	function get(url, callback) {
		request(url, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				callback(body);
			}
		});
	}

	setTimeout(refresh, config.refresh * 100 * 60);
	refresh();

};

exports.request = function (res) {
	res.writeHead(200, {
		'Content-Type': 'text/plain; charset=utf-8'
	});
	res.end(playlist);
};