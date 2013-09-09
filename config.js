'use strict';

var config = {};

config.set = function (data) {
    console.log(data);
    config.playlist_url = data.playlist_url;
    config.refresh = data.refresh || 30;
    config.port = data.port || 9980;
    config.local_domain = data.local_domain;
};

module.exports = config;