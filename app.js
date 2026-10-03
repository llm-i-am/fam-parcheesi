(() => {
  'use strict';

  const DATA_URL = './data/games.json';
  const PLAYER_META = {
    Ben: { color: '#4f78da' },
    Mom: { color: '#d25d83' },
    Dad: { color: '#2f916d' },
    Andrew: { color: '#e58b2d' },
    Nathan: { color: '#8a63bf' }
  };

  const state = {
    data: null,
    derived: null,
    chartMode: 'percentage',
    historyExpanded: false
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    wireControls();
    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status})`);
      const data = await response.json();
      validateData(data);
      state.data = data;
      state.derived = deriveSeason(data);
      renderAll();
    } catch (error) {
      console.error(error);
      renderFatalError();
    }
  }

  function validateData(data) {
    if (!data || !Number.isInteger(data.season)) throw new Error('Season must be an integer.');
    if (!Array.isArray(data.players) || data.players.length === 0) throw new Error('Players must be a non-empty array.');
    if (new Set(data.players).size !== data.players.length) throw new Error('Players must be unique.');
    if (!Array.isArray(data.games)) throw new Error('Games must be an array.');

    let previousDate = '';
    for (const [index, game] of data.games.entries()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(game.date)) throw new Error(`Game ${index + 1} has an invalid date.`);
      if (game.date < previousDate) throw new Error('Games must be sorted chronologically.');
      previousDate = game.date;
      if (!data.players.includes(game.winner)) throw new Error(`Unknown winner in game ${index + 1}.`);
      if (!Array.isArray(game.participants) || game.participants.length === 0) throw new Error(`Game ${index + 1} needs participants.`);
      if (new Set(game.participants).size !== game.participants.length) throw new Error(`Duplicate participant in game ${index + 1}.`);
      if (!game.participants.includes(game.winner)) throw new Error(`Winner must be a participant in game ${index + 1}.`);
      for (const participant of game.participants) {
        if (!data.players.includes(participant)) throw new Error(`Unknown participant in game ${index + 1}.`);
      }
    }
  }

  function deriveSeason(data) {
    const totals = Object.fromEntries(data.players.map(player => [player, { player, wins: 0, gamesPlayed: 0, winPct: 0 }]));
    const snapshots = [];
    const winCounts = Object.fromEntries(data.players.map(player => [player, 0]));
    const gpCounts = Object.fromEntries(data.players.map(player => [player, 0]));

    data.games.forEach((game, index) => {
      game.participants.forEach(player => {
        gpCounts[player] += 1;
        totals[player].gamesPlayed += 1;
      });
      winCounts[game.winner] += 1;
      totals[game.winner].wins += 1;
      snapshots.push({
        gameNumber: index + 1,
        date: game.date,
        winner: game.winner,
        wins: { ...winCounts },
        gamesPlayed: { ...gpCounts },
        percentages: Object.fromEntries(data.players.map(player => [
          player,
          gpCounts[player] ? winCounts[player] / gpCounts[player] : 0
        ]))
      });
    });

    Object.values(totals).forEach(entry => {
      entry.winPct = entry.gamesPlayed ? entry.wins / entry.gamesPlayed : 0;
    });

    const standings = rankStandings(Object.values(totals));
    const leaderHistory = snapshots.map(snapshot => {
      const max = Math.max(...data.players.map(player => snapshot.percentages[player]));
      return data.players.filter(player => nearlyEqual(snapshot.percentages[player], max));
    });

    return {
      totals,
      standings,
      snapshots,
      leaderHistory,
      leadChanges: countLeadChanges(leaderHistory),
      streak: longestWinningStreak(data.games),
      recentFive: data.games.slice(-5),
      participation: data.players.map(player => ({
        player,
        count: totals[player].gamesPlayed,
        pct: data.games.length ? totals[player].gamesPlayed / data.games.length : 0
      })),
      latest: data.games.at(-1) || null,
      busyMonth: busiestMonth(data.games),
      drought: longestCurrentDrought(data),
      lastWin: Object.fromEntries(data.players.map(player => [player, latestWin(data.games, player)]))
    };
  }

  function rankStandings(entries) {
    const sorted = [...entries].sort((a, b) => {
      if (!nearlyEqual(b.winPct, a.winPct)) return b.winPct - a.winPct;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.player.localeCompare(b.player);
    });

    let previousPct = null;
    let previousRank = 0;
    return sorted.map((entry, index) => {
      const tied = previousPct !== null && nearlyEqual(entry.winPct, previousPct);
      const rank = tied ? previousRank : index + 1;
      previousPct = entry.winPct;
      previousRank = rank;
      return { ...entry, rank };
    });
  }

  function countLeadChanges(history) {
    if (history.length < 2) return 0;
    let changes = 0;
    let previous = history[0].slice().sort().join('|');
    for (let i = 1; i < history.length; i += 1) {
      const current = history[i].slice().sort().join('|');
      if (current !== previous) changes += 1;
      previous = current;
    }
    return changes;
  }

  function longestWinningStreak(games) {
    if (!games.length) return { length: 0, players: [] };
    let max = 1;
    let current = 1;
    const achievers = new Set([games[0].winner]);

    for (let i = 1; i < games.length; i += 1) {
      if (games[i].winner === games[i - 1].winner) {
        current += 1;
      } else {
        current = 1;
      }

      if (current > max) {
        max = current;
        achievers.clear();
        achievers.add(games[i].winner);
      } else if (current === max) {
        achievers.add(games[i].winner);
      }
    }

    if (max === 1) {
      games.forEach(game => achievers.add(game.winner));
    }

    return { length: max, players: [...achievers] };
  }

  function busiestMonth(games) {
    const counts = new Map();
    games.forEach(game => {
      const month = game.date.slice(0, 7);
      counts.set(month, (counts.get(month) || 0) + 1);
    });
    const max = Math.max(0, ...counts.values());
    const months = [...counts.entries()].filter(([, count]) => count === max).map(([month]) => month);
    return { count: max, months };
  }

  function longestCurrentDrought(data) {
    const result = data.players.map(player => {
      const appearances = data.games.filter(game => game.participants.includes(player));
      let lastWinAppearance = -1;
      appearances.forEach((game, index) => {
        if (game.winner === player) lastWinAppearance = index;
      });
      const gamesSince = lastWinAppearance === -1 ? appearances.length : appearances.length - 1 - lastWinAppearance;
      return { player, gamesSince, neverWon: lastWinAppearance === -1, appearances: appearances.length };
    });
    return result.sort((a, b) => b.gamesSince - a.gamesSince || a.player.localeCompare(b.player))[0] || null;
  }

  function latestWin(games, player) {
    for (let i = games.length - 1; i >= 0; i -= 1) {
      if (games[i].winner === player) return games[i];
    }
    return null;
  }

  function nearlyEqual(a, b) {
    return Math.abs(a - b) < 1e-9;
  }

  function renderAll() {
    renderHero();
    renderStandings();
    renderChart();
    renderStats();
    renderRecentForm();
    renderHistory();
    animateIn();
  }

  function renderHero() {
    const { data, derived } = state;
    const topPct = derived.standings[0]?.winPct ?? 0;
    const leaders = derived.standings.filter(entry => nearlyEqual(entry.winPct, topPct));
    const leaderName = leaders.length === 1 ? leaders[0].player : leaders.map(entry => entry.player).join(' + ');

    $('#seasonChip').textContent = `${data.season} · ${data.games.length} games`;
    $('#leaderName').textContent = leaderName;
    $('#leaderDetail').textContent = leaders.length === 1
      ? `${leaders[0].wins} wins · ${formatPct(leaders[0].winPct)} of games played`
      : `${leaders.length}-way tie · ${formatPct(topPct)}`;
    $('#leaderRibbon').textContent = leaders.length === 1 ? '👑 currently holds the crown' : '👑 the crown is currently shared';

    const leaderPawn = $('#leaderPawn');
    leaderPawn.dataset.player = leaders[0]?.player || 'Dad';
    leaderPawn.parentElement.dataset.player = leaders[0]?.player || 'Dad';

    if (derived.latest) {
      $('#latestResult').textContent = `${derived.latest.winner} won`;
      const participantCount = derived.latest.participants.length;
      const attendanceLabel = participantCount === data.players.length
        ? 'full table'
        : `${participantCount} ${plural('player', participantCount)} at the table`;
      $('#latestMeta').textContent = `${formatDate(derived.latest.date)} · ${attendanceLabel}`;
    } else {
      $('#latestResult').textContent = 'No games yet';
      $('#latestMeta').textContent = 'The board is suspiciously quiet.';
    }
  }

  function renderStandings() {
    const list = $('#standingsList');
    list.innerHTML = state.derived.standings.map((entry, index, standings) => {
      const next = standings[index + 1];
      const prev = standings[index - 1];
      const tied = (prev && nearlyEqual(prev.winPct, entry.winPct)) || (next && nearlyEqual(next.winPct, entry.winPct));
      return `
        <li class="standing-row ${entry.rank === 1 ? 'is-leader' : ''}" data-player="${entry.player}">
          <div class="standing-player">
            <span class="rank">${entry.rank}.</span>
            <span class="pawn" aria-hidden="true"></span>
            <span class="player-name">${escapeHtml(entry.player)}${tied ? '<span class="tie-mark">TIE</span>' : ''}</span>
          </div>
          <span class="standing-metric" aria-label="${entry.wins} wins">${entry.wins}</span>
          <span class="standing-metric" aria-label="${entry.gamesPlayed} games played">${entry.gamesPlayed}</span>
          <span class="standing-metric standing-percent">${formatPct(entry.winPct)}</span>
        </li>`;
    }).join('');
  }

  function renderChart() {
    const svg = $('#raceChart');
    const legend = $('#chartLegend');
    const mode = state.chartMode;
    const { data, derived } = state;
    const width = 720;
    const height = 390;
    const margin = { top: 30, right: 88, bottom: 44, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const maxWins = Math.max(1, ...data.players.map(player => derived.totals[player].wins));
    const yMax = mode === 'percentage' ? 1 : Math.max(5, maxWins);
    const yTicks = mode === 'percentage' ? [0, .25, .50, .75, 1] : Array.from({ length: yMax + 1 }, (_, i) => i);
    const x = index => margin.left + (derived.snapshots.length <= 1 ? 0 : index / (derived.snapshots.length - 1) * innerW);
    const y = value => margin.top + innerH - (value / yMax) * innerH;

    const fragments = [];
    yTicks.forEach(tick => {
      const yy = y(tick);
      fragments.push(`<line class="chart-grid-line" x1="${margin.left}" x2="${width - margin.right}" y1="${yy}" y2="${yy}" />`);
      fragments.push(`<text class="chart-axis-label" x="${margin.left - 8}" y="${yy + 4}" text-anchor="end">${mode === 'percentage' ? `${Math.round(tick * 100)}%` : tick}</text>`);
    });

    const xLabelIndices = [...new Set([0, Math.floor((derived.snapshots.length - 1) / 2), derived.snapshots.length - 1])];
    xLabelIndices.forEach(index => {
      const snapshot = derived.snapshots[index];
      if (!snapshot) return;
      fragments.push(`<text class="chart-axis-label" x="${x(index)}" y="${height - 13}" text-anchor="middle">${formatShortDate(snapshot.date)}</text>`);
    });

    data.players.forEach(player => {
      const color = PLAYER_META[player]?.color || '#666';
      const values = derived.snapshots.map(snapshot => mode === 'percentage' ? snapshot.percentages[player] : snapshot.wins[player]);
      if (!values.length) return;
      const points = values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
      fragments.push(`<polyline class="chart-line" points="${points}" stroke="${color}" />`);
      values.forEach((value, index) => {
        fragments.push(`<circle class="chart-dot" cx="${x(index)}" cy="${y(value)}" r="${index === values.length - 1 ? 5 : 3}" fill="${color}" />`);
      });
    });

    svg.innerHTML = `
      <title id="chartTitle">2026 Parcheesi ${mode === 'percentage' ? 'championship percentage' : 'cumulative wins'} race</title>
      <desc id="chartDesc">A line chart showing ${mode === 'percentage' ? 'win percentage among games played' : 'cumulative wins'} for Ben, Mom, Dad, Andrew, and Nathan across the 2026 season.</desc>
      ${fragments.join('')}
    `;

    $('#chartCaption').textContent = mode === 'percentage'
      ? 'Championship percentage after each game'
      : 'Cumulative wins after each game';

    legend.innerHTML = data.players.map(player => `
      <span class="legend-chip" style="--player-color:${PLAYER_META[player]?.color || '#666'}">
        <span class="legend-dot" aria-hidden="true"></span>${escapeHtml(player)}
      </span>`).join('');
  }

  function renderStats() {
    const { data, derived } = state;
    const recentCounts = new Map(data.players.map(player => [player, 0]));
    derived.recentFive.forEach(game => recentCounts.set(game.winner, recentCounts.get(game.winner) + 1));
    const recentMax = Math.max(0, ...recentCounts.values());
    const hotPlayers = [...recentCounts.entries()].filter(([, count]) => count === recentMax && count > 0).map(([player]) => player);

    $('#hotHandValue').textContent = hotPlayers.length ? joinNames(hotPlayers) : 'Nobody';
    $('#hotHandNote').textContent = recentMax
      ? `${recentMax} ${plural('win', recentMax)} in the last ${derived.recentFive.length} games.`
      : 'The computer detects no heat whatsoever.';

    $('#streakValue').textContent = `${derived.streak.length} ${plural('game', derived.streak.length)}`;
    $('#streakNote').textContent = derived.streak.length
      ? `${joinNames(derived.streak.players)} ${derived.streak.players.length === 1 ? 'owns' : 'share'} the season high.`
      : 'No streaks yet.';

    const maxParticipation = Math.max(0, ...derived.participation.map(item => item.count));
    const mostPresent = derived.participation.filter(item => item.count === maxParticipation).map(item => item.player);
    const allPresent = mostPresent.length === data.players.length;
    $('#participationValue').textContent = allPresent ? 'Everyone' : (mostPresent.length >= 3 ? `${mostPresent.length} regulars` : joinNames(mostPresent));
    $('#participationNote').textContent = allPresent
      ? `Everyone has played all ${data.games.length} games.`
      : `${joinNames(mostPresent)} ${mostPresent.length === 1 ? 'leads' : 'lead'} attendance at ${maxParticipation}/${data.games.length} games.`;

    $('#leadChangeValue').textContent = String(derived.leadChanges);
    $('#leadChangeNote').textContent = derived.leadChanges === 1
      ? 'One change in who led or shared the lead.'
      : `${derived.leadChanges} changes in who led or shared the lead.`;

    $('#busyMonthValue').textContent = derived.busyMonth.months.length ? derived.busyMonth.months.map(formatMonth).join(' + ') : '—';
    $('#busyMonthNote').textContent = derived.busyMonth.count ? `${derived.busyMonth.count} ${plural('game', derived.busyMonth.count)} recorded.` : 'No games yet.';

    if (derived.drought) {
      $('#droughtValue').textContent = derived.drought.player;
      $('#droughtNote').textContent = derived.drought.neverWon
        ? `Still hunting for win #1 after ${derived.drought.appearances} games played.`
        : `${derived.drought.gamesSince} ${plural('game', derived.drought.gamesSince)} since the last win.`;
    }
  }

  function renderRecentForm() {
    const container = $('#recentForm');
    container.innerHTML = state.derived.recentFive.map(game => `
      <div class="form-game" data-player="${game.winner}">
        <span class="pawn" aria-hidden="true"></span>
        <div class="form-name">${escapeHtml(game.winner)}</div>
        <div class="form-date">${formatMiniDate(game.date)}</div>
      </div>`).join('');
  }

  function renderHistory() {
    const { data } = state;
    const list = $('#historyList');
    const games = [...data.games].reverse();
    list.innerHTML = games.map(game => {
      const absentees = data.players.filter(player => !game.participants.includes(player));
      return `
        <article class="history-entry" data-player="${game.winner}">
          <time class="history-date" datetime="${game.date}">${formatMiniDate(game.date)}</time>
          <span class="pawn" aria-hidden="true"></span>
          <div>
            <div class="history-winner">${escapeHtml(game.winner)} won</div>
            <div class="history-note">${absentees.length ? `No ${escapeHtml(joinNames(absentees))}` : 'Everyone played'}</div>
          </div>
        </article>`;
    }).join('');
    updateHistoryToggle();
  }

  function wireControls() {
    $$('.chart-mode').forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.chartMode;
        if (!['percentage', 'wins'].includes(mode) || mode === state.chartMode) return;
        state.chartMode = mode;
        $$('.chart-mode').forEach(item => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        if (state.derived) renderChart();
      });
    });

    $('#historyToggle').addEventListener('click', () => {
      state.historyExpanded = !state.historyExpanded;
      updateHistoryToggle();
    });
  }

  function updateHistoryToggle() {
    const list = $('#historyList');
    const button = $('#historyToggle');
    list.classList.toggle('is-expanded', state.historyExpanded);
    button.setAttribute('aria-expanded', String(state.historyExpanded));
    button.textContent = state.historyExpanded ? 'Show recent only' : 'Show all games';
  }

  function animateIn() {
    const targets = ['.leader-card', '.latest-card', '.standing-row', '.chart-window', '.stat-card', '.form-strip', '.history-entry'];
    $$(targets.join(',')).forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--delay', `${Math.min(index * 35, 420)}ms`);
    });
  }

  function renderFatalError() {
    $('#leaderName').textContent = 'Data hiccup';
    $('#leaderDetail').textContent = 'The family computer could not read the season file.';
    $('#leaderRibbon').textContent = '⚠ try refreshing the page';
    $('#latestResult').textContent = 'Scoreboard unavailable';
    $('#latestMeta').textContent = 'The source data failed validation or could not load.';
    $('#standingsList').innerHTML = '<li class="standing-row"><div class="standing-player"><span class="rank">!</span><span class="pawn"></span><span class="player-name">Unable to calculate standings</span></div><span></span><span></span><span></span></li>';
  }

  function formatPct(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function formatDate(iso) {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  }

  function formatShortDate(iso) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  }

  function formatMiniDate(iso) {
    return new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  }

  function formatMonth(yyyyMm) {
    return new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(new Date(`${yyyyMm}-01T00:00:00Z`));
  }

  function joinNames(names) {
    if (names.length <= 1) return names[0] || '';
    if (names.length === 2) return `${names[0]} + ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} + ${names.at(-1)}`;
  }

  function plural(word, count) {
    return count === 1 ? word : `${word}s`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }
})();
