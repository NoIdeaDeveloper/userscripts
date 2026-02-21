// ==UserScript==
// @name         Reddit to Redlib Redirector
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Redirects Reddit to a private Redlib instance, preserving the URL path
// @author       You
// @match        *://www.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var destination = "https://redlib.perennialte.ch";
    var currentPath = window.location.pathname;
    var currentQuery = window.location.search;
    var newURL = destination + currentPath + currentQuery;

    // Using window.location.replace() at document-start means the browser
    // will abort loading Reddit's page almost immediately and jump straight
    // to Redlib instead, minimising any flash of Reddit content
    window.location.replace(newURL);

})();
