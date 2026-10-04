# Family Parcheesi — Current Status

Updated: 2026-10-04

## Current state

The Family Parcheesi site is live on GitHub Pages and the current `main` branch contains the post-v2 final polish pass.

**Live:** https://llm-i-am.github.io/fam-parcheesi/

Restore points remain available through the existing GitHub releases/tags, including `v1.0.0` and `v2.0.0`. The newer polish on `main` has not been tagged as another release yet.

Browser/share identity is installed: multi-size favicons, Apple Touch icon, pinned-tab icon, web manifest, and 1200×630 Open Graph artwork for iMessage/social previews.

## League identity and copy direction

The family-world name is **Frogger Family Parcheesi League**, shortened to **Frogger League** in compact UI chrome. References stay deliberately sparse: the faux-Mac title bar, one hero season identifier, and the footer.

Copy direction is **earnest underneath, playful on top**: treat the championship as a real family institution while letting the presentation be dramatic, mock-serious, and fun. Humor should come from the grand sports-broadcast treatment, not from diminishing the game or tradition.

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
- Edge-to-edge vertical scrolling in modern iPhone Safari so site content can pass beneath translucent browser chrome.
- Current leader + latest-game summary at the top.
- Latest-game attendance is neutral and automatic: `full table` when everyone played, otherwise e.g. `4 players at the table`.
- Full standings with W / GP / Win % and shared ranks for ties.
- Explicit explanation that championship percentage is wins divided by games actually played.
- Stable per-player color/pawn identities.
- Interactive season chart toggling between championship Win % and cumulative wins.
- Stats Lab cards for recent hot hand, longest streak, leader changes, busiest month, and current win drought.
- Recent-form strip showing the last five winners.
- Recent game history shown by default with a touch-friendly `Show all games` control.
- Participant absences displayed in detailed game history.
- Friendly fatal-data state if the source file fails to load or validate.

## Final visual polish

The October 4 final pass refined the existing visual language rather than redesigning it:

- CSS pawn silhouettes now receive one continuous contour outline around the combined head/body shape instead of separate partial edging.
- The hero window now has a subtle material gradient instead of a flat fill.
- Leader and latest-game cards use restrained layered gradients for more depth in both light and dark mode.
- The championship ribbon received a subtle highlight treatment and safer wrapping behavior.
- Dark-mode surfaces gained a very small inset highlight and slightly richer shadow depth.
- The leader-card gold glow was softened and integrated into the background rather than painted as a separate overlay.

The visual direction remains old Macintosh + vintage board-game box + late-1990s family computer, with modern spacing/readability.

## Data contract

`data/games.json` remains the only source of truth.

Every derived value is calculated at runtime from:

- date;
- winner;
- participants.

The browser now validates:

- integer season;
- non-empty player names;
- unique players;
- ISO-formatted and real calendar dates;
- each game date belonging to the configured season;
- chronological ordering;
- known winners/participants;
- winner included in participants;
- no duplicate participants.

## QA completed

### Static validation

The final polish workflow passed all checks before pushing its generated commit:

- `node --check app.js`;
- `python -m json.tool data/games.json`;
- HTML parser smoke check;
- CSS brace-balance check;
- invariant checks for removed/stale UI and dead code;
- `git diff --check`.

### Data sanity

Canonical 15-game state remains:

- Dad: 5 / 15 = 33.3%
- Ben: 4 / 15 = 26.7%
- Andrew: 3 / 15 = 20.0%
- Mom: 3 / 15 = 20.0%
- Nathan: 0 / 9 = 0.0%

### Previous browser-level QA

The full site has previously been rendered and checked at 320 px, 390 px, 430 px, and 1200 px widths, including light/dark mode, no horizontal overflow, chart switching, history expansion, and console-error checks.

Physical iPhone Safari testing has also confirmed the edge-to-edge behavior. The former hidden skip-navigation element that appeared under Safari's top blur was removed, and the unnecessary `Most Present` stat was removed.

## Corrections made during the final pass

1. Pawn outlining was incomplete because only the head and lower body edge were explicitly stroked. The outline now follows the alpha silhouette of the combined piece.
2. The UI said `LONGEST DROUGHT` while the calculation intentionally measured the **current** drought. The label now correctly says `CURRENT DROUGHT` and the internal function name matches.
3. An unused `lastWin` derived value and `latestWin()` helper were removed.
4. Season/date validation was hardened so malformed dates and wrong-year game entries fail loudly instead of silently corrupting stats.
5. Season chip grammar now handles singular/plural game counts correctly.
6. Standings/chart accessibility labels now derive the season/player information from live data rather than hard-coding 2026/player names in JavaScript.

## Current known boundary

The latest October 4 visual polish is deployed in code and has passed automated validation. Final physical-iPhone visual confirmation of the new continuous pawn outline and refined gradients should be done after the latest GitHub Pages deployment finishes.

Once that looks right, normal game-night maintenance should only require editing `data/games.json`.
