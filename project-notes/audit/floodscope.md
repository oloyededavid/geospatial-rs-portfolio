# FloodScope: Stage 1 audit

Code audited: `oloyededavid/FloodScope` at 010166c (v1.0.0), served locally with `http-server` (range requests, as `package.json` specifies), unchanged. Live at https://oloyededavid.github.io/FloodScope/.
Screenshots and the journey record were taken during the audit and are not kept in the repository; the upgraded screens are in `../visual-qa/`.

## What was exercised

Landing (desktop, phone), axe, place search (no match, empty box, "Lokoja", "Nigeria"), the Lokoja example end to end on live Planetary Computer data, every result tab, the threshold histogram by keyboard, pixel inspection, all six downloads (print intercepted), the About panel, a date range with no images, reversed dates, phone layout after a run.

Environment note: geoboundaries.org is not reachable from this audit environment. The administrative-area breakdown therefore failed here; this exercised the tool's failure path, not a defect of the tool.

## Measured behaviour

| Step | Result |
|---|---|
| Page load | 2.9 s |
| Lokoja example, whole chain | 34 s; one progress message per input read (VV/VH before and after, JRC water, DEM and slope, WorldCover), then the threshold decision, then "Done in 32.3 s" |
| Result | New water 22.4 km² (8.2 % of 274 km² valid radar); high confidence 19.4 km² (+3.05 km² VV only); modelled residents 4,987 (3,964 in high-confidence water); permanent water 20.9 km² excluded, 13.3 km² wet before. Identical to the test report's Lokoja figures |
| Threshold | Default −18 dB; automatic split refused (Otsu −12.6 dB outside −24 to −14 dB). Two ArrowLeft presses on the histogram: −18.2 dB, 22.4 → 21.2 km², map and figures updated |
| Land cover tab | Cropland 8.24, grassland 6.26, tree cover 3.80 km² … |
| Areas tab, boundary service unreachable | "Administrative areas were not loaded for this run"; log explains; totals unaffected |
| Pixel inspection | Card with class, VV/VH before, after and change, water occurrence, slope, land cover, residents per km² |
| Downloads | GeoJSON 765 KB, GeoTIFF 697 KB, CSV 1.5 KB, processing JSON 3.6 KB, map PNG 276 KB, report via print |
| No images in range | "No Sentinel-1 radar images were found … Widen the dates in step 2, or move the box." Continue disabled |
| Reversed dates | "The start date must be before the end date." |
| axe | 0 violations before and after a run |
| Phone, 390 px | 0 px overflow |

## Findings

| # | Severity | Type | Evidence | User impact | Recommendation |
|---|---|---|---|---|---|
| FS-1 | High | Science communication | The caveat "Modelled residents are GHS-POP 2025 estimates spread evenly inside each 1 km cell, not counts of people affected" appears only in the Areas tab (06-tab-zones); the headline figure 4,987 sits in the first row (05-result) without it | A reader can take the largest number on the page as people affected | Put the one-line distinction next to the figure: mapped extent / modelled exposure / not confirmed impact |
| FS-2 | Medium | Science communication | Subtitle "automatic split not usable here"; the reason (Otsu −12.6 dB outside −24 to −14 dB) is only in the processing log, although the histogram visibly has two peaks (06-tab-thr) | The refusal looks arbitrary next to a two-peaked histogram | One plain sentence under the histogram from the computed values |
| FS-3 | Medium | Science communication | No result-level reading: what changed, where the new water concentrates, how sensitive the area is to the threshold. The sensitivity figures (9.6 km² at −20 dB, 40.0 km² at −14 dB) exist only in About for Lokoja | Results are well labelled but not interpreted; uncertainty is not shown with the result | A computed "Reading" block: finding, magnitude, threshold sensitivity from the run's own histogram, limits (canopy, urban, timing of the after image) |
| FS-4 | Medium | Usability / positioning | Searching "Nigeria" gives "Nigeria 401 km²": every search result becomes a ~20 × 20 km box around the place's centre point (`app.js` line 129) | A country or region search looks as if the whole region was analysed | Label the box as "20 × 20 km around …" and invite drawing; or offer the place's own bounds when within the area limit |
| FS-5 | Medium | Positioning | One example only, Lokoja (Nigeria) | Contradicts the global positioning requirement; a first-time visitor elsewhere sees no local relevance | User-triggered, validated examples from several regions, each reproduced offline from fixed data (see the regression assessment) |
| FS-6 | High | Usability (phone) | 09-phone-top: after a run the inspection card and the legend cover almost all of the map | The map, the main output, is unusable on a phone | Collapse legend by default on narrow screens; inspection as a bottom sheet |
| FS-7 | Medium | Usability | Landing (01): four result boxes show "–"; on phones the form precedes the title and purpose | Empty first view; purpose read late | As GV-1 / GV-2 |
| FS-8 | Low | Consistency | Legend: "Flood, medium confidence" has no toggle while the other layers do | Inconsistent control | Toggle for every data layer, or a note why not |
| FS-9 | Low | Copy | Log line "-18.0 dB (default (automatic threshold not used: …))": hyphen-minus and nested brackets, while the interface uses "−" | Polish | Plain sentence |
| FS-10 | Medium | Accessibility | Histogram is a canvas; its keyboard control works but values are announced only via the figures; land-cover bars are text (good) | Partial access to threshold evidence | Announce threshold and resulting area on change (live region) |
| FS-11 | Low | Validation visibility | The UNOSAT comparison for Lokoja (99.9 % of FloodScope water confirmed; FloodScope finds 50.2 % of UNOSAT water at −18 dB) is in docs and About, not with the example result | The strongest evidence of reliability is not where users look | Show it with the Lokoja example result, labelled "agreement, not accuracy" |

## Preserve

The engine (unit and tracing tests pass on fixed inputs), the reader verified against GDAL, the explicit high/medium confidence split, "permanent water" and "water before" exclusions, ground-area correction, honest failure messages (no images, reversed dates, boundary service), the stale-result clearing on a new run, pixel inspection, the before/after radar swipe, downloads with a processing record, and the About "Limits" list.

## Not tested

Drawing a box by hand, the 3,600 km² cap and the latitude limit in the interface (enforced in `pipeline.runAnalysis`, unit-tested), the 40 m resolution path above 900 km², changing the rules sliders other than the threshold, the radar swipe, Safari/Firefox, a screen reader, a slow network.
