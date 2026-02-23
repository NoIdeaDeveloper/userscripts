// ==UserScript==
// @name         Hacker News — Dark Mode & Reddit-Style Comments
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds dark mode to Hacker News and brings Reddit-style colour-coded, collapsible comment threads
// @author       You
// @match        *://news.ycombinator.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // SECTION 1: INJECT CSS
    // All visual styling is handled here — dark mode colours, comment indent
    // colours, collapse animations, and button styles.
    // =========================================================================
    var style = document.createElement('style');
    style.textContent = `

        /* --- DARK MODE BASE --- */
        /* Override HN's default white/orange with a dark background palette */
        html, body {
            background-color: #1a1a1b !important;
            color: #d7dadc !important;
        }

        /* The main page table that wraps everything */
        body > center > table,
        body > center > table td {
            background-color: #1a1a1b !important;
        }

        /* The orange header bar — darken it to a deep charcoal */
        #hnmain > tbody > tr:first-child td,
        .pagetop,
        .pagetop a,
        td[bgcolor="#ff6600"] {
            background-color: #272729 !important;
            color: #d7dadc !important;
        }

        /* Nav links in the header */
        .pagetop a {
            color: #818384 !important;
        }
        .pagetop a:hover {
            color: #d7dadc !important;
        }

        /* The thin spacer line between header and content */
        .pagetop + tr td {
            background-color: #343536 !important;
        }

        /* Story list rows */
        .athing {
            background-color: #1a1a1b !important;
        }

        /* Story titles */
        .titleline > a,
        .titleline > a:visited {
            color: #d7dadc !important;
            font-size: 14px !important;
        }

        /* Site domain label next to story title e.g. (github.com) */
        .sitebit a, .sitestr {
            color: #818384 !important;
        }

        /* Story metadata row — points, author, age, comments link */
        .subtext, .subtext a {
            color: #818384 !important;
        }

        /* Hover colour for metadata links */
        .subtext a:hover {
            color: #d7dadc !important;
            text-decoration: underline;
        }

        /* Vote arrow buttons */
        .votearrow {
            filter: invert(60%) !important;
        }

        /* Comment text */
        .comment, .comment p {
            color: #d7dadc !important;
        }

        /* Commenter username */
        .hnuser, a.hnuser {
            color: #ff6314 !important;
            font-weight: 600;
        }

        /* Comment age / timestamp */
        .age a {
            color: #818384 !important;
        }

        /* "reply" link inside comments */
        .reply a {
            color: #818384 !important;
        }
        .reply a:hover {
            color: #d7dadc !important;
        }

        /* Links inside comment bodies */
        .comment a {
            color: #4fbdff !important;
        }

        /* The footer bar */
        #hnmain > tbody > tr:last-child td {
            background-color: #272729 !important;
        }

        /* Text input fields (e.g. search, submit) */
        input, textarea {
            background-color: #272729 !important;
            color: #d7dadc !important;
            border: 1px solid #343536 !important;
        }

        /* Buttons */
        input[type="submit"] {
            background-color: #343536 !important;
            color: #d7dadc !important;
            border: 1px solid #818384 !important;
            cursor: pointer;
        }

        /* More / pagination link */
        a.morelink {
            color: #ff6314 !important;
        }

        /* --- COMMENT DEPTH COLOUR CODING --- */
        /* Each indent level gets a left border in a distinct colour,
           mimicking Reddit mobile's thread colour system */
        .comment-tree .comtr { position: relative; }

        [data-depth="0"] > td > .comment-indent-marker { border-left: 3px solid transparent; }
        [data-depth="1"] > td > table { border-left: 3px solid #ff4500; padding-left: 6px; }
        [data-depth="2"] > td > table { border-left: 3px solid #0dd3bb; padding-left: 6px; }
        [data-depth="3"] > td > table { border-left: 3px solid #ffb000; padding-left: 6px; }
        [data-depth="4"] > td > table { border-left: 3px solid #46d160; padding-left: 6px; }
        [data-depth="5"] > td > table { border-left: 3px solid #cc69b9; padding-left: 6px; }
        [data-depth="6"] > td > table { border-left: 3px solid #0079d3; padding-left: 6px; }
        [data-depth="7"] > td > table { border-left: 3px solid #ff585b; padding-left: 6px; }
        /* Cycle back for very deep threads */
        [data-depth="8"] > td > table { border-left: 3px solid #ff4500; padding-left: 6px; }
        [data-depth="9"] > td > table { border-left: 3px solid #0dd3bb; padding-left: 6px; }

        /* --- COLLAPSE BUTTON --- */
        /* A small clickable indicator injected next to each comment */
        .hn-collapse-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            background-color: #272729;
            border: 1px solid #343536;
            color: #818384;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            margin-right: 6px;
            vertical-align: middle;
            user-select: none;
            flex-shrink: 0;
            transition: background-color 0.15s, color 0.15s;
            line-height: 1;
        }

        .hn-collapse-btn:hover {
            background-color: #343536;
            color: #d7dadc;
        }

        /* When a thread is collapsed, show a "+" icon */
        .hn-collapse-btn.collapsed {
            color: #ff6314;
            border-color: #ff6314;
        }

        /* The collapsed child rows are hidden */
        .hn-collapsed {
            display: none !important;
        }

        /* Faded "N replies hidden" indicator shown when a thread is collapsed */
        .hn-collapsed-indicator {
            font-size: 11px;
            color: #818384;
            font-style: italic;
            margin-left: 4px;
        }

        /* Smooth collapse transition for comment bodies */
        .commtext {
            transition: opacity 0.1s;
        }

    `;
    document.documentElement.appendChild(style);


    // =========================================================================
    // SECTION 2: WAIT FOR THE PAGE TO LOAD BEFORE RUNNING JS
    // document-start fires before the DOM exists, so we wait for DOMContentLoaded
    // =========================================================================
    document.addEventListener('DOMContentLoaded', function () {

        // Only run the comment features on thread/item pages, not the front page
        var isItemPage = window.location.pathname === '/item';
        if (!isItemPage) return;

        // =====================================================================
        // SECTION 3: CALCULATE COMMENT DEPTH
        // HN uses indentation via a spacer <img> whose width tells us how deep
        // each comment is nested. We use this to assign a data-depth attribute
        // to each comment row, which our CSS colour coding then targets.
        // =====================================================================

        // Grab all comment rows — HN gives each one the class "comtr"
        var commentRows = document.querySelectorAll('.comtr');

        // We'll track the indent widths we've seen to map them to depth levels
        var indentLevels = [];

        commentRows.forEach(function (row) {
            // HN uses a spacer image whose width encodes the indent depth
            var indentImg = row.querySelector('td.ind img');
            var indentWidth = indentImg ? parseInt(indentImg.getAttribute('width'), 10) : 0;

            // Build a sorted, deduplicated list of known indent widths
            if (!indentLevels.includes(indentWidth)) {
                indentLevels.push(indentWidth);
                indentLevels.sort(function (a, b) { return a - b; });
            }

            // The depth is the position of this width in the sorted list
            var depth = indentLevels.indexOf(indentWidth);

            // Store the depth on the row so CSS can target it
            row.setAttribute('data-depth', depth);
        });


        // =====================================================================
        // SECTION 4: INJECT COLLAPSE BUTTONS
        // For every comment, we inject a small [−] button before the username.
        // Clicking it collapses all child comments in that thread.
        // =====================================================================

        commentRows.forEach(function (row) {
            // Find the "comhead" span which contains the author, age, etc.
            var comhead = row.querySelector('.comhead');
            if (!comhead) return; // Skip deleted/dead comments

            // Create the collapse toggle button
            var btn = document.createElement('span');
            btn.className = 'hn-collapse-btn';
            btn.textContent = '−'; // minus sign (not a hyphen)
            btn.title = 'Collapse thread';

            // Insert the button as the very first element in the comment header
            comhead.insertBefore(btn, comhead.firstChild);

            // -----------------------------------------------------------------
            // COLLAPSE LOGIC
            // When the button is clicked, find all subsequent comment rows
            // that are at a greater depth (i.e. children of this comment)
            // and toggle their visibility.
            // -----------------------------------------------------------------
            btn.addEventListener('click', function (e) {
                e.stopPropagation(); // Don't bubble up to parent thread toggles

                var thisDepth = parseInt(row.getAttribute('data-depth'), 10);
                var isCollapsed = btn.classList.contains('collapsed');

                // Walk through all comment rows after this one
                var next = row.nextElementSibling;
                var childCount = 0;

                while (next && next.classList.contains('comtr')) {
                    var nextDepth = parseInt(next.getAttribute('data-depth'), 10);

                    // Stop when we reach a comment at the same or shallower depth
                    if (nextDepth <= thisDepth) break;

                    if (isCollapsed) {
                        // Re-expanding: show only direct children (depth + 1),
                        // deeper children stay hidden if their parent is still collapsed
                        var parentCollapseBtn = next.querySelector('.hn-collapse-btn');
                        if (nextDepth === thisDepth + 1) {
                            next.classList.remove('hn-collapsed');
                        }
                        // If this child's own collapse button is active, keep its children hidden
                    } else {
                        // Collapsing: hide all descendants
                        next.classList.add('hn-collapsed');
                        childCount++;
                    }

                    next = next.nextElementSibling;
                }

                if (isCollapsed) {
                    // Switch back to expanded state
                    btn.classList.remove('collapsed');
                    btn.textContent = '−';
                    btn.title = 'Collapse thread';

                    // Remove the "N replies hidden" indicator if present
                    var indicator = row.querySelector('.hn-collapsed-indicator');
                    if (indicator) indicator.remove();

                } else {
                    // Switch to collapsed state
                    btn.classList.add('collapsed');
                    btn.textContent = '+';
                    btn.title = 'Expand thread';

                    // Show how many replies were hidden
                    if (childCount > 0) {
                        var indicator = document.createElement('span');
                        indicator.className = 'hn-collapsed-indicator';
                        indicator.textContent = childCount + ' repl' + (childCount === 1 ? 'y' : 'ies') + ' hidden';
                        comhead.appendChild(indicator);
                    }
                }
            });
        });

    }); // end DOMContentLoaded

})();
