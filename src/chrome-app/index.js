'use strict';

const Debug = require('debug');

Debug.enable('*');
Debug.colors = ['lightseagreen', 'forestgreen', 'goldenrod'];

const MessageHandler = require('./MessageHandler');

exports.initConnection = function initConnection(id) {
    let element = document.getElementById(id);
    if (!element) throw new Error(`Element #${id} not found in the DOM`);
    let handler = new MessageHandler(element.contentWindow);

    handler.register('fileSystem', require('./api/fileSystem'));

    return handler;
};
