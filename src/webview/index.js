'use strict';

const Debug = require('debug');
window.Debug = Debug;

const debug = Debug('webview');
const MessageHandler = require('./MessageHandler');

let messageHandler = new MessageHandler();

let started = false;
exports.start = function () {
    if (started) {
        return debug('already started listening');
    }
    debug('start listening');
    started = true;
    window.addEventListener('message', function (event) {
        let data = event.data;
        if (!messageHandler.ready) {
            if (data.type === 'admin.connect') {
                debug('connecting as window ' + data.message);
                messageHandler.init(data.message, event.origin, event.source);
            }
        } else {
            if (event.origin !== messageHandler.messageOrigin) {
                return; // just ignore messages that are not for us
            }
            if (data.type === 'admin.connect') {
                return debug('received connect after connect');
            }
            if (!data.messageID) {
                return debug('received a message without a messageID');
            }
            debug('message received', data);
            MessageHandler.handleMessage(data);
        }
    });
};

exports.postMessage = function (type, message) {
    return messageHandler.postMessage(type, message);
};
