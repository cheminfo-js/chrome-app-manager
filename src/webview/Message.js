'use strict';

const EventEmitter = require('events').EventEmitter;

class Message extends EventEmitter {
    constructor(id, data) {
        super();
        this.id = id;
        this.data = data;
        let prom = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        this.then = function (onResolve, onReject) {
            return prom.then(onResolve, onReject);
        };
    }
}

module.exports = Message;
