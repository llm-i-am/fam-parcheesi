# Family Parcheesi

A small, mobile-first family scoreboard for the weekly Parcheesi games played by Ben, Mom, Dad, Andrew, and Nathan.

The site is meant to answer one question immediately on an iPhone: **who is leading the family championship right now?** From there, people can scroll into a playful stats layer with trends, streaks, recent form, participation, and season history.

## Product principles

- **iPhone Safari first.** The primary experience is opening the site on an iPhone. Desktop should still work naturally.
- **Simple enough for everyone.** The current standings must be obvious without explanation or hidden controls.
- **Public viewing, private editing workflow.** Family members only need the public site. Ben can update the underlying game history through ChatGPT/GitHub rather than maintaining an admin dashboard.
- **One source of truth.** Record objective game results and participants once; derive standings, percentages, charts, streaks, and other stats automatically.
- **Light and dark mode.** The site must automatically follow the viewer's device appearance.
- **Playful, not cluttered.** Visual direction: old Macintosh meets vintage family board-game box, with a little late-1990s personality while preserving modern readability.
- **Static by default.** Favor the smallest reliable architecture that can be hosted publicly without a database or private runtime.

## Championship rule

The yearly champion is determined by **win percentage among games that person actually played**:

`win percentage = wins / games played`

Nathan sometimes misses game night because of work, so games he did not participate in must not count against his denominator.

## Players

- Ben
- Mom
- Dad
- Andrew
- Nathan

Mike is family but does not participate in this weekly Parcheesi competition and is not part of the standings.

## Current project state

Phase 0 foundation is complete. **The website implementation has intentionally not started yet.**

- Repository created as a dedicated public project.
- Canonical data contract documented under `data/`.
- `data/games.json` contains the authoritative 2026 history through October 3, 2026: 15 games total, with explicit participants for every game.
- The game log derives to the expected baseline: Dad 5/15, Ben 4/15, Andrew 3/15, Mom 3/15, Nathan 0/10.
- Product, design, data, accessibility, mobile, and implementation decisions are specified in `PROJECT_PLAN.md`.
- The private GPT Voice workspace contains only a pointer back to this repository so private notes do not leak into the public project.

## Next step

Read `PROJECT_PLAN.md` and `data/games.json`, resolve any genuinely blocking question if one appears, then begin Phase 1 implementation of the static site without changing the championship rule or rewriting the source data model unless a real issue is discovered.
