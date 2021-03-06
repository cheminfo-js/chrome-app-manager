(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["ChromeAppManager"] = factory();
	else
		root["ChromeAppManager"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Debug = __webpack_require__(1);
	if (window.DebugNS) {
	    Debug.enable(window.DebugNS);
	}

	var MessageHandler = __webpack_require__(4);

	exports.initConnection = function initConnection(id) {
	    var element = document.getElementById(id);
	    if (!element) throw new Error('Element #' + id + ' not found in the DOM');
	    var handler = new MessageHandler(element);

	    // register here the handlers from ./api
	    handler.register('fileSystem', __webpack_require__(5));

	    return handler;
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(2);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(3);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var debug = __webpack_require__(1)('chrome-app');

	var messageHandlers = new Map();

	var id = 0;

	window.addEventListener('message', function (event) {
	    var data = event.data;
	    if (!data.windowID) {
	        return debug('received a message without windowID', data);
	    }
	    if (!data.type) {
	        return debug('received a message without type', data);
	    }
	    if (!messageHandlers.has(data.windowID)) {
	        return debug('window with id ' + data.windowID + ' not found', data);
	    }
	    messageHandlers.get(data.windowID).handleMessage(data);
	});

	var MessageHandler = (function () {
	    function MessageHandler(theWindow) {
	        var _this = this;

	        _classCallCheck(this, MessageHandler);

	        debug('creating message handler');
	        this.window = null;
	        this.windowID = ++id;
	        this.registeredHandlers = new Map();
	        messageHandlers.set(this.windowID, this);
	        theWindow.addEventListener('contentload', function () {
	            // If the child was reloaded or navigated to a new page, we must reconnect
	            _this.disconnect();
	            debug('establish connection');
	            _this.window = theWindow.contentWindow;
	            _this.connect();
	        });
	    }

	    _createClass(MessageHandler, [{
	        key: 'connect',
	        value: function connect() {
	            var _this2 = this;

	            debug('connect');
	            this.postMessage({ type: 'admin.connect', message: this.windowID });
	            this.connectionInterval = setInterval(function () {
	                _this2.postMessage({ type: 'admin.connect', message: _this2.windowID });
	            }, 500);
	        }
	    }, {
	        key: 'disconnect',
	        value: function disconnect() {
	            this.clearConnectionInterval();
	        }
	    }, {
	        key: 'clearConnectionInterval',
	        value: function clearConnectionInterval() {
	            if (this.connectionInterval) {
	                clearInterval(this.connectionInterval);
	                this.connectionInterval = null;
	            }
	        }
	    }, {
	        key: 'postMessage',
	        value: function postMessage(message) {
	            this.window.postMessage(message, '*');
	        }
	    }, {
	        key: 'handleMessage',
	        value: function handleMessage(data) {
	            var _this3 = this;

	            debug('receive message', data);
	            var types = data.type.split('.');
	            var type = types.shift();
	            switch (type) {
	                case 'admin':
	                    if (types[0] === 'connect') {
	                        this.clearConnectionInterval();
	                    }
	                    break;
	                case 'test':
	                    data.status = 'warn';
	                    this.postMessage(data);
	                    data.message *= 100;
	                    this.postMessage(data);
	                    setTimeout(function () {
	                        data.status = 'success';
	                        data.message = 'hello';
	                        _this3.postMessage(data);
	                    }, 300);
	                    break;
	                default:
	                    if (this.registeredHandlers.has(type)) {
	                        this.registeredHandlers.get(type).call(this, data, types);
	                    } else {
	                        var message = 'no handler registered for type ' + type;
	                        debug(message);
	                        data.status = 'error';
	                        data.message = message;
	                        this.postMessage(data);
	                    }
	                    break;
	            }
	        }
	    }, {
	        key: 'register',
	        value: function register(type, callback) {
	            this.registeredHandlers.set(type, callback);
	        }
	    }]);

	    return MessageHandler;
	})();

	module.exports = MessageHandler;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var debug = __webpack_require__(1)('fileSystem');
	var Storage = __webpack_require__(6);

	var STORAGE_FS = 'fileSystem.directories';

	module.exports = function (data, types) {
	    var _this = this;

	    debug('fs call');

	    var message = data.message;
	    if (!message || typeof message.label !== 'string') {
	        data.status = 'error';
	        data.message = 'fileSystem actions need a label';
	        return this.postMessage(data);
	    }

	    var prom = undefined;
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

	    prom.then(function (res) {
	        data.status = 'success';
	        data.message = res;
	        _this.postMessage(data);
	    }, function (err) {
	        data.status = 'error';
	        data.message = err;
	        _this.postMessage(data);
	    });
	};

	function selectDirectory(label) {
	    debug('select directory: ' + label);
	    return chooseEntry({
	        type: 'openDirectory'
	    }).then(function (entry) {
	        var entryID = chrome.fileSystem.retainEntry(entry);
	        return saveEntry(label, entryID);
	    });
	}

	function readDirectory(label) {
	    debug('read directory: ' + label);
	    return getEntry(label).then(function (directory) {
	        return new Promise(function (resolve, reject) {
	            var reader = directory.createReader();
	            var entries = [];
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

	function readFile(label, name) {
	    var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	    var _ref$encoding = _ref.encoding;
	    var encoding = _ref$encoding === undefined ? 'text' : _ref$encoding;

	    debug('read file: ' + label + ' (' + name + ')');
	    return getEntry(label).then(function (directory) {
	        return new Promise(function (resolve, reject) {
	            directory.getFile(name, { create: false }, function (fileEntry) {
	                fileEntry.file(function (file) {
	                    var reader = new FileReader();
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

	function writeFile(label, name, data) {
	    var _ref2 = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	    var _ref2$encoding = _ref2.encoding;
	    var encoding = _ref2$encoding === undefined ? 'text' : _ref2$encoding;
	    var _ref2$exclusive = _ref2.exclusive;
	    var exclusive = _ref2$exclusive === undefined ? false : _ref2$exclusive;
	    var _ref2$type = _ref2.type;
	    var type = _ref2$type === undefined ? 'text/plain' : _ref2$type;

	    debug('write file: ' + label + ' (' + name + ')');
	    return getEntry(label).then(function (directory) {
	        return new Promise(function (resolve, reject) {
	            directory.getFile(name, { create: true, exclusive: exclusive }, function (fileEntry) {
	                fileEntry.createWriter(function (fileWriter) {
	                    fileWriter.onwriteend = function () {
	                        if (fileWriter.length === 0) {
	                            // file has been emptied, now we can write the new data
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
	        return new Blob([data], { type: type });
	    } else if (encoding === 'base64') {
	        var parts = data.split(';base64,');
	        var contentType = parts[0].split(':')[1];
	        var raw = atob(parts[1]);
	        var uInt8Array = new Uint8Array(raw.length);
	        for (var i = 0; i < raw.length; i++) {
	            uInt8Array[i] = raw.charCodeAt(i);
	        }
	        return new Blob([uInt8Array], { type: contentType });
	    } else if (encoding === 'buffer') {
	        var uInt8Array = new Uint8Array(data);
	        return new Blob([uInt8Array], { type: type });
	    }
	}

	function saveEntry(label, entryID) {
	    return Storage.get(STORAGE_FS).then(function (value) {
	        if (!value) {
	            value = _defineProperty({}, label, entryID);
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

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var store = chrome.storage.local;

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
	        store.set(_defineProperty({}, key, value), function () {
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

/***/ }
/******/ ])
});
;