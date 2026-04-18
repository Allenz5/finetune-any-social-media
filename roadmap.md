# Roadmap

## Summary

An agent that browses social media in a real browser and reacts to posts (like / dislike / skip) to shape the platform's recommendation system toward the user's taste.

The first milestone is a minimal end-to-end loop on **one platform (X)**. The codebase is structured so additional platforms slot in behind a clean adapter interface, but we do not build for more than one platform in the MVP.

## Architecture Components

- **Platform adapter** — per-platform module with a small interface: `get_next_post()`, `like()`, `dislike()`, `skip()`, `scroll()`. Only X is implemented in the MVP. This is the one interface we keep clean from day one.
- **Browser session** — Playwright (core library, not the test runner) launched with a persistent user-data dir, so the user logs into X once manually and cookies are reused.
- **Perception** — scrape the visible post's text and author from the DOM. No images, video, or vision in the MVP.
- **Preference prompt** — a plain-English description of the user's taste, stored in a config file.
- **Decision agent** — one Claude API call per post, returning `{action, reason}`.
- **Executor** — performs the click and scrolls to the next post, with simple human-like delays.
- **Log** — one JSON line per post appended to a file (post text, decision, reason, timestamp).

Explicitly **not** in the MVP: vision fallback, multiple platforms, learned preference models, scheduling, anti-detection heuristics, UI.

## Tasks

- [ ] Pick language (Python or Node) and set up project skeleton
- [ ] Define the platform adapter interface
- [ ] Launch Playwright with a persistent Chrome profile; log into X manually once
- [ ] Implement the X adapter: find next post, extract text + author, click like / dislike, scroll
- [ ] Write the taste prompt config file
- [ ] Wire up the Claude API call that returns `{action, reason}` for a post
- [ ] Build the main loop: perceive → decide → act → log
- [ ] Append decisions to a JSONL log file
- [ ] Run end-to-end on a real X feed and sanity-check the log
