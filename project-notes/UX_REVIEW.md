# UX review

Before: the audit (`audit/*.md`, findings GV-, FS-, AS-, CT-, IX-, PI-). After: the upgraded live tools, 25 November 2026.

## First use

| Tool | Before | After |
|---|---|---|
| GeoValidate | Four empty "–" boxes; purpose sentence beside them; phones showed the form first | Opening screen: what it answers, four outputs, "Run the Mau Forest example", "Use my own file", the 36 MB first download stated; purpose first on phones |
| FloodScope | Same empty boxes; world map; example called "Lokoja example" | Opening screen with outputs and "Run the Lokoja example (Nigeria, October 2022)"; purpose first on phones |
| AgroSignal | Same; "Kano example" only filled the form | Opening screen; "Run the Kano example" runs; greenness-not-yield stated before any run |
| City Twins | A sample pair on arrival (kept) | Unchanged entry; adds "Why this twin" and other candidates |

## Workflow and interaction

- Every disabled primary button now says what is missing (hints under the buttons).
- Progress for every long task appears in one place (GeoValidate's sweep now reports in the status line); AgroSignal's evidence panel shows a running state instead of "choose an area".
- The four tools share a Tools menu (current tool marked) and "Back to portfolio" opens the tools view.
- Shareable links reproduce FloodScope and AgroSignal runs (tested: same figures in a fresh page).
- Dialogs, menus and tabs already followed one pattern (focus kept in About, Esc closes, menus close on Esc and outside click); the page behind an open About panel no longer scrolls.

## Accessibility

axe: 0 violations on landing and after a run in all four tools after the upgrade (one histogram-slider issue found during testing, fixed). Keyboard: tab order through steps and result controls checked; FloodScope's threshold slider announces value and area. Colour: fold, class and anomaly palettes replaced and measured for protan, deutan and tritan vision. Not tested: a real screen reader, Safari and Firefox.

## Open

Two search patterns remain (IX-1); no separate guide panel (S-11); confusion-matrix labels shortened on screen (GV-7); on phones the settings stay above the results after a run (the page scrolls to the Reading).
