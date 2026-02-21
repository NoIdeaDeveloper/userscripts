// ==UserScript==
// @name         Reddit to Redlib Redirector
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Redirects Reddit to a private Redlib instance, preserving the URL path
// @author       You
// @match        *://www.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Immediately hide the page body so no Reddit content flashes on screen
    // while the redirect is processing
    var style = document.createElement('style');
    style.textContent = 'body { display: none !important; }';
    document.documentElement.appendChild(style);

    // Build the new Redlib URL using Reddit's current path and query string
    var destination = "https://redlib.perennialte.ch";
    var currentPath = window.location.pathname;
    var currentQuery = window.location.search;
    var newURL = destination + currentPath + currentQuery;

    // Redirect to Redlib — the hidden body means you'll never see Reddit content
    window.location.replace(newURL);

})();
