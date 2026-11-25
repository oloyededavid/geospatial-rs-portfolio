# Scientific communication review

Rule applied: every interpretive sentence is a template filled from computed values of the run, with its thresholds in code; no conclusion beyond the method. The analysis code of every tool is unchanged (fixed-input tests pass).

## Corrected

| Claim or gap | Tool | Correction |
|---|---|---|
| 4,987 "modelled residents" shown without the "not people affected" caveat | FloodScope | Tagged as an estimate at the figure; the Reading states exposure, not affected, displaced or harmed |
| "Automatic split not usable here" without a reason | FloodScope | The reason, rebuilt from the run's histogram statistics with the rule in `pipeline.js` (valley ratio ≤ 0.5, darker group ≥ 2 %, split within −24 to −14 dB) |
| Searched country labelled as if analysed whole | FloodScope, AgroSignal | "20 × 20 km around …" / "33 × 33 km around …", with the centre-point explanation |
| "Much greener than usual" for 2026 against 2001–2020 without the orbit-drift caveat | AgroSignal | "Compare with care" beside the result whenever the target season is after the drift began (Terra 2020, Aqua 2021) and the baseline ends before it; the Aqua check suggested |
| Correlation could be read as cause | AgroSignal | "describes how they moved together in the past, not what caused this season" |
| Greenness could be read as yield | AgroSignal | Stated before a run and in every Reading and export |
| Anomaly sign invisible to red–green colour-blind readers | AgroSignal | Brown–teal scale, ends ≥ 9.7 apart under every deficiency |
| VCI neutral colour at 50 implied a normal | AgroSignal | Sequential scale 0–100 |
| Per-class transfer not read | GeoValidate | Largest recall and precision drops named with values |
| Sweep without a reading; "optimal block size" risk | GeoValidate | Computed range, and "no single correct block size" |
| "Much alike" overstated a statistical match | City Twins | "Close on every measure compared" |
| Weak fallback twins not flagged | City Twins | Tier stated; each limit shown within or outside; "Nearest climate" instead of "Similar climate" when the class differs |
| Modelled population not marked | City Twins | "modelled" tag on Population 1975 |
| Exports lost their caveats | all analytical tools | Limits written into the processing records (and FloodScope's statistics) |

## Uncertainty now shown with results

FloodScope: confidence split, threshold decision and how to test it, Lokoja's independent agreement (labelled "agreement is not accuracy") and threshold sensitivity from the test report. AgroSignal: rank and pixel shares, rainfall as an estimate with its usual range, the drift caution. GeoValidate: one seed, class mix per fold, gap "an indication". City Twins: match tier and limits.

## Not resolved

- Examples outside Nigeria are not offered: none has an independent comparison.
- City Twins' tolerances (2 °C, 1 °C, 1.5×) are the author's choices; the WorldClim check stated on the page is not recorded in the repository.
- The orbit-drift effect on NDVI is not quantified; the caution says so.
