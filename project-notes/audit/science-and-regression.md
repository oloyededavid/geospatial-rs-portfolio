# Scientific integrity and regression: Stage 1 assessment

Rule for the implementation phase: no calculation, data-processing, projection or statistical code changes as part of the redesign. Any change to analytical behaviour follows the six-point record in the addendum (§8) and gets its own commit and test.

## What was run in this audit (no code changed)

| Tool | Test | Inputs | Result |
|---|---|---|---|
| FloodScope | `tests/engine_test.mjs` (focal mean, dB, Otsu valley test, slope, classification, summaries, ellipsoidal cell area, UTM scale, grid, rasterising) | hand-worked, fixed | ALL PASSED |
| FloodScope | `tests/trace_test.mjs` (polygon tracing: areas, holes, corner pixels) | fixed | PASS (26 of 26, 3 polygons, 1 hole) |
| FloodScope | `tests/version_check.mjs` | fixed | agree (1.0.0) |
| AgroSignal | `tests/engine_test.mjs` (46 checks: season membership, screening, baseline statistics, anomalies, cropland weighting, rainfall sums) | hand-worked, fixed | ALL PASSED |
| GeoValidate | `tests/version_check.mjs` | fixed | agree (1.0.0) |
| GeoValidate | `tests/regression_test.py` (issues from the earlier independent review) | fixed | ALL PASSED (scratch Python environment; scikit-learn 1.5.2, pyproj) |
| GeoValidate | browser engine on the sample under Node (Pyodide 0.26.4, scikit-learn 1.4.2), then `tests/verify.py` | fixed sample, seed 42 | random 0.9324, spatial 0.8884 (identical to the test report); all 22 independent checks PASS, CPython rerun 100 % identical |
| FloodScope | Lokoja example in the browser | **live** Planetary Computer data | 22.4 km², 4,987 residents: identical to the test report |
| AgroSignal | Kano example in the browser | **live** Planetary Computer data, bundled CHIRPS | see `agrosignal.md` |
| City Twins | twin choices for six searches | fixed `cities.json` | consistent with the code's rules (see `city-twins.md`) |

## Assessment

- **GeoValidate** is fully reproducible from fixed inputs: the sample, the seed and pinned package versions. This is the right regression gate as it stands.
- **FloodScope and AgroSignal** have strong unit tests on fixed inputs, but every end-to-end check (Lokoja, Kano, GDAL comparison, Python reference, Terra/Aqua, other regions) reads live Planetary Computer archives. Those archives can be reprocessed, reindexed or temporarily unavailable, so their results cannot serve as an exact regression gate. Today they matched; that is evidence, not a guarantee.
- **City Twins** has no automated test of its matching rules.

## Recommended regression fixtures (to add in the implementation phase, before any redesign)

1. **FloodScope fixture**: save the exact input arrays the Lokoja run reads (VV/VH before and after, JRC occurrence, DEM, WorldCover, population window) as small binary files with a manifest of source item IDs and dates; a Node test runs the pipeline from these files and compares the class grid hash and the summary figures with stored values. The live Lokoja run stays as a separate, non-blocking "live data" check.
2. **AgroSignal fixture**: the same for the Kano example (NDVI composites for the target season and baseline, cropland fraction, CHIRPS season totals). Compare anomalies, regional z, rank and rainfall with stored values.
3. **GeoValidate**: keep `pyodide_run.mjs` + `verify.py` with pinned versions; store the expected headline figures.
4. **City Twins**: a test over a fixed list of cities (Lagos, Tokyo, La Paz, Reykjavik and a few unique-class cases) asserting the chosen twin, the tier and the card wording; plus a check that every city returns a twin.
5. **Interpretation text**: any new sentence that interprets a result gets a test that feeds fixed numbers and checks the wording thresholds (for example AgroSignal's ±0.5 / ±1.5 SD words).

Fixture sizes must stay small (crop to the example box); they are test data, not product data.

## Interpretations already produced by the tools, checked against code

| Tool | Text | Basis in code | Verdict |
|---|---|---|---|
| GeoValidate | "Accuracy is 93.2 % with random test points … 4.4 percentage points lower. One seed …; read the gap as an indication" | computed values and a fixed caveat | Supported |
| AgroSignal | "{season}: much greener than / greener than / close to / browner than / much browner than usual" | regional z-score at ±0.5 and ±1.5 SD (`app.js` line 318) | Supported; wording is about greenness, not yield |
| FloodScope | KPI labels "Modelled residents", "High confidence" | computed; caveat only in the Areas tab | Supported, caveat misplaced (FS-1) |
| City Twins | "Same climate / Same climate type / Similar climate", "similar size", "Much alike." | rule tiers (`twin.js` lines 38–39, 171–176) | Tiers supported; "Much alike" overstates (CT-1) |

No invented figures, sources or accuracy values were found in the interfaces audited.
