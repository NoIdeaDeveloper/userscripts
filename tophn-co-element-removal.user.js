// ==UserScript==
// @name         TopHN Element Remover
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Remove specific div elements from TopHN
// @author       You
// @match        https://www.tophn.co/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove the target elements
    function removeElements() {
        // Select all div elements with the specific parent container classes
        // This targets: <div class="mt-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 rounded">
        // The entire container including the background box will be removed
        const targetDivs = document.querySelectorAll('div.mt-2.px-3.py-2.bg-neutral-50.dark\\:bg-neutral-900.rounded');
        
        // Loop through each matching element and remove it from the page
        targetDivs.forEach(function(element) {
            element.remove();
        });
    }

    // Run the function when the page first loads
    removeElements();

    // Create a MutationObserver to watch for newly added elements
    // This ensures that any dynamically added elements matching our criteria are also removed
    const observer = new MutationObserver(function(mutations) {
        // When DOM changes are detected, run the removal function again
        removeElements();
    });

    // Configure what mutations to watch for
    const observerConfig = {
        childList: true,      // Watch for added/removed child elements
        subtree: true,        // Watch all descendants, not just direct children
        characterData: false  // Don't watch for text content changes
    };

    // Start observing the entire document body for changes
    observer.observe(document.body, observerConfig);
})();
