// City Twins regression check on the fixed data (twin/cities.json): the chosen twin, the match tier and the card wording for
// a fixed list of cities, in the browser. Serve the repository first (python3 -m http.server 8768) and run: node tests/twins_check.cjs
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8768';
const EXPECT = [
  ['Lagos, Nigeria', 'Lagos and Ho Chi Minh City', 'Close match', 'Same climate, similar size.'],
  ['Tokyo, Japan', 'Tokyo and Shanghai', null, null],
  ['La Paz, Bolivia', 'La Paz and Ushuaia', 'No close match', 'Same climate type.'],
  ['Reykjavik, Iceland', 'Reykjavik and Aberdeen', 'No city in another country shares this climate type', 'Nearest climate, similar size.'],
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); let bad = 0;
  for (const [city, rank, tier, head] of EXPECT) {
    await p.goto(`${BASE}/twin/?city=${encodeURIComponent(city)}`); await p.waitForFunction(() => document.querySelector('.tw-tier'), null, { timeout: 30000 });
    const got = await p.evaluate(() => ({ rank: document.getElementById('twin-rank').textContent, tier: document.querySelector('.tw-tier').textContent, card: document.getElementById('twin-card').getAttribute('aria-label') }));
    const ok = got.rank === rank && (!tier || got.tier.startsWith(tier)) && (!head || got.card.includes(head)) && !/much alike/i.test(got.card);
    if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'} ${city}: ${got.rank} | ${got.tier.slice(0, 40)}…`);
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
