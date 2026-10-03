# Season data

The website will use one canonical game-history file: `games.json`.

Each game records only source facts:

- ISO date (`YYYY-MM-DD`)
- winner
- explicit participants

Everything else — wins, games played, win percentage, ranking, streaks, participation, monthly stats, and chart points — is derived from that history.

The detailed schema, validation rules, expected 2026 baseline standings, and update workflow live in `../PROJECT_PLAN.md`.

Do not maintain a second manual scoreboard here.
