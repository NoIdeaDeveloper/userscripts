// ==UserScript==
// @name         Reddit to Redlib Redirector
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Redirects Reddit to a private Redlib instance, preserving the URL path
// @author       You
// @match        *://www.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    // The Redlib instance to redirect to
    var destination = "https://redlib.perennialte.ch";

    // --- URL MAPPING ---
    // Get the path from the current Reddit URL (e.g. "/r/python/comments/abc123/")
    var currentPath = window.location.pathname;

    // Get any query string from the current URL (e.g. "?sort=new")
    // This will be an empty string if there is no query string
    var currentQuery = window.location.search;

    // Build the new URL by combining the Redlib base with Reddit's path and query
    // Example: https://www.reddit.com/r/python/?sort=new
    //       →  https://redlib.perennialte.ch/r/python/?sort=new
    var newURL = destination + currentPath + currentQuery;

    // Perform the redirect — replace() is used so the Reddit page won't appear
    // in your browser history (pressing Back won't take you back to Reddit)
    window.location.replace(newURL);

})();
