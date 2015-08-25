'use strict';

const Debug = require('debug');
if (window.DebugNS) {
    Debug.enable(window.DebugNS);
}

const MessageHandler = require('./MessageHandler');

exports.initConnection = function initConnection(id) {
    let element = document.getElementById(id);
    if (!element) throw new Error(`Element #${id} not found in the DOM`);
    let handler = new MessageHandler(element);

    // register here the handlers from ./api
    handler.register('fileSystem', require('./api/fileSystem'));

    return handler;
};
