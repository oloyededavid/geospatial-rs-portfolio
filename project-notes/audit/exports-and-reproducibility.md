# Exports and reproducibility: Stage 1 audit

Files inspected: every download produced in the journeys (the files downloaded during the journeys). GeoTIFF tags read with `tifffile`; JSON and GeoJSON parsed; images viewed.

## Inventory

| Tool | File | Units | Dates / run time | Method and parameters | Sources and licences | Limits stated in the file | Verdict |
|---|---|---|---|---|---|---|---|
| GeoValidate | Evaluation CSV (overall and per fold) | n/a (ratios, metres in column name) | no | design name only | no | no | Complete numbers; context only in the JSON |
| | Folds CSV (one row per point) | no | no | no | no | no | Data table; fine as data |
| | Fold map GeoJSON | no | no | no | no | no | No provenance at all |
| | Configuration JSON | yes | `run_at` | full configuration, model, projection, versions of scikit-learn, NumPy, pandas, Pyodide, file SHA-256, results, sweep | no | no | Excellent record; cannot be loaded back |
| | Charts PNG | axes labelled | no | title names the file | no | no | Fold colours unexplained |
| | Report (print) | yes | — | — | — | — | Not inspected in print preview |
| FloodScope | Statistics CSV (section, item, value, unit) | **yes, a unit column** | before/after UTC | thresholds, slope, occurrence, CRS, resolution, area basis | no | no | Best table of the three |
| | Flood extent GeoJSON | — | embedded run record | embedded | embedded | no | Good |
| | Class grid GeoTIFF (UTM, 20 m, nodata 0) | — | no | no | no | no | **Values 1…n with no band description or class key**; unreadable without the tool |
| | Processing JSON | yes | run time, scene IDs and times | all parameters, threshold source and Otsu diagnostics | yes, with licences | no | Excellent record; cannot be loaded back |
| | Map PNG | — | dates in caption | area in caption | caption, cut off at the right edge | no | **No legend, no scale** |
| AgroSignal | Yearly series CSV | in column names (`rain_mm`, `temperature_c`) | season year | role (baseline/target) only | no | no | Numbers complete; context in JSON |
| | Pixels CSV (one row per pixel) | partly in names | no | no | no | no | Fine as data |
| | Maps GeoTIFF, 7 bands, sinusoidal | no | no | band descriptions (`ndvi_target` … `cropland_fraction`), nodata NaN | no | no | Good structure; no season or baseline inside |
| | Processing JSON | yes | run time, composite IDs and dates | season, baseline, sensor, rules | yes | no | Excellent record; cannot be loaded back |
| | Map PNG | — | season and baseline in caption | layer name in caption | yes | no | **No colour scale** for the layer shown |
| City Twins | Card PNG (2.7 MB) | yes | data years in footer | rule tiers in wording | yes | the card says "statistical likeness" only in How it works | Good |
| | Share link `?city=…&id=…` | — | — | — | — | — | Works |

## Findings

| # | Severity | Evidence | Impact | Recommendation |
|---|---|---|---|---|
| EX-1 | High | FloodScope map PNG and AgroSignal map PNG have no legend or scale | A shared image cannot be read correctly; it looks complete but is not | Every exported map image carries its legend, scale bar, units, dates, method line and sources; if a legend cannot be drawn, the export says so |
| EX-2 | Medium | FloodScope class GeoTIFF has no class key | Unusable in GIS without the tool | Band description, a GDAL raster attribute table or category names in `GDAL_METADATA`, and a sidecar class table |
| EX-3 | Medium | No tool writes its limitations into any export | A file read later loses the caveats seen in About | Add a short `limits` list to each processing JSON and a final comment block or companion text to CSVs |
| EX-4 | Medium | GeoValidate GeoJSON and CSVs, AgroSignal CSVs carry no provenance | Files separated from the JSON lose their meaning | A header comment line or a companion `README` in a single zip per run (one download, many files) |
| EX-5 | Medium | No analytical tool can reopen a run: no URL state, no "load configuration" | Results cannot be shared as a link or reproduced exactly from the saved record | Shareable configuration (area, dates, parameters; never uploaded data) in the URL, and loading a saved processing record; reproduction from live archives must state that data may have changed (see AgroSignal drift) |
| EX-6 | Low | GeoValidate CSVs print raw floats (0.9349999999999999) | Noise | Round display columns, keep full precision where needed |
| EX-7 | Low | AgroSignal pixel export shows VCI 110 | Not a defect: `docs/methodology.md` line 50 and `engine.js` line 101 state VCI is not clipped, so above 100 means above the baseline maximum. A reader of the CSV alone would not know | Carry the definition into the export notes (EX-3) |

GeoValidate never uploads user data; any shareable link must keep that promise (configuration only, data stays local).
