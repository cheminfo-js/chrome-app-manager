'use strict';

const store = chrome.storage.local;

exports.get = function (key) {
    return new Promise(function (resolve, reject) {
        store.get(key, function (items) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(items[key]);
            }
        });
    });
};

exports.set = function (key, value) {
    return new Promise(function (resolve, reject) {
        store.set({
            [key]: value
        }, function () {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(true);
            }
        });
    });
};

exports.remove = function (key) {
    return new Promise(function (resolve, reject) {
        store.remove(key, function () {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(true);
            }
        });
    });
};

exports.clear = function () {
    return new Promise(function (resolve, reject) {
        store.clear(function () {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(true);
            }
        });
    });
};
