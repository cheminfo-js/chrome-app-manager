'use strict';

const debug = require('debug')('chrome-app');

const messageHandlers = new Map();

let id = 0;

window.addEventListener('message', function (event) {
    let data = event.data;
    if (!data.windowID) {
        return debug('received a message without windowID', data);
    }
    if (!data.type) {
        return debug('received a message without type', data);
    }
    if (!messageHandlers.has(data.windowID)) {
        return debug(`window with id ${data.windowID} not found`, data);
    }
    messageHandlers.get(data.windowID).handleMessage(data);
});

class MessageHandler {
    constructor(theWindow) {
        debug('creating message handler');
        this.window = null;
        this.windowID = ++id;
        this.registeredHandlers = new Map();
        messageHandlers.set(this.windowID, this);
        theWindow.addEventListener('contentload', () => {
            debug('establish connection');
            this.window = theWindow.contentWindow;
            this.connect();
        });
    }

    connect() {
        debug('connect');
        this.postMessage({type: 'admin.connect', message: this.windowID});
        this.connectionInterval = setInterval(() => {
            this.postMessage({type: 'admin.connect', message: this.windowID});
        }, 500);
    }

    postMessage(message) {
        debug('post message', message);
        this.window.postMessage(message, '*');
    }

    handleMessage(data) {
        debug('receive message', data);
        let types = data.type.split('.');
        let type = types.shift();
        switch (type) {
            case 'admin':
                if (types[0] === 'connect') {
                    clearInterval(this.connectionInterval);
                    this.connectionInterval = null;
                }
                break;
            case 'test':
                data.status = 'warn';
                this.postMessage(data);
                data.message *= 100;
                this.postMessage(data);
                setTimeout(() => {
                    data.status = 'success';
                    data.message = 'hello';
                    this.postMessage(data);
                }, 300);
                break;
            default:
                if (this.registeredHandlers.has(type)) {
                    this.registeredHandlers.get(type).call(this, data, types);
                } else {
                    let message = 'no handler registered for type ' + type;
                    debug(message);
                    data.status = 'error';
                    data.message = message;
                    this.postMessage(data);
                }
                break;
        }
    }

    register(type, callback) {
        this.registeredHandlers.set(type, callback);
    }
}

module.exports = MessageHandler;
