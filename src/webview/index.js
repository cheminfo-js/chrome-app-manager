'use strict';

const Debug = require('debug');

Debug.enable('*');
Debug.colors = ['dodgerblue', 'darkorchid', 'crimson'];

const debug = Debug('webview');
const MessageHandler = require('./MessageHandler');

let messageHandler = new MessageHandler();

exports.start = function () {
    debug('start listening');
    window.addEventListener('message', function (event) {
        let data = event.data;
        debug('message received', data);
        if (!messageHandler.ready) {
            if (data.type === 'admin.connect') {
                debug('connecting as window ' + data.message);
                messageHandler.init(data.message, event.origin, event.source);
            } else {
                return debug('received a message before connection');
            }
        } else {
            if (!data.messageID) {
                return debug('received a message without a messageID')
            }
            messageHandler.handleMessage(data);
        }
    });
};

exports.postMessage = function (type, message) {
    return messageHandler.postMessage(type, message);
};
