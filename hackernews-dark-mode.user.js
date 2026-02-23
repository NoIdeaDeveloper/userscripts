// ==UserScript==
// @name         Hacker News — Dark Mode & Reddit-Style Comments
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds dark mode, Reddit-style colour-coded comment threads, and a next-parent navigation button
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
    // colour coding, and the floating navigation button.
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

        /* FIX 1: Force ALL text inside comment rows to be light coloured.
           HN sometimes inlines color="black" or color="#000000" directly on
           <font> tags inside comments, which overrides class-level CSS.
           Targeting every element inside .comtr ensures nothing slips through. */
        .comtr * {
            color: #d7dadc !important;
        }

        /* Re-apply specific colour overrides that the wildcard above would flatten */

        /* Commenter username — orange accent */
        .hnuser, a.hnuser {
            color: #ff6314 !important;
            font-weight: 600;
        }

        /* Comment age / timestamp and reply link — muted grey */
        .age a, .reply a {
            color: #818384 !important;
        }
        .reply a:hover, .age a:hover {
            color: #d7dadc !important;
        }

        /* Links inside comment bodies — blue accent */
        .comment a {
            color: #4fbdff !important;
        }

        /* Vote arrow buttons — keep them visible on dark background */
        .votearrow {
            filter: invert(60%) !important;
        }

        /* The footer bar background */
        #hnmain > tbody > tr:last-child td {
            background-color: #272729 !important;
        }

        /* FOOTER FIX: HN's footer contains a <span class="yclinks"> with plain <a> tags
           and also bare text nodes. The wildcard selector ensures every element inside
           the footer row is forced to white, overriding any inherited grey. */
        #hnmain > tbody > tr:last-child td,
        #hnmain > tbody > tr:last-child td *,
        .yclinks,
        .yclinks * {
            color: #d7dadc !important;
        }
        .yclinks a:hover {
            color: #ffffff !important;
            text-decoration: underline;
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

        /* --- COLLAPSIBLE COMMENT TEXTAREA ---
           The main reply textarea starts compact at 4 rows tall.
           When the user clicks into it, it smoothly expands to 8 rows.
           HN's default textarea font is roughly 16px with ~1.4 line-height,
           so 1 row ≈ 22px. We add a little padding on top to account for
           the textarea's internal padding (~8px top + 8px bottom = 16px). */

        /* Collapsed state: 4 rows = (4 × 22px) + 16px padding = ~104px */
        textarea#text.hn-textarea-collapsed {
            height: 104px !important;
            min-height: 104px !important;
            max-height: 104px !important;
            overflow: hidden !important;
            resize: none !important;
            transition: height 0.2s ease, max-height 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
            opacity: 0.8;
        }

        /* Expanded state: 8 rows = (8 × 22px) + 16px padding = ~192px.
           An orange focus ring signals that the field is active. */
        textarea#text.hn-textarea-expanded {
            height: 192px !important;
            min-height: 192px !important;
            max-height: none !important;
            overflow: auto !important;
            resize: vertical !important;
            transition: height 0.2s ease, max-height 0.2s ease, box-shadow 0.2s ease;
            cursor: text;
            opacity: 1;
            box-shadow: 0 0 0 2px #ff6314 !important;
        }

        /* --- COMMENT DEPTH COLOUR CODING ---
           The coloured border is now applied to the .commtext div (the actual
           comment content block) rather than the outer table. This places the
           border right beside the comment text instead of at the screen edge. */
        .comtr .commtext {
            padding-left: 8px !important;
            border-left: 3px solid transparent;
        }

        /* Each depth level gets its own colour. The data-depth attribute is set
           by our JavaScript below based on HN's indentation spacer widths. */
        [data-depth="0"] .commtext { border-left-color: transparent !important; }
        [data-depth="1"] .commtext { border-left-color: #ff4500 !important; }
        [data-depth="2"] .commtext { border-left-color: #0dd3bb !important; }
        [data-depth="3"] .commtext { border-left-color: #ffb000 !important; }
        [data-depth="4"] .commtext { border-left-color: #46d160 !important; }
        [data-depth="5"] .commtext { border-left-color: #cc69b9 !important; }
        [data-depth="6"] .commtext { border-left-color: #0079d3 !important; }
        [data-depth="7"] .commtext { border-left-color: #ff585b !important; }
        /* Cycle back for very deep threads */
        [data-depth="8"] .commtext { border-left-color: #ff4500 !important; }
        [data-depth="9"] .commtext { border-left-color: #0dd3bb !important; }

        /* --- FLOATING NEXT-PARENT BUTTON ---
           A circular button fixed to the bottom-right corner of the screen.
           Clicking it scrolls down to the next top-level (depth 0) comment. */
        #hn-next-parent-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: #ff6314;
            color: #ffffff;
            font-size: 22px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            z-index: 9999;
            border: none;
            transition: background-color 0.15s, transform 0.1s;
            user-select: none;
        }

        #hn-next-parent-btn:hover {
            background-color: #e55a10;
            transform: scale(1.08);
        }

        #hn-next-parent-btn:active {
            transform: scale(0.95);
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
        // each comment is nested. We read that width and convert it to a depth
        // number, stored as a data-depth attribute on each comment row so our
        // CSS colour rules can target it.
        // =====================================================================

        // Grab all comment rows — HN gives each one the class "comtr"
        var commentRows = document.querySelectorAll('.comtr');

        // We'll track the indent widths we've seen to map them to depth levels
        var indentLevels = [];

        commentRows.forEach(function (row) {
            // HN uses a spacer image whose pixel width encodes the indent depth
            var indentImg = row.querySelector('td.ind img');
            var indentWidth = indentImg ? parseInt(indentImg.getAttribute('width'), 10) : 0;

            // Build a sorted, deduplicated list of all known indent widths
            if (!indentLevels.includes(indentWidth)) {
                indentLevels.push(indentWidth);
                indentLevels.sort(function (a, b) { return a - b; });
            }

            // The depth is simply the position of this width in the sorted list
            var depth = indentLevels.indexOf(indentWidth);

            // Store the depth on the row so our CSS colour rules can target it
            row.setAttribute('data-depth', depth);
        });


        // =====================================================================
        // SECTION 4: COLLAPSIBLE COMMENT TEXTAREA
        // Finds the main comment submission textarea (id="text") and starts it
        // in a compact collapsed state. When the user clicks on it, it expands
        // smoothly to full writing height. If the user clicks away without
        // typing anything, it collapses back down.
        // =====================================================================

        // HN's main comment textarea has the id "text"
        var commentTextarea = document.querySelector('textarea#text');

        if (commentTextarea) {
            // Start the textarea in the collapsed state
            commentTextarea.classList.add('hn-textarea-collapsed');

            // When the user clicks into the textarea, expand it to full size
            commentTextarea.addEventListener('focus', function () {
                commentTextarea.classList.remove('hn-textarea-collapsed');
                commentTextarea.classList.add('hn-textarea-expanded');
            });

            // When the user clicks away (blur), check if the textarea is empty.
            // If it is, collapse it back — no point showing a large empty box.
            // If the user has typed something, leave it expanded.
            commentTextarea.addEventListener('blur', function () {
                if (commentTextarea.value.trim() === '') {
                    commentTextarea.classList.remove('hn-textarea-expanded');
                    commentTextarea.classList.add('hn-textarea-collapsed');
                }
            });
        }


        // =====================================================================
        // SECTION 5: FLOATING NEXT-PARENT BUTTON
        // Creates a circular arrow button fixed to the bottom-right of the screen.
        // Each click finds the next top-level comment (data-depth="0") that is
        // below the current scroll position and smoothly scrolls to it.
        // =====================================================================

        // Create the button element
        var btn = document.createElement('button');
        btn.id = 'hn-next-parent-btn';
        btn.title = 'Next top-level comment';
        btn.textContent = '↓'; // Down arrow character
        document.body.appendChild(btn);

        // Collect all top-level comment rows (depth 0) into an array for easy lookup
        var parentComments = Array.from(document.querySelectorAll('.comtr[data-depth="0"]'));

        btn.addEventListener('click', function () {
            // Get the current vertical scroll position, with a small offset so
            // a comment already near the top still counts as "passed"
            var scrollY = window.scrollY + 10;

            // Find the first parent comment whose top edge is below the current scroll
            var nextParent = null;
            for (var i = 0; i < parentComments.length; i++) {
                var topEdge = parentComments[i].getBoundingClientRect().top + window.scrollY;
                if (topEdge > scrollY) {
                    nextParent = parentComments[i];
                    break;
                }
            }

            if (nextParent) {
                // Scroll smoothly so the next parent comment lands near the top of the screen
                nextParent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // If there are no more parent comments below, scroll to the very bottom
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });

    }); // end DOMContentLoaded

})();
