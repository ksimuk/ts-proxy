'use strict';

var net = require('net');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var crypto = require('crypto');
var request = require('request');

var config = require('./../config');

var key =  null;

function sendCommand(self, command, args) {
	var data = [command];
	if (!_.isUndefined(args)) {
		if (!_.isArray(args)) {
			args = [args];
		}
		data = data.concat(args);
	}
	data.push('\r\n');
	console.log('PUT: ' + data.join(' '));
	self.socket.write(data.join(' '));
}

function onCommand(self, data) {
	console.log(data.toString());
	data = data.toString().split(' ');
	var command = data[0];
	data.shift();
	var args = data.join(' ').replace(/[\r\n]/g, '');
	if (typeof self['cmd' + command] === 'function') {
		self['cmd' + command].call(self, args);
	}
}

function Connection(streamId) {
	EventEmitter.call(this);

	this.streamId = streamId;
	this.socket = net.createConnection(18082, '127.0.0.1');
	this.socket.on('data', onCommand.bind(null, this));

	this.socket.on('connect', function () {
		this.sayHello();
	}.bind(this));

	this.socket.on('end', function () {
		console.log('DONE');
	});
}

util.inherits(Connection, EventEmitter);

var p = Connection.prototype;

p.sayHello = function () {
	sendCommand(this, 'HELLOBG', 'version=4.0');
};

p.startPlay = function () {
	sendCommand(this, 'START', ['PID', this.streamId, 0]);
};

p.cmdHELLOTS = function (data) {
	var keyParam = data.split(' ')[1];
	var requestKey = keyParam.split('=')[1];
	if (key === null) {
		request('http://valdikss.org.ru/tv/key.php?key=' + requestKey,
			function (error, resonse, body) {
				if (!error) {
					sendCommand(this, 'READY', 'key=' + body);
					sendCommand(this, 'USERDATA', '[{"gender": 1}, {"age": 4}]');
					this.startPlay();
				}
			}.bind(this)
		);
		return;
	}
	// valid key have;
	var shasum = crypto.createHash('sha1');
	shasum.update(requestKey + key);
	var signature = shasum.digest('hex');

	var x = key.split('-')[0];
	var response_key = x + '-' + signature;
	sendCommand(this, 'READY', 'key=' + response_key);
	sendCommand(this, 'USERDATA', '[{"gender": 1}, {"age": 4}]');
	this.startPlay();
};

p.cmdEVENT = function (arg) {
	if (arg === 'getuserdata') {
		sendCommand(this, 'USERDATA', '[{"gender": 1}, {"age": 4}]');
		this.startPlay();
	}
};

p.cmdSTOP = function () {
	this.close();
};

p.cmdSTART = function (args) {
	var res = args.split(' ');
	var url = querystring.unescape(res[0].trim());
	this.emit('start', url);
};

p.cmdSHUTDOWN = function () {
	this.close(true);
};

p.close = function (internal) {
	if (internal !== true) {
		sendCommand(this, 'SHUTDOWN');
	}

	this.emit('close');
	this.socket.destroy();
};

exports.start = function (streamId) {
	return new Connection(streamId);
};