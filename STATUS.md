# Family Parcheesi — Current Status

Updated: 2026-10-03

## Current state

The full v1 website is implemented and pushed to `main`.

**Live:** https://llm-i-am.github.io/fam-parcheesi/

Browser/share identity is installed: multi-size favicons, Apple Touch icon, pinned-tab icon, web manifest, and 1200×630 Open Graph artwork for iMessage/social previews.


## League identity and copy direction

The family-world name is **Frogger Family Parcheesi League**, shortened to **Frogger League** in compact UI chrome. References stay deliberately sparse: the faux-Mac title bar, one hero season identifier, and the footer.

Copy direction is now **earnest underneath, playful on top**: treat the championship as a real family institution, while letting the presentation be dramatic, mock-serious, and fun. Humor should come from the grand sports-broadcast treatment, not from diminishing the game or tradition.

## Architecture

Static, dependency-free site:

- `index.html`
- `styles.css`
- `app.js`
- `data/games.json`
- `assets/favicon.svg` + raster favicon set
- `assets/apple-touch-icon.png`
- `assets/icon-192.png` / `assets/icon-512.png`
- `assets/og-share.png`
- `assets/safari-pinned-tab.svg`
- `favicon.ico`
- `site.webmanifest`
- `.nojekyll`

No framework, build tool, database, login, API, analytics dependency, or external chart library is required.

All paths are relative so the app works correctly under the GitHub Pages repository subpath.

## Implemented product behavior

- iPhone-first responsive layout with desktop support.
- Automatic device light/dark mode.
- Current leader + latest-game summary at the top.
- Full standings with W / GP / Win % and shared ranks for ties.
- Explicit explanation that championship percentage is wins divided by games actually played.
- Stable per-player color/pawn identities.
- Interactive season chart toggling between championship Win % and cumulative wins.
- Stats Lab cards for recent hot hand, longest streak, leader changes, busiest month, and current win drought.
- Recent-form strip showing the last five winners.
- Recent game history shown by default with a touch-friendly `Show all games` control.
- Participant absences displayed in game history.
- Friendly fatal-data state if the source file fails to load or validate.

## Visual direction

Final direction: old Macintosh + vintage board-game box + late-1990s family computer, but with modern readability and spacing.

Notable details:

- faux classic-computer title bar;
- warm paper/plastic surface system in light mode;
- rich charcoal/warm-neutral dark mode;
- tactile inset/offset borders and cards;
- subtle dot-grid/scanline atmosphere;
- board-game pawn silhouettes built entirely in CSS;
- playful family copy without turning the site into a parody operating system.

## Data contract

`data/games.json` remains the only source of truth.

Every derived value is calculated at runtime from:

- date;
- winner;
- participants.

The browser validates:

- integer season;
- unique players;
- ISO dates;
- chronological ordering;
- known winners/participants;
- winner included in participants;
- no duplicate participants.

## QA completed before push

### Static validation

- `node --check app.js` passed.
- `python -m json.tool data/games.json` passed.
- HTML parser smoke check passed.
- Asset references verified.

### Data sanity checks

Verified from the canonical 15-game file:

- Dad: 5 / 15 = 33.3%
- Ben: 4 / 15 = 26.7%
- Andrew: 3 / 15 = 20.0%
- Mom: 3 / 15 = 20.0%
- Nathan: 0 / 9 = 0.0%

### Browser-level QA

The complete page was rendered in headless Chromium with the real production HTML/CSS/JS logic and the canonical JSON injected through a local test harness.

Verified at widths:

- 320 px
- 390 px
- 430 px
- 1200 px

Checks passed:

- no horizontal overflow;
- five standings rows render;
- all 15 history records render;
- `Show all games` toggles correctly and updates `aria-expanded`;
- chart switches between Win % and total wins and updates `aria-pressed`;
- no console errors;
- light mode render visually reviewed;
- dark mode render visually reviewed;
- reduced-motion mode smoke-tested.

## Issues found and fixed during QA

1. The original chart scale topped out below early-season 100% values. Fixed by using a true 0–100% championship-percentage axis.
2. The original drought calculation counted games a player did not participate in. Fixed so droughts count only that player's actual appearances.
3. Player pawns initially inherited the default gold instead of each player's identity color. Fixed the CSS custom-property inheritance and added colored row accents.
4. The formula-note icon was replaced with a clearer division symbol.

## Current known boundary

A physical iPhone Safari test is still the final real-device confirmation after GitHub Pages is enabled. The implementation uses WebKit-safe approaches (`viewport-fit=cover`, `env(safe-area-inset-*)`, `prefers-color-scheme`) and has no browser-specific framework dependency.

## Next exact action

1. Enable GitHub Pages from `main` / `/(root)`.
2. Open the resulting public URL on an iPhone in both light and dark appearance.
3. Confirm the top standings, chart toggle, and history expansion feel right in physical Mobile Safari.
4. If all looks good, normal future game-night updates should modify only `data/games.json`.
