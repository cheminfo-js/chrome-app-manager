'use strict';

let debug = require('debug')('fileSystem');

module.exports = function (data, type) {
    debug('fs call', data);

    var that = this;
    chrome.fileSystem.chooseEntry({
        type: 'openDirectory'
    }, function (entry) {
        if (chrome.runtime.lastError) {
            data.status = 'error';
            data.message = chrome.runtime.lastError;
            return that.postMessage(data);
        }
        console.log(entry);
    });

};
