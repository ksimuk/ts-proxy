'use strict';

var ace = require('./ace-client');
var request = require('request');

exports.attach = function (req, res, streamId) {
	var stream = null;
	var aceClient = ace.start(streamId);

	aceClient.on('start', function (streamUrl) {
		request.get(streamUrl).pipe(res);
	});

	aceClient.on('stop', function () {
		res.end();
		stream = null;
	});

	res.on('close', function () {
		aceClient.close();
	});

};