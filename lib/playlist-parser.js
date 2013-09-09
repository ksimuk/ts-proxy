'use strict';
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

exports.parse = parse;