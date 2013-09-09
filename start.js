'use strict';

var http = require('http');
var iniparser = require('iniparser');
var querystring = require('querystring');

var config = require('./config');
var stream = require('./lib/stream');
var playlist = require('./lib/playlist');

var cfgPath = process.argv[3] || './config.ini';

function start() {
	playlist.start();
	http.createServer(function (req, res) {
		var pathname = req.url;

		if (pathname === '/playlist') {
			req.setEncoding('utf8');
			playlist.request(res);
			return;
		}

		var parts = pathname.split('/');
		console.log(parts);
		if (parts.length > 1 && parts[1] === 'stream') {
			var channelName = querystring.unescape(parts[2]);
			var streamId = playlist.getChannel(channelName);
			if (streamId) {
				stream.attach(req, res, streamId);
				return;
			}
		}

		// not found handle
		res.writeHead(404, {
			'Content-Type': 'text/plain'
		});
		res.end('NotFound\n');

	}).listen(config.port, '0.0.0.0');

	console.log('Server running at ' + config.local_domain);
}

iniparser.parse(cfgPath, function (err, data) {
	config.set(data);
	start();
});
