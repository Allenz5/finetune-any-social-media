# Roadmap

## Summary

A Chrome extension that watches the user's LinkedIn feed and reacts to posts (like / dislike / skip) to shape the platform's recommendation system toward the user's taste.

The first milestone is a minimal end-to-end loop on **LinkedIn**. The codebase is structured so additional platforms slot in behind a clean adapter interface, but we do not build for more than one platform in the MVP.

Building as a Chrome extension means we don't handle login or credentials — the user is already signed into LinkedIn in their own browser. We only need to read the page and drive clicks.

## Architecture Components

- **Content script** — runs in the LinkedIn tab. Reads the visible post (text + author) from the DOM and performs the click for like / dislike / skip / scroll.
- **Platform adapter** — the content-script module that implements a small interface: `getNextPost()`, `like()`, `dislike()`, `skip()`, `scroll()`. Only LinkedIn is implemented in the MVP. This is the one interface we keep clean from day one.
- **Background service worker** — orchestrates the loop, calls the Claude API, persists logs and config.
- **Popup UI** — shows current status, lets the user edit the taste prompt, start/stop the loop, and view the decision log.
- **Preference prompt** — a plain-English description of the user's taste, stored in `chrome.storage.local`.
- **Decision agent** — one Claude API call per post, returning `{action, reason}`.
- **Log** — one JSON entry per post appended to `chrome.storage.local` (post text, decision, reason, timestamp).

Explicitly **not** in the MVP: vision fallback, multiple platforms, learned preference models, scheduling, anti-detection heuristics, hosted backend for the API key (user pastes their own key into the popup for now).

## Tasks

- [x] Scaffold Chrome extension: manifest, Vite build, popup, content script, service worker
- [ ] Define the platform adapter interface in the content script
- [ ] Implement the LinkedIn adapter: find next post, extract text + author, click like / dislike, scroll
- [ ] Add the taste prompt config UI in the popup, persist to `chrome.storage.local`
- [ ] Add the API key input in the popup, persist to `chrome.storage.local`
- [ ] Wire up the Claude API call from the service worker that returns `{action, reason}` for a post
- [ ] Build the main loop: perceive (content script) → decide (service worker) → act (content script) → log
- [ ] Append decisions to a log in `chrome.storage.local` and render them in the popup
- [ ] Run end-to-end on a real LinkedIn feed and sanity-check the log
