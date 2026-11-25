# GeoValidate: Stage 1 audit

Code audited: `oloyededavid/GeoValidate` at 3cda82c (v1.0.0), served locally, unchanged. Live at https://oloyededavid.github.io/GeoValidate/.
Screenshots and the journey record were taken during the audit and are not kept in the repository; the upgraded screens are in `../visual-qa/`.

## What was exercised

Landing (desktop 1440 × 900, tablet 768, phone 390), keyboard order, About panel and Esc, a non-CSV file, an empty CSV, the sample, every column control, the block-size slider at its minimum (0.5 km) and maximum (100 km), a full comparison, both result tabs, all four map views, the legend, the block-size sweep, all six downloads (print intercepted), and axe before and after a run.

## Measured behaviour

| Step | Result |
|---|---|
| Page load | 2.7 s to usable |
| Load sample (first time) | 11 s: "Starting the Python engine…" → "Downloading Python packages … about 36 MB" → "Loading the GeoValidate engine" → "Engine ready" → "5,000 rows · 20 columns · SHA-256 …" |
| Comparison, 5 folds, 10 km blocks | 14 s, a progress message and bar per fold (8 % → 100 %) |
| Result | Random 93.2 % (kappa 0.915), spatial 88.8 % (kappa 0.861), −4.4 points, median test-to-training 158 m / 3.1 km; identical to the test report and to the fixed-input regression run |
| Block size 100 km | Run disabled, with "Only 1 blocks of 100 km contain data; use smaller blocks or fewer folds" |
| Sweep (1–20 km) | 34 s; accuracy falls from about 91.6 % at 1 km to about 88 % at 20 km |
| Downloads | evaluation CSV 3 KB, folds CSV 382 KB, GeoJSON 1.36 MB, configuration JSON 3 KB, charts PNG 36 KB, report (print) with content |
| axe | 0 violations before and after a run |
| Phone, 390 px | 0 px horizontal overflow |
| Console | No errors from the tool; aborted basemap tile requests during zoom only (normal) |

## Findings

Severity: **High** blocks understanding or risks a wrong conclusion; **Medium** costs effort or clarity; **Low** polish.

| # | Severity | Type | Evidence | User impact | Recommendation |
|---|---|---|---|---|---|
| GV-1 | Medium | Usability | 01-landing: four result boxes show "–" before any data; the title and question sit beside them | The first view is mostly empty placeholders; the purpose sentence competes with them | Before a run, show what the comparison will produce (one sentence and an illustrative, clearly labelled outline) instead of empty figures |
| GV-2 | Medium | Usability | Phone and tablet (14-tablet): the three-step form comes first; the title and the question "Would your classifier score as well somewhere new?" sit below it | A phone user meets configuration before learning what the tool is for | On narrow screens, place title and purpose above the steps |
| GV-3 | Medium | Science communication | 09-metrics: per-class tables for both designs, but no sentence says which classes lose most under spatial blocks (Plantation forest recall 0.887 → 0.703; Forest precision 0.896 → 0.761) | The most informative part of the result (where generalisation fails) is left to the reader to find | A templated sentence from the computed per-class differences: largest drops in recall and precision, with values |
| GV-4 | Medium | Science communication | 11-sweep: the chart has no reading; the explanation of why accuracy falls with block size is only in About | The sweep is hard to interpret for a non-specialist | One computed sentence (range of accuracy over block sizes) and a link to the autocorrelation explanation; no claim of an "optimal" block size |
| GV-5 | Low | Consistency | During the sweep the rail status still reads "Done in 14.1 s"; progress shows only on the sweep button | Two progress places disagree | Use one status location for every long task |
| GV-6 | Medium | Accessibility | Fold chart and sweep are canvas images with a generic `aria-label`; no values reachable by keyboard or screen reader | Results not available without sight | Provide the same values as a small table (visually hidden or toggleable) |
| GV-7 | Low | Accessibility | Confusion-matrix labels truncated ("Cropland and …", "Bui", "Cro") | Classes hard to identify | Full names in an accessible header; abbreviations only visual |
| GV-8 | Low | Performance | An empty or malformed CSV is reported only after the 36 MB engine has downloaded (≈ 10 s) | Slow error for a trivial problem | Check file type, size, emptiness and parse in JavaScript before starting the engine (no change to analysis) |
| GV-9 | Low | Usability | Tablet: after "Compare", results are below the fold; nothing moves the view | User may not notice the result | Move focus or scroll to the result heading on completion (narrow screens) |
| GV-10 | Low | Interaction | Disabled Continue in step 1 gives no reason; the drop area text implies it | Mild uncertainty | Short helper text: "Load a file or the sample to continue" |

## Preserve

The engine and its verification (fixed-input baseline reproduced exactly: 0.9324 / 0.8884, all `verify.py` checks pass); the three-step rail; the stale-result warning; the fold preview; the plain, computed gap sentence with its caveat; the About "Limits" list (map accuracy needs a probability sample; spatial blocks are not automatically better); upload validation messages; downloads with configuration and file hash.

## Not tested

GeoJSON upload with real polygons; projected coordinates with an EPSG code (covered by `regression_test.py` at engine level only); the buffer option at non-zero values; files near 50,000 rows (performance); Safari and Firefox; a screen reader.
