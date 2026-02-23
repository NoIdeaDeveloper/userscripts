Safari Userscripts
A collection of userscripts I maintain to improve the Safari borwsing experience.

-- Getting Started --

Install the wBlock app from the App Store and enable it in Safari → Settings → Extensions.
Find the url to the .user.js file(s) you want and import them under the sserscripts tab in the wBlock app.
Grant Userscripts permission to run on the relevant sites when Safari prompts you.


-- Scripts --

1. reddit-to-redlib.user.js — Reddit → Redlib

Silently redirects all Reddit pages to a Redlib instance — a privacy-respecting, ad-free Reddit frontend. The full URL path and query parameters are preserved, so links to specific posts, subreddits, and search results all work correctly.

Configuration: Open the script and change the destination variable to point to your preferred Redlib instance. A list of public instances is available at github.com/redlib-org/redlib-instances.

2. youtube-to-invidious.user.js — YouTube → Invidious

Redirects YouTube to an Invidious instance — a privacy-respecting YouTube frontend with no ads, no tracking, and no account required. Handles all YouTube URL types including standard videos, short youtu.be links, search results, channel pages, and embedded players.

Configuration: Open the script and change the invidious variable to your preferred instance. A list of public instances is available at docs.invidious.io/instances. You can also set videoParams and pageParams to append Invidious URL parameters (e.g. to disable comments or related videos) to every page you visit.

3. hackernews-dark-mode.user.js — Hacker News Enhancer

Improves the Hacker News reading experience with two visual upgrades:

- Dark mode ~ replaces HN's default white and orange theme with a dark Reddit-inspired colour scheme. Covers the header, story list, comment threads, input fields, and footer.
- Comment depth colours ~ on thread pages, each level of comment nesting is marked with a distinct coloured left border, making it easy to track conversation structure at a glance. The colours cycle through the same palette used by the Reddit mobile app (red → teal → amber → green → purple → blue → coral).
- Next-parent button ~ a floating circular arrow button appears in the bottom-right corner of thread pages. Clicking it skips past all child replies and jumps directly to the next top-level comment, making it easy to scan through a thread quickly.

Notes:

All three scripts use @run-at document-start so they fire as early as possible, minimising any flash of the original page before redirecting.
The redirect scripts use window.location.replace() rather than window.location.href, which means redirected pages do not appear in your browser history — pressing Back will take you to the page before the Reddit or YouTube link, not back to the redirect.
These scripts only run on the domains specified in their @match headers and do not collect or transmit any data.
