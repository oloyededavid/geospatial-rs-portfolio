# Portfolio integration and page architecture: Stage 1 audit

## Portfolio integration today

| Visitor need | Today | Evidence | Gap |
|---|---|---|---|
| Discover all four tools | Four "Interactive tool" cards in the projects catalogue; a "Tools" link in the top menu filters the catalogue to them | `index.html` articles `tool-0` … `tool-3`; `script.js` line 124 | Works |
| Understand what distinguishes each | Question-style titles ("Would your classifier score as well somewhere new?"), method tags, one sentence, an example caption | card text | Good; three of four captions are Nigerian examples (positioning) |
| Know they are real methods | Tags (Sentinel-1 radar, MODIS NDVI, scikit-learn, Urban Centre Database) | card text | Good; no link to each tool's methodology or validation from the card |
| Move between tools | Not possible from inside a tool; only "Back to portfolio" | tools' `index.html` | **Missing** (S-6) |
| Return to the portfolio | "Back to portfolio" lands on `#studies` (all projects, unfiltered), not `#tools` | `class="back" href=…#studies` in all three tools | Returns to the wrong place for someone comparing tools |
| Recognise one family | Tools share a frame; City Twins looks like the portfolio | screenshots | Partial (S-7) |

### Findings

| # | Severity | Problem | Recommendation |
|---|---|---|---|
| PI-1 | Medium | No movement between tools | Tools switcher in every tool's top bar (four entries, current one marked, one-line purpose each) |
| PI-2 | Low | Back link lands on all projects | Point to `#tools` (the filtered view) |
| PI-3 | Low | Cards do not link to method or validation | A quiet "Method and tests" link on each card to the tool's methodology |
| PI-4 | Medium | Example captions are Nigerian for three of four tools | Follows from global examples (S-4) |

## Page architecture: is the current structure adequate?

The three analytical tools share one layout: **rail** (steps, 296 px) · **map** (centre) · **evidence panel** (400 px, tabs), with a **figures row** above map and panel. City Twins uses search and table on the left, the card on the right.

| Question | Evidence | Assessment |
|---|---|---|
| Does the triptych work on desktop? | All journeys completed at 1440 × 900; map 744 px wide; evidence readable (05-result, 08-result, 04-result) | **Yes.** Keep it for the analytical tools. |
| Where does the result's meaning go? | Title and subtitle carry one computed sentence; figures carry captions; interpretation, uncertainty and limits are spread across a tab, the log and About | **Inadequate.** There is no place for a reading. A results header with a "Reading" block (finding, where, magnitude, uncertainty, do not conclude, method) is a structural addition, not a restyle. |
| What does the first view say? | Four empty figure boxes, an empty evidence tab, a world or regional map | **Inadequate.** The workspace before a run should show what the tool answers, an example of the output and three ways to start (example, random example, your own data or area). |
| One evidence tab at a time | Folds/Metrics/Block size; Images/Threshold/Land cover/Areas; Years/Curve/Pixels/Run | Adequate on desktop; the first tab after a run should be the one that explains the result (it is today for GeoValidate and AgroSignal; FloodScope opens Threshold) |
| Phone and tablet | Form first, purpose second, results far below; FloodScope map covered by overlays; AgroSignal scrolls to the result after a run, the others do not | **Inadequate.** Order should be: purpose → start choices → (after a run) reading → map with overlays as sheets → evidence |
| Configuration | Steps reveal settings progressively; advanced settings behind "Rules", "Model and seed", "Satellite" | **Good.** Keep progressive disclosure; add one-line help on first technical term |
| Preserving work | No URL state, no reopening a run | **Inadequate** (EX-5) |
| City Twins | Search, comparison table, card; one twin only | Adequate structure; needs a candidate strip ("next twin") and a "why matched" view rather than a new layout |

**Conclusion.** No tool needs a wholesale rebuild. Three structural changes are justified by the evidence: (1) a pre-run workspace that explains and offers start choices, (2) a results header with a Reading block in every tool, (3) a narrow-screen order and map-overlay behaviour designed for phones. City Twins gains exploration (candidates, why matched) within its existing layout.
