/*
 * pushie
 * http://github.com/yawetse/pushie
 *
 * Copyright (c) 2015 Typesettin. All rights reserved.
 */
'use strict';

var events = require('events'),
	util = require('util'),
	extend = require('util-extend'),
	rand = function () {
		return Math.random().toString(36).substr(2); // remove `0.`
	},
	token = function () {
		return rand() + rand(); // to make it longer
	};
/**
 * A module that represents a pushie object, a componentTab is a page composition tool.
 * @{@link https://github.com/typesettin/pushie}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor pushie
 * @requires module:events
 * @requires module:util-extend
 * @requires module:util
 * @param {object} options configuration options
 * @example 
		pushie_id: token(),
		push_state_support: true,
		replacecallback: function (data) {
			console.log(data);
		},
		popcallback: function (data) {
			console.log(data);
		},
		pushcallback: function (data) {
			console.log(data);
		}
 */
var pushie = function (options) {
	events.EventEmitter.call(this);
	var defaultOptions = {
		pushie_id: token(),
		push_state_support: true,
		replacecallback: function (data) {
			console.log(data);
		},
		popcallback: function (data) {
			console.log(data);
		},
		pushcallback: function (data) {
			console.log(data);
		}
	};
	this.options = extend(defaultOptions, options);
	this.init = this.__init;
	this.replaceHistory = this.__replaceHistory;
	this.pushHistory = this.__pushHistory;
	this.popHistory = this.__popHistory;
	this.init();
	// this.addBinder = this._addBinder;
};

util.inherits(pushie, events.EventEmitter);


/**
 * sets replace state
 * @param {object} options data,title,href
 * @emits replacehistory
 */
pushie.prototype.__replaceHistory = function (options) {
	if (this.options.push_state_support) {
		window.history.replaceState(options.data, options.title, options.href);
	}
	else {
		var newURL = options.href;
		newURL = (newURL.search(window.location.origin) >= 0) ? newURL.replace(window.location.origin, '') : newURL;
		window.sessionStorage.setItem(this.options.pushie_id + newURL, JSON.stringify(options));
		window.location.hash = newURL;
	}
	this.options.replacecallback(options.data);
	this.emit('replacehistory', options);
};

/**
 * sets push state
 * @param {object} options data,title,href
 * @emits pushhistory
 */
pushie.prototype.__pushHistory = function (options) {
	if (this.options.push_state_support) {
		window.history.pushState(options.data, options.title, options.href);
	}
	else {
		var newURL = options.href;
		newURL = (newURL.search(window.location.origin) >= 0) ? newURL.replace(window.location.origin, '') : newURL;
		window.sessionStorage.setItem(this.options.pushie_id + newURL, JSON.stringify(options));
		window.location.hash = newURL;
	}
	this.options.pushcallback(options.data);
	this.emit('pushhistory', options);
};

/**
 * restores pop state
 * @param {object} options data,title,href
 * @emits pushhistory
 */
pushie.prototype.__popHistory = function (options) {
	var popdata;
	if (this.options.push_state_support) {
		this.options.popcallback(options.data);
	}
	else {
		popdata = JSON.parse(window.sessionStorage.getItem(this.options.pushie_id + options.href));
		this.options.popcallback(popdata.data);
	}
	this.emit('pophistory', options);
};

/**
 * sets detects support for history push/pop/replace state and can set initial data
 * @emits initialized
 */
pushie.prototype.__init = function () {
	if (typeof window.history.pushState === 'undefined') {
		this.options.push_state_support = false;
	}
	else {
		this.options.push_state_support = true;
	}

	if (this.options.push_state_support === false) {
		window.addEventListener('hashchange', function () {
			var newURL = window.location.hash.substr(1, window.location.hash.length);

			newURL = (newURL.search(window.location.origin) >= 0) ? newURL.replace(window.location.origin, '') : newURL;
			this.popHistory({
				href: newURL
			});
		}.bind(this));
	}
	else {
		window.addEventListener('popstate', function (event) {
			this.popHistory({
				data: event.state
			});
		}.bind(this));

		window.addEventListener('replacestate', function (event) {
			this.replaceState({
				data: event.state
			});
		}.bind(this));
	}

	if (this.options.initialdata && this.options.initialtitle && this.options.initialhref) {
		this.replaceHistory({
			data: this.options.initialdata,
			title: this.options.initialtitle,
			href: this.options.initialhref
		});
	}
	this.emit('initialized');
};
module.exports = pushie;
