'use strict';

const Message = require('./Message');
const debug = require('debug')('MessageHandler');

let idCounter = 0;
let postedMessages = new Map();

class MessageHandler {
    constructor() {
        this.ready = false;
        this.windowID = null;
        this.messageOrigin = null;
        this.messageSource = null;
        this.pendingMessages = [];
    }

    init(windowID, messageOrigin, messageSource) {
        this.ready = true;
        this.windowID = windowID;
        this.messageOrigin = messageOrigin;
        this.messageSource = messageSource;
        this.postPendingMessages();
    }

    postMessage(type, message) {
        let id = ++idCounter;
        let toPost = {
            type,
            message,
            messageID: id,
            windowID: this.windowID
        };
        let theMessage = new Message(id, toPost);
        if (this.ready) {
            debug('post message', type, message);
            this.messageSource.postMessage(toPost, this.messageOrigin);
            postedMessages.set(id, theMessage);
        } else {
            this.pendingMessages.push(theMessage);
        }
        return theMessage;
    }

    postPendingMessages() {
        for (let message of this.pendingMessages) {
            message.data.windowID = this.windowID;
            this.messageSource.postMessage(message.data, this.messageOrigin);
            postedMessages.set(message.id, message);
        }
    }

    static handleMessage(data) {
        if (!postedMessages.has(data.messageID)) {
            return debug('message not found');
        }
        let message = postedMessages.get(data.messageID);
        if (data.status) {
            if (data.status === 'error') {
                message._reject(data);
                postedMessages.delete(data.messageID);
            } else if (data.status === 'success') {
                message._resolve(data);
                postedMessages.delete(data.messageID);
            } else {
                message.emit(data.status, data);
            }
        } else { // no status is considered a success
            message._resolve(data);
            postedMessages.delete(data.messageID);
        }
    }
}

module.exports = MessageHandler;
