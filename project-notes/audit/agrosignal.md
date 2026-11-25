# AgroSignal: Stage 1 audit

Code audited: `oloyededavid/AgroSignal` at aa33cf6 (v1.0.0), served locally with `http-server` (range requests), unchanged. Live at https://oloyededavid.github.io/AgroSignal/.
Screenshots and the journey record were taken during the audit and are not kept in the repository; the upgraded screens are in `../visual-qa/`.

## What was exercised

Landing (desktop), axe, the Kano example, "Run analysis" on live Planetary Computer MODIS data with the bundled CHIRPS archive, all four evidence tabs, all five map layers, hover on the years chart, five downloads, the About panel, phone layout after a run.

## Measured behaviour

| Step | Result |
|---|---|
| Page load | 2.6 s |
| "Kano example" | Fills area (1,934 km² around Bagwai), months Jun–Oct, season 2026, baseline 2001–2020, opens step 2; **does not run** |
| Run | 62 s: archive search (7.5 s), "189 Terra composites: 20 baseline seasons and the 2026 season", then "Read N of 189 composites" every ~2 s |
| Headline | "Jun–Oct 2026: much greener than usual"; mean NDVI 0.525 over 30,583 cropland pixels against 0.453 (2001–2020); higher than 20 of 20 baseline seasons |
| Figures | regional z +2.97 (mean of pixel z +2.26); rainfall +2 % (896 against 879 mm, 4 CHIRPS cells); temperature 27.7 °C against 26.8 °C (NASA POWER) |
| Pixels tab | much above 78.6 %, above 16.3 %, near normal 3.7 %, below 1.1 %, much below 0.4 % |
| Run tab | rules (pixel reliability 0–1, ≥ 50 % of composites per season, ≥ 67 % of baseline years, cropland ≥ 50 %), software version, timestamp, full log |
| Years tab | chart, baseline band ± 1 SD, rainfall bars, a data table, and "NDVI and rainfall correlate at r = 0.18; this describes the baseline only and does not show cause" |
| Downloads | GeoTIFF 1.05 MB, years CSV 1.7 KB, pixels CSV 5.9 MB, JSON 36 KB, PNG 534 KB |
| axe | 0 on landing; after a run 1 moderate (`region`: the floating chart tooltip `#tip` lies outside landmarks) |
| Phone | 0 px overflow; on narrow screens the page scrolls to the result after a run (code, `app.js` line 330) |
| Console | No errors |

**Live-data drift observed.** The test report (23 November 2026) gives regional z 2.83 for this example; today's run gives 2.97 with unchanged code. The live archive changed between runs. This is the evidence for fixed fixtures in the regression plan.

## Findings

| # | Severity | Type | Evidence | User impact | Recommendation |
|---|---|---|---|---|---|
| AS-1 | High | Science communication | Headline "much greener than usual" for a 2026 season against a 2001–2020 baseline; the overpass-drift caveat (Terra earlier since 2020, Aqua later since 2021, effect on NDVI not quantified, `docs/methodology.md` line 99) appears only in About → Limits | A record anomaly can be partly a sensor effect; the reader sees the headline without the caveat | When the target season is after 2020 and the baseline is not, show the caveat with the result and point to the existing Aqua option as a check (the test report's Terra/Aqua comparison ranked 2026 highest with both, z 2.83 and 1.89) |
| AS-2 | Medium | Science communication | Rainfall +2 % beside the top-ranked greenness; no line relates them | The most interesting contrast (greener without more rain) is left unsaid | A computed sentence stating both facts side by side, with the existing "does not show cause" caveat; no causal explanation invented |
| AS-3 | Medium | Consistency / first use | "Kano example" fills the form but does not run; GeoValidate's "Run example" and FloodScope's "Lokoja example" run | Users expecting a result wait at a filled form; inconsistent across the family | Same behaviour and label pattern in all tools ("Run the … example") |
| AS-4 | Low | State | While running, the evidence panel still says "Choose an area and a season, then run the analysis" (03-running) | Contradictory message during a 60 s wait | A running state in the panel |
| AS-5 | Medium | Usability | Landing: four "—" figure boxes before any run; on phones the form precedes the purpose | As GV-1, GV-2 | As GV-1, GV-2 |
| AS-6 | Medium | Positioning | One example, in Nigeria | Global positioning requirement | Validated examples in several regions; the test report's other regions (Free State, Saskatchewan, Punjab, southern Finland) are candidates |
| AS-7 | Low | Accessibility | axe `region` on `#tip`; chart values reachable through the Table (good), hover tooltips otherwise | Minor | Place the tooltip inside the main landmark |
| AS-8 | Low | Interpretation aid | The z-score map legend reads "SD from the baseline mean"; no plain-language gloss on the map | Non-specialists may not read z | One-line gloss ("+2 means two typical year-to-year swings above normal") |

## Preserve

The engine and its 46 hand-worked tests; season membership by composite day of year; cropland share from true pixel footprints; CHIRPS archive (after NASA POWER was rejected for rainfall, documented); the honest wording ("greener" not "better harvest", "does not show cause"); the Run tab's rules and log; the data table under the chart; the sensor choice; the rainfall-outside-coverage message.

## Not tested

Searching and drawing an area by hand; a season crossing the new year; Aqua; the "Cropland pixels only" toggle off; a place outside CHIRPS coverage (covered by `global_check.mjs` per the test report); a screen reader; phone result screenshots were captured but not read in detail beyond overflow.
