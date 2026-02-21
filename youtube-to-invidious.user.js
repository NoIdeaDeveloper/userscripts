// ==UserScript==
// @name         YouTube to Invidious Redirector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Redirects YouTube to an Invidious instance, preserving video IDs, search queries, and channel pages
// @author       You
// @match        *://*.youtube.com/*
// @match        *://youtu.be/*
// @match        *://www.youtube-nocookie.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    // Replace this with your preferred Invidious instance
    var invidious = "https://inv.nadeko.net";

    // --- OPTIONAL: URL PARAMETERS ---
    // These are appended to video and page URLs to customise your Invidious experience.
    // Set either to an empty string "" to disable them.
    // For URLs that already have a "?" (e.g. /watch?v=...), parameters start with "&"
    var videoParams = "&related_videos=false&comments=false";
    // For URLs that don't have a "?" (e.g. channel pages), parameters start with "?"
    var pageParams = "?related_videos=false&comments=false";

    // Hide the page immediately so no YouTube content flashes on screen
    var style = document.createElement('style');
    style.textContent = 'body { display: none !important; }';
    document.documentElement.appendChild(style);

    // Grab the full current URL for matching against our rules
    var url = window.location.href;
    var path = window.location.pathname;
    var query = window.location.search;

    // Helper function that performs the redirect.
    // Using replace() means the YouTube page won't appear in your browser history.
    function redirect(newURL) {
        window.location.replace(newURL);
    }

    // Helper function that checks whether a URL already contains our parameters,
    // so we don't keep appending them every time an Invidious page loads (Rules 5 & 6)
    function alreadyHasParams(url, params) {
        // Strip the leading "&" or "?" from params before checking
        return url.includes(params.substring(1));
    }

    // --- RULE 5 & 6: Invidious pages (apply parameters if not already present) ---
    // These rules must come FIRST so we don't double-redirect Invidious URLs
    if (url.startsWith(invidious)) {

        // Rule 5: Invidious video URLs — append video parameters if not already there
        if (path === "/watch" && query.includes("v=")) {
            if (videoParams && !alreadyHasParams(url, videoParams)) {
                redirect(invidious + path + query + videoParams);
            }
        }
        // Rule 6: All other Invidious pages — append page parameters if not already there
        else {
            if (pageParams && !alreadyHasParams(url, pageParams)) {
                redirect(invidious + path + query + pageParams);
            }
        }

        // If parameters are already present, do nothing — stop here
        return;
    }

    // --- RULE 1: YouTube video URLs (e.g. youtube.com/watch?v=ABC123) ---
    if (url.includes("youtube.com/watch") && query.includes("v=")) {
        // Extract the video ID from the query string
        var videoID = new URLSearchParams(query).get("v");
        redirect(invidious + "/watch?v=" + videoID + videoParams);
        return;
    }

    // --- RULE 2: youtu.be short URLs (e.g. youtu.be/ABC123?t=35) ---
    if (window.location.hostname === "youtu.be") {
        // The video ID is the path itself (e.g. "/ABC123"), strip the leading slash
        var shortID = path.substring(1);
        // Preserve any extra parameters like timestamps (?t=35)
        redirect(invidious + "/watch?v=" + shortID + (query ? query.replace("?", "&") : "") + videoParams);
        return;
    }

    // --- RULE 3: YouTube search results (e.g. youtube.com/results?search_query=cats) ---
    if (url.includes("youtube.com/results") && query.includes("search_query=")) {
        // Extract the search query term from the URL
        var searchQuery = new URLSearchParams(query).get("search_query");
        redirect(invidious + "/search?q=" + encodeURIComponent(searchQuery));
        return;
    }

    // --- RULE 7: Standard YouTube embeds (e.g. youtube.com/embed/ABC123) ---
    if (url.includes("youtube.com/embed/")) {
        // Extract everything after "/embed/" to pass along to Invidious
        var embedID = path.replace("/embed/", "");
        redirect(invidious + "/embed/" + embedID);
        return;
    }

    // --- RULE 8: YouTube nocookie embeds (e.g. youtube-nocookie.com/embed/ABC123) ---
    if (url.includes("youtube-nocookie.com/embed/")) {
        var noCookieID = path.replace("/embed/", "");
        redirect(invidious + "/embed/" + noCookieID);
        return;
    }

    // --- RULE 4: All other YouTube pages (e.g. channel pages, homepage) ---
    // This is intentionally last as it's the most broad rule —
    // it catches anything not already matched above
    if (url.includes("youtube.com")) {
        redirect(invidious + path + (query || "") + pageParams);
        return;
    }

})();
