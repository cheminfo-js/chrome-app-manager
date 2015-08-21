'use strict';

const EventEmitter = require('events').EventEmitter;

class Message extends EventEmitter {
    constructor(id, data) {
        super();
        let self = this;
        this.id = id;
        this.data = data;
        let prom = new Promise(function (resolve, reject) {
            self._resolve = resolve;
            self._reject = reject;
        });
        this.then = function (onResolve, onReject) {
            return prom.then(onResolve, onReject);
        };
    }
}

module.exports = Message;
