# Interaction conventions across the four tools: Stage 1 audit

Checked in the browser (`ix.cjs`, the journey scripts) and in code.

| Component | GeoValidate | FloodScope | AgroSignal | City Twins | Consistent? |
|---|---|---|---|---|---|
| Top bar | ← Back to portfolio · name · version · About and method | same | same | portfolio navigation (Projects, Tools, About, GitHub, EN/FR/DE) | Tools yes; City Twins differs |
| Information dialog | custom sheet `role="dialog"`: focus starts on Close, Tab stays inside, Esc closes, focus returns to the opener | same | same | none ("How it works" is an in-page disclosure) | Tools yes |
| Background while dialog open | page still scrollable | same | same | — | Consistent, but scroll should lock |
| Download menu | `<details>` menu; closes on Esc and outside click; items disabled with an explanatory note until a result exists | same | same | Save card and Share as two buttons | Tools yes |
| Steps | three-step rail; locked steps not focusable; done steps show a summary | three steps | two steps | single search | Tools yes |
| Primary button disabled | no reason given | no reason given | no reason given | — | Consistent, but S-10 |
| Search | — | submit to Nominatim, list of result buttons (Tab only; ArrowDown stays in the box); duplicates possible ("Lokoja" twice) | same | type-ahead from local data, arrow keys, "closest names" for typos | Two different patterns |
| Example | "Run example" (runs) and "Load sample" (loads) | "Lokoja example" (runs) | "Kano example" (fills only) | default pairing on arrival | No (S-5) |
| Progress | rail bar, message, collapsible log | same | same | none needed | Tools yes |
| Errors | inline red text in the step; engine failure offers "Try again" | log line in red; result cleared | message in the step | inline message under search | Similar, different places |
| Success | figures fill, rail summary "Done: …" | same | same | card redraw | Tools yes |
| Feedback notifications | none (status line only) | none | none | Share button label changes to "Link copied" | Fine; no toasts needed |
| Tooltips | `title` attributes on figure captions | `title` on one element | custom chart tooltip `#tip` on hover only, plus `title` | none | Inconsistent; hover-only in places |
| Tabs | `role="tab"`, arrow keys | same | same | — | Tools yes |
| Map controls | MapLibre zoom, legend `<details>` with Hide | same, plus layer toggles and radar swipe slider | same, plus layer segmented control | static discs | Mostly |
| Typography of controls | sentence-case sans | same | same | uppercase monospace buttons ("SAVE CARD", "SHARE"), "HOW IT WORKS +" | City Twins differs |

## Findings

| # | Severity | Problem | Recommendation |
|---|---|---|---|
| IX-1 | Medium | Two search patterns: submit + list (FloodScope, AgroSignal) and type-ahead (City Twins); list results not reachable with arrow keys; duplicate place results | One search component: type-ahead suggestions with arrow keys, de-duplicated results, the same empty and no-match messages |
| IX-2 | Low | Tooltips: hover-only chart tooltip in AgroSignal; `title` attributes elsewhere (not available by keyboard or touch) | One tooltip pattern reachable by focus and tap; charts backed by tables |
| IX-3 | Low | Page behind the About dialog still scrolls | Lock background scroll while open |
| IX-4 | Low | Errors appear in different places (step, log, under search) | One error pattern: message where the action was taken, the next step, details in the log |
| IX-5 | Medium | City Twins' controls use the portfolio's uppercase monospace style; the tools use sentence-case sans | Shared control styles (S-7) |
| IX-6 | Medium | Example controls differ in label and behaviour (S-5) | "Try an example" that runs, plus a random validated example |

Redundant components found: none that duplicate a function on the same page. The shared top-bar pattern, About sheet, Download menu and tabs are sound and should become the documented standard.
