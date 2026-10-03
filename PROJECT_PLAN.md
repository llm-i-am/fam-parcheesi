# Family Parcheesi — Build Plan

## 1. Goal

Create a tiny public family website that makes the 2026 Parcheesi championship immediately understandable on an iPhone while rewarding scrolling with playful statistics and visual history.

The site should feel like a charming family artifact, not a business dashboard: **old Macintosh + vintage board-game box + late-1990s family-computer energy**, refined with modern spacing, accessibility, and iPhone Safari behavior.

The primary audience is Ben's family. Most visits will be from Mobile Safari on iPhone. Desktop is a secondary but fully supported layout.

## 2. Non-goals

For the first version, do **not** build:

- a login system;
- an admin dashboard;
- a database;
- a server/API;
- Cloudflare Access;
- user accounts;
- editable controls on the public site;
- a heavy JS framework or build system unless a concrete need appears;
- a PWA/offline layer unless it becomes useful later.

Ben + ChatGPT act as the admin interface by updating the canonical game-history file in GitHub.

## 3. Competition rules

Active competitors:

1. Ben
2. Mom
3. Dad
4. Andrew
5. Nathan

Mike does not participate in this competition and should not appear in championship standings.

The yearly champion is determined by win percentage among games actually played:

`win percentage = wins / games played`

A missed game is excluded from that player's denominator. This matters especially for Nathan, who periodically misses game night because of work.

If two players have the same win percentage, display them as tied unless/until the family establishes a separate tie-break rule. Do not silently invent a tie-breaker.

## 4. Canonical data model

`data/games.json` is the single source of truth.

Store only durable facts needed to reconstruct the season:

- season year;
- canonical player list;
- game date;
- winner;
- explicit participants.

Do **not** store derived values such as wins, games played, win percentage, streaks, ranking, or chart points. Those should always be calculated from the game log so they cannot drift out of sync.

Proposed shape:

```json
{
  "season": 2026,
  "players": ["Ben", "Mom", "Dad", "Andrew", "Nathan"],
  "games": [
    {
      "date": "2026-01-03",
      "winner": "Andrew",
      "participants": ["Ben", "Mom", "Dad", "Andrew", "Nathan"]
    }
  ]
}
```

Validation rules for future updates:

- dates use ISO `YYYY-MM-DD`;
- winner must be one of the listed players;
- winner must also appear in that game's `participants` array;
- participants contain no duplicates;
- games remain sorted chronologically;
- an absent player is represented by simply not including them in `participants`;
- preserve all prior games when appending a new result;
- before every edit, fetch the latest file from `main` to avoid stale overwrites.

## 5. Current 2026 baseline

As of October 3, 2026 there are 15 recorded games.

Expected derived standings from the current log:

- Dad — 5 wins / 15 games = 33.3%
- Ben — 4 wins / 15 games = 26.7%
- Andrew — 3 wins / 15 games = 20.0%
- Mom — 3 wins / 15 games = 20.0%
- Nathan — 0 wins / 10 games = 0.0%

This is a validation fixture, not manually maintained scoreboard data. The implementation should compute these values from `data/games.json` and can use these numbers as a sanity check during development.

## 6. Information architecture

### A. Immediate answer / championship header

The first viewport on a typical iPhone should answer the season question without scrolling.

Recommended content order:

1. Family Parcheesi / 2026 season identity.
2. Current leader callout, e.g. `Dad leads — 33.3%`.
3. Full standings list with rank, name, wins, games played, and percentage.
4. A tiny plain-language explanation: `Win % = wins ÷ games played`.
5. Latest game result/date.

No hamburger menu, tabs, hidden navigation, or explanation should be required to understand the standings.

### B. Parcheesi Stats Lab

Below the standings, the site becomes more playful and exploratory.

Priority stats/visuals:

- **The Great 2026 Parcheesi Race** — season progression visualization.
- **Championship percentage over time** — the mathematically faithful view of the title race.
- **Cumulative wins over time** — intuitive companion view.
- **Recent form** — last five recorded games.
- **Longest winning streak** — consecutive game wins.
- **Leader changes** — who led or shared the lead after each game.
- **Participation** — games played / season games, especially useful for Nathan.
- **Last win** — most recent victory for each player.
- **Winless drought** — games since a player's last win, phrased playfully rather than harshly.
- **Monthly winners** — wins grouped by calendar month.
- **Family records** — designed so future seasons can eventually compare all-time records.

The first implementation does not need every conceivable stat. Prefer a polished small set over a cluttered analytics dump.

## 7. Visual direction

### Core concept

**Old Macintosh meets vintage board-game packaging.**

Use the nostalgic language selectively:

- warm off-white / yellowed-computer-plastic surfaces in light mode;
- deep charcoal / muted warm neutrals in dark mode rather than pure black;
- chunky window frames, inset borders, small faux title bars, or pixel-like details;
- modest board-game motifs such as pawn shapes, dice/pip patterns, race-track marks, or tiny crowns;
- expressive but highly readable typography;
- playful labels like `PARCHEESI STATS LAB` and `THE GREAT 2026 PARCHEESI RACE`.

Avoid turning the site into a parody OS. Nostalgia should frame the information, not make the family decode an interface.

### Light / dark appearance

Use `prefers-color-scheme` so appearance automatically follows the device.

Requirements:

- both modes are intentionally designed, not merely color-inverted;
- maintain WCAG-friendly text contrast;
- charts and status indicators remain distinguishable in both modes;
- no manual theme toggle is required for v1.

### Player identity

Assign each player a stable visual identity (color + optional pawn/icon shape) and reuse it consistently in standings, charts, and stat cards.

Do not rely on color alone to communicate identity or ranking.

## 8. Mobile-first interaction requirements

Target current iPhone Safari first.

- Include `viewport-fit=cover`.
- Respect safe areas with `env(safe-area-inset-*)` where needed.
- Default body/content width should feel native on narrow iPhones and remain comfortably readable on larger devices.
- Core text should not require pinch zoom.
- Tap targets should be generous even if v1 has very little interaction.
- Avoid hover-only meaning.
- Avoid horizontal page scrolling.
- Charts must fit small screens without microscopic labels.
- Prefer vertically stacked content on iPhone; progressively widen/reflow on tablet/desktop.
- Respect `prefers-reduced-motion`.
- Avoid unnecessary motion, parallax, or scroll-jacking.

## 9. Accessibility / clarity

The design should work for older family members without requiring technical familiarity.

- Base font size should remain comfortably readable.
- Ranking and percentages should be text, not only graphics.
- Explain the participation-adjusted championship formula in one short sentence.
- Use semantic HTML headings, lists/tables where appropriate, and accessible labels.
- Never make a graph the only way to understand an important statistic.
- Keep decimal precision sane: one decimal place for displayed win percentages is sufficient.
- Empty/no-win states should be friendly and unambiguous.

## 10. Technical architecture

Preferred v1 implementation:

- static `index.html`;
- static CSS;
- small vanilla JavaScript module(s);
- same-origin `data/games.json`;
- no external database;
- no private keys or secrets;
- no third-party analytics by default;
- no framework unless implementation proves one is materially helpful;
- charts rendered with lightweight native SVG/HTML where practical instead of pulling in a large charting dependency.

Hosting target: **GitHub Pages from this public repository**. This keeps deployment aligned with the project's static nature and lets a normal push to `main` update the family site.

If GitHub Pages introduces a concrete limitation during implementation, reassess then. Do not preemptively introduce Cloudflare or another hosting layer.

## 11. Update workflow after game night

Desired human workflow:

`Ben tells ChatGPT the winner + who was absent -> ChatGPT fetches current data/games.json -> validates -> appends one game -> pushes to main -> verifies deployment/data`

Examples:

- `Dad won tonight. Everyone played.`
- `Ben won today, no Nathan.`

For a normal weekly update, only the canonical game data should need to change. Website code should not be edited unless a feature or bug actually requires it.

## 12. Suggested v1 page structure

1. **Season masthead** — playful title / board-game identity.
2. **Leader card** — current championship leader or tie.
3. **Standings** — all five players with W / GP / Win %.
4. **Latest result** — date + winner + participation note when relevant.
5. **The Great 2026 Parcheesi Race** — primary chart section.
6. **Stats Lab cards** — recent form, streak, participation, last win/drought.
7. **Game history** — chronological list of all recorded games.
8. **Footer** — simple family-season signoff; no navigation complexity.

## 13. Derived-stat algorithms to implement

All functions should derive from the same parsed game log.

- `gamesPlayed(player)` = count games whose participants include player.
- `wins(player)` = count games whose winner equals player.
- `winPct(player)` = wins / gamesPlayed, guarded for zero games.
- `standings()` = sort descending by winPct; equal percentages remain tied.
- `recentForm(n)` = most recent `n` games with winner.
- `winningStreaks()` = consecutive recorded-game wins by the same player.
- `cumulativeWins()` = per-player running total after each game.
- `championshipPctOverTime()` = after each game, wins-to-date / games-played-to-date per player.
- `leaderHistory()` = highest championship percentage after each game, preserving ties.
- `participation()` = games played / total season games.
- `lastWin()` = latest game won by each player.
- `gamesSinceWin()` = count recorded games after each player's most recent win; sensible never-won state.
- `monthlyWins()` = winner counts grouped by calendar month.

## 14. Build sequence

### Phase 0 — Foundation (current phase)

- dedicated public repo;
- authoritative 2026 game log;
- product/design/architecture plan;
- private GPT Voice pointer;
- no website implementation.

### Phase 1 — Functional skeleton

- semantic mobile-first page;
- data loader/validator;
- standings and latest-result calculations;
- game history;
- verify baseline numbers against Section 5.

### Phase 2 — Visual system

- nostalgic design tokens;
- automatic light/dark themes;
- player identities;
- responsive layout;
- iPhone safe-area polish.

### Phase 3 — Stats Lab

- primary season chart(s);
- recent-form/streak/participation cards;
- friendly empty states;
- responsive SVG behavior.

### Phase 4 — QA / publish

- current iPhone Safari physical test;
- narrow/wide viewport tests;
- light/dark checks;
- reduced-motion check;
- verify every derived value against source history;
- enable/verify GitHub Pages;
- confirm public URL with family-ready presentation.

## 15. Questions that are not blocking yet

These can wait until implementation unless Ben has a strong preference:

- exact player colors/pawn identities;
- exact public site title/subtitle wording;
- whether to add a custom domain later;
- whether a future version should become installable as a PWA;
- whether historical seasons before 2026 will eventually be imported.

## 16. One potentially important future rule question

A tied win percentage is currently treated as a shared rank because no tie-break rule has been specified. This does **not** block the build. If the family has a formal year-end tie-break rule, add it explicitly later rather than guessing.

## 17. Definition of done for v1

A family member should be able to open the link on an iPhone and, within a few seconds:

- know who is leading;
- understand the standings and participation-adjusted percentage;
- see the latest result;
- scroll into fun but understandable season stats;
- enjoy the site's personality without needing instructions.

A future ChatGPT session should be able to read this file + `data/games.json` and continue the project without rediscovering the architecture or product intent.
