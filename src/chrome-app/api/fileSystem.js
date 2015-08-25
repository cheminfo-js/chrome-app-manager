'use strict';

const debug = require('debug')('fileSystem');
const Storage = require('../storage');

const STORAGE_FS = 'fileSystem.directories';

module.exports = function (data, types) {
    debug('fs call');

    let message = data.message;
    if (!message || typeof message.label !== 'string') {
        data.status = 'error';
        data.message = 'fileSystem actions need a label';
        return this.postMessage(data);
    }

    let prom;
    switch (types[0]) {
        case 'selectDirectory':
            prom = selectDirectory(message.label);
            break;
        case 'readDirectory':
            prom = readDirectory(message.label);
            break;
        case 'readFile':
            prom = readFile(message.label, message.name, message);
            break;
        case 'writeFile':
            prom = writeFile(message.label, message.name, message.data, message);
            break;
        default:
            prom = Promise.reject('Unknown fileSystem action: ' + types[0]);
            break;
    }

    prom.then(res => {
        data.status = 'success';
        data.message = res;
        this.postMessage(data);
    }, err => {
        data.status = 'error';
        data.message = err;
        this.postMessage(data);
    });
};

function selectDirectory(label) {
    debug('select directory: ' + label);
    return chooseEntry({
        type: 'openDirectory'
    }).then(function (entry) {
        let entryID = chrome.fileSystem.retainEntry(entry);
        return saveEntry(label, entryID);
    });
}

function readDirectory(label) {
    debug('read directory: ' + label);
    return getEntry(label).then(function (directory) {
        return new Promise(function (resolve, reject) {
            let reader = directory.createReader();
            let entries = [];
            readEntries();

            function readEntries() {
                reader.readEntries(function (theEntries) {
                    if (theEntries.length === 0) {
                        resolve(entries);
                    } else {
                        entries = entries.concat(theEntries.map(function (entry) {
                            return {
                                name: entry.name,
                                isFile: entry.isFile,
                                isDirectory: entry.isDirectory
                            };
                        }));
                        readEntries();
                    }
                }, reject);
            }
        });
    });
}

function readFile(label, name, {encoding = 'text'} = {}) {
    debug(`read file: ${label} (${name})`);
    return getEntry(label).then(function (directory) {
        return new Promise(function (resolve, reject) {
            directory.getFile(name, {create: false}, function (fileEntry) {
                fileEntry.file(function (file) {
                    let reader = new FileReader();
                    reader.onload = function () {
                        resolve(reader.result);
                    };
                    reader.onerror = function () {
                        reject(reader.error);
                    };
                    if (encoding === 'text') {
                        reader.readAsText(file);
                    } else if (encoding === 'base64') {
                        reader.readAsDataURL(file);
                    } else if (encoding === 'buffer') {
                        reader.readAsArrayBuffer(file);
                    } else if (encoding === 'binary') {
                        reader.readAsBinaryString(file);
                    } else {
                        reject('Unknown encoding: ' + encoding);
                    }
                }, reject);
            }, reject);
        });
    });
}

function writeFile(label, name, data, {
    encoding = 'text',
    exclusive = false,
    type = 'text/plain'
    } = {}) {
    debug(`write file: ${label} (${name})`);
    return getEntry(label).then(function (directory) {
        return new Promise(function (resolve, reject) {
            directory.getFile(name, {create: true, exclusive}, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function () {
                        if (fileWriter.length === 0) { // file has been emptied, now we can write the new data
                            fileWriter.write(getBlob(data, encoding, type));
                        } else {
                            resolve(true);
                        }
                    };
                    fileWriter.onerror = reject;
                    fileWriter.truncate(0); // empty the file
                }, reject);
            }, reject);
        });
    });
}

function getBlob(data, encoding, type) {
    if (encoding === 'text') {
        return new Blob([data], {type});
    } else if (encoding === 'base64') {
        let parts = data.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = atob(parts[1]);
        let uInt8Array = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: contentType});
    } else if (encoding === 'buffer') {
        let uInt8Array = new Uint8Array(data);
        return new Blob([uInt8Array], {type});
    }
}

function saveEntry(label, entryID) {
    return Storage.get(STORAGE_FS).then(function (value) {
        if (!value) {
            value = {
                [label]: entryID
            };
        } else {
            value[label] = entryID;
        }
        return Storage.set(STORAGE_FS, value);
    });
}

function getEntry(label) {
    return Storage.get(STORAGE_FS).then(function (value) {
        if (!value || !value[label]) {
            return selectDirectory(label);
        } else {
            return value[label];
        }
    }).then(restoreEntry);
}

// promise wrappers for chrome.fileSystem API
function chooseEntry(options) {
    return new Promise(function (resolve, reject) {
        chrome.fileSystem.chooseEntry(options, function (entry) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(entry);
            }
        });
    });
}

function restoreEntry(id) {
    return new Promise(function (resolve, reject) {
        chrome.fileSystem.restoreEntry(id, function (entry) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(entry);
            }
        });
    });
}
