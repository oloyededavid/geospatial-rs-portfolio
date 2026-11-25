# Four geospatial tools: Stage 1 audit (consolidated)

25 November 2026. Audit only: no source, style, data, configuration or deployment was changed. Every journey below was run in headless Chromium against the current code, with screenshots; outputs were checked against the code that produced them.

Detail per tool: [`audit/geovalidate.md`](audit/geovalidate.md), [`audit/floodscope.md`](audit/floodscope.md), [`audit/agrosignal.md`](audit/agrosignal.md), [`audit/city-twins.md`](audit/city-twins.md).
Cross-cutting: [`audit/science-and-regression.md`](audit/science-and-regression.md), [`audit/shared-design-and-architecture.md`](audit/shared-design-and-architecture.md), [`audit/exports-and-reproducibility.md`](audit/exports-and-reproducibility.md), [`audit/maps-and-charts.md`](audit/maps-and-charts.md), [`audit/interaction-conventions.md`](audit/interaction-conventions.md), [`audit/portfolio-and-architecture.md`](audit/portfolio-and-architecture.md). Colour check script: [`tools/colour_check.py`](tools/colour_check.py).

## Requirements reconciled

The original brief's text was not recoverable; its requirements are taken from the owner's recap and combined with the addendum.

| Requirement | Source | Covered in this audit |
|---|---|---|
| Complete product and UX audit, full journeys | original, addendum §1, §4, §7 | all four tools, desktop/tablet/phone, every primary control |
| "Quiet Precision" design language | original (definition not recovered) | proposed working definition below, for approval |
| Global, not Nigeria-specific, positioning | original | FS-5, AS-6, shared examples |
| User-triggered, validated random examples | original | none exist today; plan below |
| Onboarding, contextual guidance, tooltips | original, addendum §1, §4 | GV-1/2/10, FS-7, AS-5, CT-6 |
| Scientifically meaningful results and interpretation | original, addendum §2 | GV-3/4, FS-1/2/3/11, AS-1/2, CT-1/2/3 |
| Cross-tool discovery and navigation | original | none exists today |
| Performance, accessibility, responsiveness | original, addendum §9 | measured per tool |
| Distinct personalities within one family | addendum §5 | design direction below |
| Independent QA, evidence-based scores, visual QA | addendum §6, §7 | planned for Stage 8–9; 9/10 is a target, not a score to produce |
| Preserve science; fixed fixtures for regression | addendum §8, owner's correction | `science-and-regression.md` |
| City Twins stays in three languages; tools English for now, ready for more | owner's decision | CT-5; design note below |
| Rethink layout and information architecture where the evidence shows it is inadequate | final expansion §1–3 | `portfolio-and-architecture.md`: three structural changes justified, no rebuild |
| Maps and charts as scientific communication; accessible colour; observed vs estimated vs derived | final expansion, data visualisation | `maps-and-charts.md`: colour measured, three palettes fail |
| Exports retain metadata, units, dates, methods, limits; shareable configurations; no incomplete export presented as complete | final expansion, export | `exports-and-reproducibility.md`: every file inspected |
| Consistent menus, dialogs, search, tooltips, notifications, loading, errors | final expansion, product consistency | `interaction-conventions.md` |
| Coherent collection within the portfolio; move between tools; return to the portfolio | final expansion, portfolio integration | `portfolio-and-architecture.md` |

## 1. Audit of each application (summary)

| | GeoValidate | FloodScope | AgroSignal | City Twins |
|---|---|---|---|---|
| Example journey | Works; 11 s engine + 14 s run | Works on live data; 34 s | Works on live data; 62 s | Works instantly |
| Reproduced published numbers | Yes, exactly (fixed inputs) | Yes, today (live inputs) | No: z 2.97 today vs 2.83 in the report (archive changed, code unchanged) | Yes (fixed data) |
| Every control exercised | Yes | Main ones; manual box drawing, rule sliders and the radar swipe not tested | Main ones; manual area, Aqua, crop toggle not tested | Yes |
| Error and empty states | Clear messages | Clear messages; boundary-service failure handled honestly | Clear | Clear |
| Downloads work | 6 of 6 | 6 of 6 | 6 of 6 | Save and Share work |
| Export contents | Excellent JSON record; CSV and GeoJSON without provenance | Good CSV and JSON; map image without legend; GeoTIFF without class key | Good JSON and band names; map image without colour scale | Card complete |
| Colour accessibility | Fold and class palettes fail | Borderline, with toggles | Diverging ramp fails | Pass |
| Shareable or reopenable run | No | No | No | Yes (link) |
| axe | 0 | 0 | 1 moderate | 0 |
| Phone overflow | 0 px | 0 px; map covered by overlays | 0 px | 0 px |
| Console errors | none | none | none | none |
| Strongest asset | Verified engine; computed gap sentence with caveat | Confidence split, exclusions, pixel inspection | Honest wording; data table; "does not show cause" | Honest match tiers; How it works |
| Biggest weakness | No per-class or sweep interpretation | Exposure caveat far from the headline figure; phone map | Post-2020 drift caveat not shown with a post-2020 headline | "Much alike" overstates; weak fallback not flagged |

## 2. Problems: shared and application-specific

### Shared (all or most tools)

| # | Severity | Problem | Evidence |
|---|---|---|---|
| S-1 | Medium | First view is four empty "–" figure boxes; purpose competes with placeholders | GV-1, FS-7, AS-5 |
| S-2 | Medium | On phones the form precedes the title and purpose | GV-2, FS-7, AS-5 |
| S-3 | High | Results are labelled but rarely interpreted; uncertainty and limits live in About, not beside the result | GV-3/4, FS-1/2/3, AS-1/2, CT-1/2 |
| S-4 | Medium | One example per tool, three of four set in Nigeria; no random examples | FS-5, AS-6, shared notes |
| S-5 | Medium | Example buttons behave differently (run vs fill) | AS-3 |
| S-6 | Medium | No cross-tool navigation | shared notes |
| S-7 | Medium | Shared stylesheet copied three times with no drift check; tools and City Twins use different neutral palettes and type | shared notes |
| S-8 | Medium | Canvas charts without data alternatives (except AgroSignal's table) | GV-6, FS-10 |
| S-9 | Medium | End-to-end regression depends on live archives | science-and-regression |
| S-10 | Low | Disabled primary buttons do not say why | GV-10 and the same pattern in FS and AS |
| S-11 | Low | No guide that walks through the workflow; About mixes summary, method, data and limits | all |
| S-12 | High | Exported map images have no legend or scale (FloodScope, AgroSignal): they look complete but cannot be read | EX-1 |
| S-13 | Medium | No export carries the limitations; several files carry no provenance; FloodScope's class GeoTIFF has no class key | EX-2, EX-3, EX-4 |
| S-14 | Medium | No analytical tool can be shared as a link or reopened from its saved record | EX-5 |
| S-15 | High | Colour palettes fail colour-vision checks: AgroSignal's diverging ramp loses the sign of the anomaly; GeoValidate's fold and class colours collide | VZ-1, VZ-2, VZ-3 |
| S-16 | Medium | Modelled or estimated values are not marked where they are read | VZ-4 |
| S-17 | Medium | Two search patterns; hover-only tooltips in places | IX-1, IX-2 |
| S-18 | Medium | No movement between tools; "Back to portfolio" lands on all projects, not tools | PI-1, PI-2 |
| S-19 | Medium | No place in the layout for a result's reading; first view and phone order inadequate | portfolio-and-architecture |

### Application-specific (highest first)

| # | Severity | Problem |
|---|---|---|
| FS-1 | High | Modelled residents shown without the "not people affected" caveat |
| FS-6 | High | Phone: map covered by legend and inspection card |
| AS-1 | High | Post-2020 overpass drift caveat missing beside a post-2020 headline |
| GV-3 | Medium | No reading of which classes generalise worst |
| GV-4 | Medium | Sweep chart without a reading |
| FS-2 | Medium | Refused automatic threshold not explained beside a two-peaked histogram |
| FS-3 | Medium | No threshold-sensitivity or limits reading with the result |
| FS-4 | Medium | Searched places become a 20 × 20 km box labelled as the whole place |
| AS-2 | Medium | Greenness and rainfall not read together |
| CT-1 | Medium | "Much alike" overstates the method |
| CT-2 | Medium | Weak fallback twins not flagged |
| CT-3 | Medium | No "why matched" breakdown |
| CT-4 | Medium | Ten candidates computed, one shown |
| others | Low | GV-5/7/8/9, FS-8/9/11, AS-4/7/8, CT-5/6/7/8 (see tool files) |

## 3. Scientific integrity and regression

Summary (full detail in `audit/science-and-regression.md`):

- All fixed-input tests pass: FloodScope engine and tracing, AgroSignal engine (46 checks), GeoValidate regression tests and the Pyodide engine with independent verification (22 checks, CPython rerun 100 % identical).
- No invented figures, sources or accuracy values found. Every interpretive sentence the tools produce today is traceable to computed values; two are worded beyond their basis (CT-1) or lack a caveat they need (FS-1, AS-1).
- Live end-to-end runs are evidence but not a regression gate: AgroSignal's Kano z moved from 2.83 to 2.97 between 23 and 25 November with no code change.
- Before any redesign, add fixed fixtures for the FloodScope Lokoja and AgroSignal Kano examples, a City Twins matching test, and wording tests for every new interpretive sentence.

## 4. Proposed unified design direction

**"Quiet Precision", working definition for approval.** The interface stays out of the way of the evidence: neutral surfaces, one accent per tool used sparingly for state and data, precise numerals with units and uncertainty always together, and explanation placed where the number is read, not in a separate page. Nothing decorative; motion only to show a change of state.

| Layer | Shared across the four | Varies by tool |
|---|---|---|
| Tokens | one neutral palette (align the tools' cool grey and the portfolio's warm grey into one), ink scale, rule colours, spacing, radii | the single accent: FloodScope blue, AgroSignal green, GeoValidate orange, City Twins ink/red |
| Type | Satoshi for text, one display serif (choose Zodiak or Newsreader for all four), Geist Mono for small labels only | none |
| Frame | top bar with tool name, version, About, a Tools switcher; the same "Reading" block under every result (finding · where · magnitude · uncertainty · do not conclude · method link) | layout: rail-map-panel for the three analytical tools; card-led comparison for City Twins |
| States | one pattern each for empty, loading (step and progress), error (what happened, next step), disabled (why), success, stale | wording |
| Guidance | a short Guide panel (workflow, inputs, reading the results, limits) that opens beside the work; tooltips only on first use of a technical term | content |
| Languages | text kept in one place per tool so French and German can be added later without restructuring; City Twins keeps EN/FR/DE | — |

Personalities (addendum §5): City Twins exploratory (browse candidates, "why matched"), FloodScope methodical (step evidence, threshold sensitivity), AgroSignal seasonal (time and anomaly first), GeoValidate diagnostic (design → evidence → reading).

**Page architecture (from `portfolio-and-architecture.md`).** Keep the rail · map · evidence layout for the three analytical tools; add three structures the evidence shows are missing:

1. A **pre-run workspace**: what the tool answers, a labelled example of the output, and three ways to start (run an example, a random validated example, your own area or data).
2. A **results header** with the Reading block above the figures; each figure marked observed, estimated or derived.
3. A **narrow-screen order**: purpose → start → reading → map (legend and inspection as bottom sheets) → evidence.

City Twins keeps its layout and gains a candidate strip and a "why matched" view.

**Maps, charts and exports.** Every palette validated with `tools/colour_check.py` before use; every map image export carries legend, scale, units, dates, method line, sources and limits; every chart has a text or table equivalent; one marker style for modelled and estimated values across the four tools.

**Interaction standard.** The tools' existing About sheet, Download menu, tabs, steps and progress pattern become the documented standard (they already behave consistently); one search component (type-ahead, arrow keys, de-duplicated); one tooltip pattern reachable by focus and tap; one error pattern; a Tools switcher in every top bar.

## 5. Prioritised implementation roadmap

Each stage ends with screenshots and the owner's approval before anything is pushed. GeoValidate is the pilot.

| Order | Work | Why first | Touches analytical code? |
|---|---|---|---|
| 0 | Regression fixtures and wording tests (FloodScope, AgroSignal, City Twins; pin GeoValidate figures); add `colour_check.py` to the shared checks | Protects the science before anything else changes | No (tests only) |
| 1 | High-severity fixes that can mislead now: FS-1 (exposure caveat), AS-1 (post-2020 caveat), CT-1/CT-2 wording, VZ-1 (diverging ramp), EX-1 (legend and scale on map image exports) | Prevents wrong conclusions and unreadable shared outputs | No (presentation and export of existing values) |
| 2 | Shared foundation: one stylesheet source and drift check; token alignment with the portfolio; display serif chosen; interaction standard; Tools switcher; back link to `#tools` | Foundation for the rest | No |
| 3 | GeoValidate pilot: pre-run workspace, results header and Reading (GV-3, GV-4), phone order, validated fold and class palettes (VZ-2, VZ-3), chart tables, states, Guide, export provenance (EX-4), shareable configuration (data stays local) | Smallest, deterministic, sets the pattern | No |
| 4 | FloodScope: same structure; Reading with threshold sensitivity (FS-2, FS-3, FS-11); search box labelling (FS-4); phone map sheets (FS-6); class key in GeoTIFF (EX-2); shareable configuration | Highest user-facing risk after the pilot | No |
| 5 | AgroSignal: same structure; Reading (AS-2); example behaviour (AS-3); running state; VCI ramp (VZ-5); shareable configuration | — | No |
| 6 | City Twins: "why matched", candidate strip, match strength, modelled markers (VZ-4), token alignment, FR/DE strings | Exploratory personality | No (uses the existing ranked list) |
| 7 | Validated random examples (global) per tool, each backed by a fixed fixture or stored expected values; portfolio card captions updated | Needs the fixtures from step 0 | No |
| 8 | Unified search component, tooltip and error patterns; performance and accessibility pass (early file checks in GeoValidate, live regions, keyboard map use, scroll lock) | — | No |
| 9 | Independent review (seven dimensions, evidence, honest scores), visual QA at 390/768/1280/1440, cross-tool review; `UX_REVIEW.md`, `SCIENTIFIC_COMMUNICATION_REVIEW.md`, `QUALITY_SCORECARD.md`, `VISUAL_QA.md` | — | No |

**Documentation plan (owner's decision 3).** Central in `project-notes/`: this audit, the shared design system, the implementation plan, the cross-tool scorecard and visual QA. In each repository: methodology and test report (already present for three tools; City Twins needs one, CT-8), and that tool's UX findings and changes. Shared content is written once centrally and linked, not copied.

## 6. Dependencies, risks, unresolved questions

| Item | Detail |
|---|---|
| Live data services | Planetary Computer, Nominatim, OpenFreeMap, EOX tiles, jsDelivr (Pyodide), geoBoundaries. geoBoundaries and githubstatus.com are not reachable from this environment; the rest were. |
| GitHub | Independent evidence of an incident today: the API returned 500 and 502 on re-run requests and a Pages deploy stayed queued over 17 minutes (normally under one). Deployment is kept out of this project's audit. |
| Fixture size | Must stay small (cropped to example boxes) to keep repositories light. |
| Random examples | Each must be validated (expected values stored); live regeneration would reintroduce drift. |
| Display serif | Tools use Zodiak, portfolio headings use Newsreader: one must be chosen. |
| Unresolved | (1) Approve or amend the "Quiet Precision" working definition. (2) Where `project-notes/` should be committed (it is outside every repository now). (3) Whether City Twins may gain a methodology note in its repository (CT-8). (4) Which regions to use for the random examples. |

## 7. Preserve, improve, remove, rebuild

| Decision | What |
|---|---|
| **Preserve** | All analytical engines and readers; validation records; the three-step rail; exclusions and confidence classes (FloodScope); honest wording tiers (City Twins, AgroSignal); stale-result warnings; error messages; downloads with processing records; About limits; City Twins' three languages |
| **Improve** | First view, phone order, result interpretation (Reading block), uncertainty placement, example behaviour, states, chart accessibility, palettes, export contents (legend, scale, provenance, limits), shared styling and navigation, search, tooltips, City Twins exploration |
| **Add (justified by evidence)** | Pre-run workspace, results header, shareable configuration and reopening a saved run, validated random examples, Tools switcher, a Guide panel, regression fixtures |
| **Remove** | Empty "–" figure placeholders as the first view; the phrase "Much alike"; failing palettes; hover-only tooltips; duplicate, unchecked copies of the stylesheet as an unmanaged practice |
| **Rebuild** | Nothing. No component was found that needs rebuilding; the weaknesses are structure of the result area, guidance, visual encoding, exports and testing, not the tools' foundations |
