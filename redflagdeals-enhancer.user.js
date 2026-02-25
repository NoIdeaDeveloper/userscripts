// ==UserScript==
// @name         RedFlagDeals Forum — Dark Mode, Ad Removal & Debloat
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes ads and tracking, enables dark mode, and strips bloat from forums.redflagdeals.com
// @author       You
// @match        *://forums.redflagdeals.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // SECTION 1: BLOCK TRACKING SCRIPTS BEFORE THEY LOAD
    // At document-start we can intercept and cancel requests for known ad and
    // tracking domains by overriding the createElement function to prevent
    // <script> tags for those domains from ever being inserted into the DOM.
    // =========================================================================

    // List of ad/tracking domains to block.
    // Scripts whose src contains any of these strings will be suppressed.
    var blockedDomains = [
        'googlesyndication.com',   // Google AdSense display ads
        'doubleclick.net',         // Google ad serving / DoubleClick
        'googletagmanager.com',    // Google Tag Manager (tracks user behaviour)
        'googletagservices.com',   // Google ad tag services
        'google-analytics.com',    // Google Analytics tracking
        'analytics.google.com',    // Google Analytics (newer endpoint)
        'adservice.google.com',    // Google ad personalisation service
        'amazon-adsystem.com',     // Amazon display ads
        'scorecardresearch.com',   // Nielsen/Comscore audience measurement
        'quantserve.com',          // Quantcast audience tracking
        'outbrain.com',            // Outbrain content recommendation ads
        'taboola.com',             // Taboola content recommendation ads
        'moatads.com',             // Oracle/Moat ad viewability tracking
        'rubiconproject.com',      // Rubicon/Magnite programmatic ad exchange
        'pubmatic.com',            // PubMatic programmatic ads
        'openx.net',               // OpenX ad exchange
        'criteo.com',              // Criteo retargeting ads
        'adsrvr.org',              // The Trade Desk ad serving
        'casalemedia.com',         // Index Exchange ad serving
        'adsafeprotected.com',     // IAS ad verification/tracking
        'chartbeat.com',           // Chartbeat real-time analytics
        'parsely.com',             // Parse.ly content analytics
    ];

    // Store a reference to the real createElement before overriding it
    var realCreateElement = document.createElement.bind(document);

    // Override createElement so we can inspect every <script> tag before it loads
    document.createElement = function (tagName) {
        var element = realCreateElement(tagName);

        // Only intercept <script> elements — leave everything else untouched
        if (tagName.toLowerCase() === 'script') {

            // Watch for the src attribute being set on the script element.
            // We use a property setter so we can check the value before it loads.
            Object.defineProperty(element, 'src', {
                set: function (value) {
                    // Check if the src URL contains any blocked domain string
                    var isBlocked = blockedDomains.some(function (domain) {
                        return value && value.indexOf(domain) !== -1;
                    });

                    if (isBlocked) {
                        // Redirect to a harmless blank URL instead of loading the script
                        Object.getOwnPropertyDescriptor(
                            HTMLScriptElement.prototype, 'src'
                        ).set.call(this, 'about:blank');
                    } else {
                        // Allow the script to load normally
                        Object.getOwnPropertyDescriptor(
                            HTMLScriptElement.prototype, 'src'
                        ).set.call(this, value);
                    }
                },
                get: function () {
                    return Object.getOwnPropertyDescriptor(
                        HTMLScriptElement.prototype, 'src'
                    ).get.call(this);
                }
            });
        }

        return element;
    };


    // =========================================================================
    // SECTION 2: INJECT CSS
    // Dark mode, ad slot hiding, and debloat styles.
    // Injected at document-start so they apply before the page renders,
    // preventing any flash of the original white layout.
    // =========================================================================
    var style = document.createElement('style');
    style.textContent = `

        /* =====================================================================
           PART A: AD & TRACKING ELEMENT REMOVAL
           Hide known ad containers, iframes, and placeholder divs.
           Using display:none removes them from layout entirely so they don't
           leave blank gaps on the page.
           ===================================================================== */

        /* Google AdSense and general ad iframes */
        iframe[src*="googlesyndication"],
        iframe[src*="doubleclick"],
        iframe[src*="google_ads"],
        ins.adsbygoogle,
        .adsbygoogle,

        /* RFD-specific ad slot containers — identified by common class patterns */
        .ad,
        .ad-slot,
        .ad-container,
        .ad-wrapper,
        .ad-block,
        .ad-unit,
        .ads,
        .ads-container,
        [class*="dfp-"],          /* DoubleClick for Publishers slots */
        [id*="dfp-"],
        [class*="google_ads"],
        [id*="google_ads"],
        [id*="ad-slot"],
        [id*="adslot"],
        [class*="adslot"],
        [id^="div-gpt-ad"],       /* Google Publisher Tag ad divs */
        [id*="gpt-ad"],

        /* Outbrain / Taboola recommendation widgets */
        .OUTBRAIN,
        [data-widget-id*="outbrain"],
        .taboola-widget,
        [id*="taboola"],

        /* Sponsored / promoted content labels and containers */
        .sponsored-content,
        .promoted-post,
        [class*="sponsored"],

        /* Newsletter signup banners and popups */
        .newsletter-signup,
        .email-signup,
        [class*="newsletter"],
        [class*="subscribe-banner"],

        /* Cookie consent / GDPR banners */
        #cookie-notice,
        #cookie-banner,
        .cookie-banner,
        .cookie-notice,
        [class*="cookie-consent"],
        [id*="cookie-consent"],

        /* Push notification prompts */
        [class*="push-notification"],
        [id*="push-prompt"],

        /* App download banners */
        .app-banner,
        .smart-banner,
        [class*="app-download"],

        /* Sticky bottom ad bars */
        .sticky-ad,
        .fixed-ad,
        [class*="sticky-banner"] {
            display: none !important;
        }


        /* =====================================================================
           PART B: DEBLOAT — REMOVE VISUAL CLUTTER
           Hide UI elements that add noise without adding value.
           ===================================================================== */

        /* The large RFD promotional mega-menu navigation bar above the forum nav.
           It links to deals, flyers, editor's picks etc. — not forum content. */
        .rfd-header__nav,
        .rfd-header__promo,
        .site-header__promo-nav,
        [class*="promo-nav"],
        .global-nav__promo,

        /* "Breaking news" ticker or banner strip */
        .breaking-news,
        [class*="breaking-news"],

        /* The right-hand sidebar (contains ads, trending deals, app promo) */
        #sidebar,
        .sidebar,
        .forum-sidebar,
        aside.sidebar,
        [class*="sidebar-widget"],

        /* "Hot right now" / trending deals panel */
        .trending-deals,
        [class*="trending"],

        /* Social media sharing buttons on posts */
        .social-share,
        .share-buttons,
        [class*="social-share"],
        [class*="share-bar"],

        /* "You might also like" / related deals sections */
        .related-deals,
        [class*="related-content"],
        [class*="you-might"],

        /* Footer links sections (partner links, about pages etc.) */
        .forum-footer__links,
        .site-footer__nav,
        [class*="footer-nav"],

        /* Mobile app download prompt that appears in the page body */
        [class*="mobile-app-promo"],
        [class*="download-app"] {
            display: none !important;
        }


        /* =====================================================================
           PART C: DARK MODE BASE
           Override RFD's default white/light-grey palette with dark colours.
           Uses !important throughout to override inline styles and specificity.
           ===================================================================== */

        /* CSS variables for the dark palette — edit these to tune the theme */
        :root {
            --rfd-bg:           #1a1a1b;   /* Page background */
            --rfd-surface:      #272729;   /* Cards, headers, nav bars */
            --rfd-surface-2:    #313133;   /* Slightly lighter surfaces */
            --rfd-border:       #3a3a3c;   /* Dividers and borders */
            --rfd-text:         #d7dadc;   /* Primary body text */
            --rfd-text-muted:   #818384;   /* Secondary / metadata text */
            --rfd-accent:       #cc0000;   /* RFD red — kept for brand consistency */
            --rfd-accent-hover: #ff1a1a;   /* Lighter red for hover states */
            --rfd-link:         #4fbdff;   /* Hyperlinks */
            --rfd-link-visited: #9a8ff5;   /* Visited links */
            --rfd-positive:     #46d160;   /* Score/vote up colour */
            --rfd-input-bg:     #1f1f20;   /* Form inputs */
        }

        /* Universal background and text reset */
        html, body {
            background-color: var(--rfd-bg) !important;
            color: var(--rfd-text) !important;
        }

        /* All generic divs and containers */
        div, section, article, main, aside, header, footer, nav {
            background-color: transparent;
            color: inherit;
        }

        /* ---- HEADER & NAVIGATION ---- */

        /* Main site header bar */
        .rfd-header,
        .site-header,
        #header,
        .navbar,
        .forum-nav,
        .header-wrap,
        [class*="header-bar"] {
            background-color: var(--rfd-surface) !important;
            border-bottom: 1px solid var(--rfd-border) !important;
            color: var(--rfd-text) !important;
        }

        /* Navigation links in the header */
        .navbar a,
        .forum-nav a,
        .rfd-header a,
        .site-header a,
        #navigation a,
        .navtabs a {
            color: var(--rfd-text-muted) !important;
        }
        .navbar a:hover,
        .forum-nav a:hover,
        #navigation a:hover {
            color: var(--rfd-text) !important;
        }

        /* Active/selected nav tab */
        .navtabs .selected a,
        .navtabs .active a,
        .forum-nav .active a {
            color: var(--rfd-accent) !important;
            border-bottom-color: var(--rfd-accent) !important;
        }

        /* ---- PAGE BODY & CONTENT AREAS ---- */

        /* Forum thread list tables and post containers */
        table,
        .threadlist,
        .forumlist,
        #threadslist,
        #forumlist,
        .forum-list,
        .thread-list {
            background-color: var(--rfd-bg) !important;
            color: var(--rfd-text) !important;
        }

        /* Table rows — alternate row shading */
        tr, td, th {
            background-color: transparent !important;
            color: var(--rfd-text) !important;
            border-color: var(--rfd-border) !important;
        }

        /* Thread list rows on hover */
        .thread-row:hover,
        tr.alt1:hover,
        tr.alt2:hover {
            background-color: var(--rfd-surface-2) !important;
        }

        /* vBulletin alternating row colours */
        tr.alt1, .alt1 {
            background-color: var(--rfd-bg) !important;
        }
        tr.alt2, .alt2 {
            background-color: var(--rfd-surface) !important;
        }

        /* ---- THREAD LISTING SPECIFIC ---- */

        /* Thread title links */
        .thread-title a,
        .threadtitle a,
        a.title {
            color: var(--rfd-text) !important;
        }
        .thread-title a:hover,
        .threadtitle a:hover {
            color: var(--rfd-link) !important;
        }

        /* Thread metadata (author, date, reply count) */
        .thread-meta,
        .threadmeta,
        .lastpost,
        .td_lastpost,
        .td_title .smallfont {
            color: var(--rfd-text-muted) !important;
        }

        /* Score/vote badge on deal posts */
        .thread-score,
        .dealScore,
        .score {
            background-color: var(--rfd-positive) !important;
            color: #000000 !important;
        }

        /* "HOT" / trending badge */
        .hot-badge,
        .thread-hot {
            background-color: var(--rfd-accent) !important;
            color: #ffffff !important;
        }

        /* ---- POST / THREAD VIEW ---- */

        /* Post container boxes */
        .post,
        .postcontainer,
        .post-content,
        #posts .postcontainer,
        .post-wrapper {
            background-color: var(--rfd-surface) !important;
            border: 1px solid var(--rfd-border) !important;
            color: var(--rfd-text) !important;
            border-radius: 4px;
            margin-bottom: 8px;
        }

        /* Post header bar (username, timestamp, post number) */
        .posthead,
        .post-header,
        .thead {
            background-color: var(--rfd-surface-2) !important;
            border-bottom: 1px solid var(--rfd-border) !important;
            color: var(--rfd-text-muted) !important;
        }

        /* Username in post header */
        .username,
        .postusername,
        a.bigusername {
            color: var(--rfd-accent) !important;
            font-weight: 600;
        }

        /* Post body text */
        .postcontent,
        .post-body,
        .postbody,
        .post_message {
            color: var(--rfd-text) !important;
            background-color: transparent !important;
        }

        /* Quote blocks inside posts */
        .quote,
        .bbcode_quote,
        blockquote {
            background-color: var(--rfd-input-bg) !important;
            border-left: 3px solid var(--rfd-border) !important;
            color: var(--rfd-text-muted) !important;
            padding: 8px 12px !important;
        }

        /* Code blocks inside posts */
        .bbcode_code,
        code, pre {
            background-color: var(--rfd-input-bg) !important;
            border: 1px solid var(--rfd-border) !important;
            color: #a8ff78 !important;
        }

        /* Post footer (reply, quote, like buttons) */
        .postfoot,
        .post-footer,
        .post-controls {
            background-color: var(--rfd-surface) !important;
            border-top: 1px solid var(--rfd-border) !important;
        }

        /* User info sidebar within a post (avatar, join date, post count) */
        .postdetails,
        .userinfo,
        .post-userinfo {
            background-color: var(--rfd-surface-2) !important;
            border-right: 1px solid var(--rfd-border) !important;
            color: var(--rfd-text-muted) !important;
        }

        /* ---- LINKS ---- */

        a:link {
            color: var(--rfd-link) !important;
        }
        a:visited {
            color: var(--rfd-link-visited) !important;
        }
        a:hover {
            color: var(--rfd-accent-hover) !important;
        }

        /* ---- FORMS & INPUTS ---- */

        input, textarea, select {
            background-color: var(--rfd-input-bg) !important;
            color: var(--rfd-text) !important;
            border: 1px solid var(--rfd-border) !important;
            border-radius: 4px;
        }
        input:focus, textarea:focus, select:focus {
            border-color: var(--rfd-accent) !important;
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(204,0,0,0.3) !important;
        }

        /* Submit / action buttons */
        input[type="submit"],
        input[type="button"],
        button,
        .button,
        .btn {
            background-color: var(--rfd-surface-2) !important;
            color: var(--rfd-text) !important;
            border: 1px solid var(--rfd-border) !important;
            cursor: pointer;
        }
        input[type="submit"]:hover,
        .button:hover,
        .btn:hover {
            background-color: var(--rfd-accent) !important;
            color: #ffffff !important;
            border-color: var(--rfd-accent) !important;
        }

        /* ---- PAGINATION ---- */

        .pagination,
        .pagenav {
            background-color: transparent !important;
            color: var(--rfd-text-muted) !important;
        }
        .pagination a,
        .pagenav a {
            background-color: var(--rfd-surface) !important;
            color: var(--rfd-text) !important;
            border: 1px solid var(--rfd-border) !important;
            padding: 4px 8px;
            border-radius: 3px;
        }
        .pagination .selected,
        .pagenav .selected,
        .pagination strong {
            background-color: var(--rfd-accent) !important;
            color: #ffffff !important;
            border-color: var(--rfd-accent) !important;
        }

        /* ---- BREADCRUMB ---- */

        .breadcrumb,
        #breadcrumb,
        .navbar_breadcrumb {
            background-color: var(--rfd-surface) !important;
            border-bottom: 1px solid var(--rfd-border) !important;
        }
        .breadcrumb a,
        #breadcrumb a {
            color: var(--rfd-text-muted) !important;
        }

        /* ---- FOOTER ---- */

        #footer,
        .site-footer,
        .forum-footer {
            background-color: var(--rfd-surface) !important;
            border-top: 1px solid var(--rfd-border) !important;
            color: var(--rfd-text-muted) !important;
        }
        #footer a,
        .site-footer a {
            color: var(--rfd-text-muted) !important;
        }

        /* ---- MODALS & OVERLAYS ---- */

        .modal,
        .popup,
        .overlay-content {
            background-color: var(--rfd-surface) !important;
            color: var(--rfd-text) !important;
            border: 1px solid var(--rfd-border) !important;
        }

        /* ---- MISC ---- */

        /* Horizontal rules / dividers */
        hr {
            border-color: var(--rfd-border) !important;
        }

        /* "Online now" / user status dots */
        .online-indicator {
            background-color: var(--rfd-positive) !important;
        }

        /* Thread category/flair tags */
        .thread-tag,
        .thread-category,
        .label {
            background-color: var(--rfd-surface-2) !important;
            color: var(--rfd-text-muted) !important;
            border: 1px solid var(--rfd-border) !important;
        }

        /* Scrollbar styling for a cleaner dark look (WebKit/Safari) */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: var(--rfd-bg);
        }
        ::-webkit-scrollbar-thumb {
            background: var(--rfd-border);
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: var(--rfd-text-muted);
        }

    `;
    document.documentElement.appendChild(style);


    // =========================================================================
    // SECTION 3: DOM CLEANUP
    // After the page loads, remove elements that can't be caught by CSS alone —
    // for example, elements injected by JavaScript, or iframes added dynamically.
    // =========================================================================
    document.addEventListener('DOMContentLoaded', function () {

        // -----------------------------------------------------------------
        // STEP 3a: Remove ad and tracking iframes injected by JavaScript.
        // CSS display:none leaves them in the DOM and they still make network
        // requests. Removing them entirely stops those requests.
        // -----------------------------------------------------------------
        var adSelectors = [
            'iframe[src*="googlesyndication"]',
            'iframe[src*="doubleclick"]',
            'iframe[src*="google_ads"]',
            'iframe[src*="googletagmanager"]',
            'ins.adsbygoogle',
            '[id^="div-gpt-ad"]',
            '[id*="gpt-ad"]',
            '[class*="dfp-"]',
            '[id*="dfp-"]',
            '.OUTBRAIN',
            '[id*="taboola"]',
            '.taboola-widget',
        ];

        adSelectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                el.remove(); // Fully removes the element from the DOM
            });
        });

        // -----------------------------------------------------------------
        // STEP 3b: Block dynamically injected tracking pixels.
        // Some trackers insert tiny 1x1 <img> elements. We find any image
        // whose dimensions are 1x1 and whose src points to a tracking domain,
        // and remove it.
        // -----------------------------------------------------------------
        document.querySelectorAll('img[width="1"][height="1"], img[width="0"][height="0"]').forEach(function (img) {
            var blocked = blockedDomains.some(function (domain) {
                return img.src && img.src.indexOf(domain) !== -1;
            });
            if (blocked) img.remove();
        });

        // -----------------------------------------------------------------
        // STEP 3c: Remove the RFD promotional navigation bar that sits above
        // the forum navigation and links to deals, flyers, editor's picks etc.
        // This is identified by its role as a secondary nav above the main one.
        // -----------------------------------------------------------------
        var promoNavSelectors = [
            '.rfd-header__nav',
            '.site-header__promo-nav',
            '.global-nav',
            '[class*="promo-nav"]',
            '[class*="top-nav-promo"]',
        ];

        promoNavSelectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                el.remove();
            });
        });

        // -----------------------------------------------------------------
        // STEP 3d: Remove the right sidebar if it exists.
        // On RFD it typically contains ads, hot deals widgets, and app promos.
        // -----------------------------------------------------------------
        var sidebarSelectors = [
            '#sidebar',
            '.forum-sidebar',
            'aside.sidebar',
            '[class*="sidebar-right"]',
        ];

        sidebarSelectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                el.remove();
            });
        });

        // -----------------------------------------------------------------
        // STEP 3e: MutationObserver — watch for ad elements injected AFTER
        // the initial page load by JavaScript and remove them on the fly.
        // This catches Google Ads and other ad networks that inject their
        // content asynchronously after the page has already loaded.
        // -----------------------------------------------------------------
        var allBlockedSelectors = adSelectors.concat(promoNavSelectors).join(', ');

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    // Only process element nodes (not text or comment nodes)
                    if (node.nodeType !== 1) return;

                    // Check if this newly added node matches any blocked selector
                    if (node.matches && node.matches(allBlockedSelectors)) {
                        node.remove();
                        return;
                    }

                    // Also check any children of the newly added node
                    if (node.querySelectorAll) {
                        node.querySelectorAll(allBlockedSelectors).forEach(function (child) {
                            child.remove();
                        });
                    }

                    // Remove any 1x1 tracking pixels inside the new node
                    if (node.querySelectorAll) {
                        node.querySelectorAll('img[width="1"][height="1"]').forEach(function (img) {
                            var blocked = blockedDomains.some(function (domain) {
                                return img.src && img.src.indexOf(domain) !== -1;
                            });
                            if (blocked) img.remove();
                        });
                    }
                });
            });
        });

        // Start observing the entire document body for any new elements added
        observer.observe(document.body, {
            childList: true,  // Watch for elements being added/removed
            subtree: true     // Watch all descendants, not just direct children
        });

    }); // end DOMContentLoaded

})();
