# Maps and charts as scientific graphics: Stage 1 audit

Method: every map and chart was viewed in the journey screenshots; palettes were taken from the code and tested with a colour-vision simulation (Machado et al. 2009, full severity) and perceptual distance in OKLab (ΔE × 100). Thresholds used: categorical colours should stay ≥ 15 apart with normal vision and ≥ 8 apart under colour-vision deficiency (6–8 acceptable only with a second cue such as labels or pattern). Script: [`../tools/colour_check.py`](../tools/colour_check.py) (palettes copied from the code at the audited commits; run with `python3`).

## Colour results

| Palette | Where | Worst pair, normal | Protan | Deutan | Tritan | Verdict |
|---|---|---|---|---|---|---|
| Folds (k = 5) | GeoValidate fold map and fold chart | 14.0 | 3.8 | **0.7** (fold 3 red / fold 5 green) | 8.9 | **Fails**: two folds identical for deuteranopes |
| Classes (5) | GeoValidate class map, confusion matrix | **8.7** (light green / yellow) | 3.3 | 3.6 | 8.4 | **Fails** even for normal vision |
| Errors (wrong / right) | GeoValidate errors view | 32.2 | 36.6 | 27.5 | 34.4 | Pass |
| Flood classes (5) | FloodScope map | 8.7 (water before / excluded slope) | 5.5 | 7.8 | 7.5 | Borderline; legend toggles act as the second cue |
| Diverging ramp ends | AgroSignal z-score, anomaly, VCI | 16.2 | 5.4 | **2.8** | 19.5 | **Fails**: the sign of the anomaly (browner vs greener), the map's main message, is lost for red-green colour-blind readers |
| Sequential ramp | AgroSignal season NDVI, cropland share | 7.3 per step | 6.7 | 6.6 | 5.9 | Pass for a continuous ramp (monotonic lightness) |
| Pair markers | City Twins card and table | 45.6 | 33.1 | 43.6 | 48.0 | Pass |

## Chart and map review

| Graphic | Question it answers | Strengths | Problems |
|---|---|---|---|
| GeoValidate fold map | Where are the folds and blocks? | Block grid drawn, 10 km scale bar, legend | Fold colours (above) |
| GeoValidate errors view | Where does spatial validation fail? | Clear two-colour encoding | Only spatial-design errors; the random-design errors are not viewable for comparison |
| GeoValidate accuracy by fold | How variable is each design? | Mean line per design, dots per fold | No fold legend in the panel (only in the map legend); no values on hover or as text |
| GeoValidate sweep | How does accuracy change with block size? | Log x-axis labelled, random reference dashed and labelled | No reading; no per-point values; y-axis 85–95 % without a break note (acceptable for a line) |
| GeoValidate confusion matrix | Which classes are confused? | Counts in cells, shaded diagonal | Truncated labels; no row normalisation option; spatial vs random only by scrolling |
| FloodScope map | Where did new water appear? | Confidence split, exclusions, before/after radar swipe, 2 km scale bar, legend toggles, pixel inspection | Phone overlays (FS-6); estimated population not mappable (exposure exists only as totals) |
| FloodScope histogram | Where does the water threshold fall? | Threshold annotated ("Water below −18.0 dB"), keyboard control | Automatic split value not shown on the chart; y-axis unlabelled (counts) |
| FloodScope land cover | What was flooded? | Text values with units | Bars without a total; WorldCover is 2021 (stated in About only) |
| AgroSignal anomaly maps (z, anomaly, VCI) | Where is the season unusual? | Units in legend, cropland-only note, scale bar | Diverging colours fail for deuteranopes; VCI ramp centred at 50, which is not a "normal" point for VCI (the middle of the baseline range), so the neutral colour suggests a meaning it does not have |
| AgroSignal years chart | How does this season compare with each baseline season? | Baseline band ± 1 SD, target labelled, table available | The 2021–2025 gap on the x-axis is not marked |
| AgroSignal rainfall bars | Was it wetter or drier? | Separate chart (no dual axis), reading with correlation caveat | — |
| AgroSignal season curve | How did the season unfold? | 10th–90th percentile band | Not inspected in detail |
| City Twins card | How do the two cities compare? | Shared scale for population curves, "(modelled)" on the population chart | — |
| City Twins table | — | Units on each value | "Population 1975" is modelled but not marked as such in the table (only in the footer and on the card chart) |

## Observed, estimated and derived values

| Tool | Observed | Estimated or modelled | Derived | Distinguished in the interface? |
|---|---|---|---|---|
| FloodScope | radar backscatter | residents (GHS-POP model), land cover (WorldCover classification) | flood classes, areas | Labels say "Modelled residents"; no visual distinction between derived areas and modelled exposure; caveat misplaced (FS-1) |
| AgroSignal | NDVI composites | rainfall (CHIRPS satellite–station blend), temperature (NASA POWER reanalysis), cropland (WorldCover) | anomaly, z, VCI, rank | Sources named; rainfall not marked as an estimate |
| GeoValidate | user's labels and predictors | — | folds, predictions, metrics | Clear |
| City Twins | — | temperature, population (modelled before 2025), building height, greenness (satellite estimates) | match, ratios | Stated in How it works and footer; not at the values (CT table) |

## Findings to add to the problem list

| # | Severity | Problem | Recommendation |
|---|---|---|---|
| VZ-1 | High | AgroSignal diverging ramp loses the sign under red-green deficiency | A diverging scheme that keeps the two sides apart in lightness and hue for all common deficiencies (for example brown–teal), validated with the same script; keep "browner/greener" wording in the legend |
| VZ-2 | Medium | GeoValidate fold colours: folds 3 and 5 identical for deuteranopes | Validated categorical order; fold number labels on blocks at sufficient zoom |
| VZ-3 | Medium | GeoValidate class colours fail even for normal vision | Validated categorical palette; labels in the legend and matrix |
| VZ-4 | Medium | Estimated and modelled values not marked where they are read (City Twins table, AgroSignal rainfall, FloodScope residents) | A consistent marker for modelled or estimated values (for example "modelled" tag and a dotted underline with a tooltip), used in all four tools |
| VZ-5 | Low | VCI map centred at 50 with a neutral colour | Sequential ramp for VCI, or a centre at the baseline mean's VCI with explanation |
| VZ-6 | Low | Charts without text values (GeoValidate, FloodScope) | Text or table equivalents (also S-8) |
| VZ-7 | Low | AgroSignal x-axis gap 2021–2025 unmarked | Axis break mark |
