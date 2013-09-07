var config = require('./../config');
var net = require('net');
var EventEmitter = require('events').EventEmitter
var util = require('util');
var _ = require('lodash');


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
	data.shift()
	var args = data.join(' ').replace(/[\r\n]/g, '');
	if (typeof self['cmd' + command]  === 'function') {
		self['cmd' + command].call(self, args);
	}
}

function Connection(streamId) {
	console.log('streamId: ' + streamId);
	EventEmitter.call(this);
	this.streamId = streamId;
	this.socket = net.createConnection(62062, '127.0.0.1');
	console.log('Socket created.');
	this.socket.on('data', onCommand.bind(null, this));

	this.socket.on('connect', function () {
		console.log('send');
		sendCommand(this, 'HELLOBG',  'version=4')
	}.bind(this));

	this.socket.on('end', function () {
		console.log('DONE');
	});
}

util.inherits(Connection, EventEmitter);

var p = Connection.prototype;

p.cmdHELLOTS = function() {
	sendCommand(this, 'START',  ['PID', this.streamId, 0]);
};

p.cmdEVENT = function(arg) {
	if (arg === 'getuserdata') {
		sendCommand(this, 'USERDATA', '[{"gender": 1}, {"age": 4}]');
	}
};

p.cmdSTOP = function() {
	this.close();
};

p.cmdSTART = function(args) {
	var re = /url=([^\s]+)/
	var res = re.exec(args);
	var url = unescape(res[1]);
	this.emit('start', url);
}

p.close = function () {
	sendCommand(this, 'STOP');

	this.emit('close');
	this.socket.destroy();
}

exports.start = function (streamId) {
	return new Connection(streamId);
}