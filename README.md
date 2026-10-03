# Family Parcheesi

A public, mobile-first family scoreboard for the weekly Parcheesi championship played by Ben, Mom, Dad, Andrew, and Nathan.

The site answers the main question immediately — **who is leading right now?** — then turns into a playful stats lab with season history, streaks, participation, recent form, and a visual championship race.

## Status

**Website is live on GitHub Pages and the full browser/social identity asset set is installed.**

Once Pages is enabled from the repository root on `main`, the expected public URL is:

`https://llm-i-am.github.io/fam-parcheesi/`

## Design direction

The visual language is intentionally **old Macintosh + vintage board-game box + late-1990s family-computer energy**, refined for modern iPhone Safari usability.

- warm off-white / yellowed-computer-plastic light mode;
- intentionally designed charcoal/warm dark mode;
- faux classic-computer window chrome;
- colorful player pawns and stable player identities;
- chunky borders and tactile cards without becoming hard to read;
- playful copy such as `PARCHEESI STATS LAB™` and `THE GREAT 2026 PARCHEESI RACE`;
- responsive layout built iPhone-first, then widened progressively for desktop.

The site automatically follows the viewer's device light/dark appearance.

## Championship rule

The yearly champion is determined by **win percentage among games that person actually played**:

`win percentage = wins / games played`

A missed game does not count against that player's denominator.

Current players:

- Ben
- Mom
- Dad
- Andrew
- Nathan

Mike is family but does not participate in this competition and does not appear in the standings.

## Source of truth

`data/games.json` is the only canonical season history.

It stores only objective source facts:

- season year;
- canonical players;
- date;
- winner;
- explicit participants.

Everything else is derived in the browser: rankings, win percentages, cumulative wins, championship percentage over time, streaks, recent form, participation, lead changes, busiest month, droughts, and game history presentation.

For a normal weekly update, **only `data/games.json` should need to change**.

## Current 2026 baseline

The 15 recorded games through October 3, 2026 derive to:

- Dad — 5 wins / 15 games = 33.3%
- Ben — 4 wins / 15 games = 26.7%
- Andrew — 3 wins / 15 games = 20.0%
- Mom — 3 wins / 15 games = 20.0%
- Nathan — 0 wins / 10 games = 0.0%

Equal win percentages remain tied unless the family later defines a formal tie-break rule.

## Files

- `index.html` — semantic mobile-first page shell and all family-facing content regions.
- `styles.css` — responsive visual system, light/dark themes, safe-area handling, accessibility fallbacks, retro-Mac/board-game styling.
- `app.js` — source-data validation, all derived statistics, standings, chart rendering, history expansion, and interactions.
- `data/games.json` — canonical season history.
- `data/README.md` — compact source-data contract.
- `assets/favicon.svg` + PNG/ICO variants — Safari/browser tab and bookmark identity.
- `assets/apple-touch-icon.png` — iPhone/iPad Home Screen and bookmark icon.
- `assets/icon-192.png` / `assets/icon-512.png` + `site.webmanifest` — installable web-app identity.
- `assets/og-share.png` — 1200×630 Open Graph / iMessage / social share artwork.
- `assets/safari-pinned-tab.svg` — monochrome Safari pinned-tab mark.
- `.nojekyll` — tells GitHub Pages to publish the static files directly.
- `PROJECT_PLAN.md` — original product/design/build contract.
- `STATUS.md` — current implementation and QA handoff state.

## Mobile / accessibility behavior

The implementation includes:

- `viewport-fit=cover` for edge-to-edge iPhone layouts;
- safe-area padding using `env(safe-area-inset-*)`;
- automatic `prefers-color-scheme` light/dark themes;
- `prefers-reduced-motion` support;
- increased-contrast fallback;
- readable text-first standings so graphs are never the only source of important information;
- keyboard-visible focus states;
- no hover-only functionality;
- no horizontal page scrolling at tested mobile widths;
- large, touch-friendly controls;
- a fully accessible chart mode toggle and game-history disclosure.

## Hosting

The site is intentionally static and dependency-free: no framework, database, API, login, private key, analytics package, or external chart library.

To publish:

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **`main`** and folder **`/(root)`**.
4. Save and wait for GitHub Pages to report the public URL.

Because all asset/data references are relative, the site is compatible with the repository subpath used by GitHub Pages.

## Weekly update workflow

Desired workflow:

`Ben tells ChatGPT the winner + who was absent → ChatGPT fetches the latest data/games.json → validates → appends one game → pushes to main → verifies`

Examples:

- `Dad won tonight. Everyone played.`
- `Ben won today, no Nathan.`

No website-code edit should be necessary for an ordinary game-night result.
