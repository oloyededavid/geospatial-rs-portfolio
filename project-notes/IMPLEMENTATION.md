# Implementation record

What was built against the audit (`AUDIT.md` and `audit/`), 25 November 2026. Every change was tested in the browser before it was pushed; every repository's existing tests still pass. Commits are authored by the owner's account.

| Repository | Version | Commits | Tests on fixed inputs |
|---|---|---|---|
| GeoValidate | 1.1.0 | 46a933f, 5d588af | `tests/check_expected.py` (random 0.9324, spatial 0.8884), `verify.py`, `regression_test.py` |
| FloodScope | 1.1.0 | d5a69e2, a98a0c2 | `tests/fixture_lokoja.mjs` (whole pipeline offline, class-grid hash), engine and tracing tests |
| AgroSignal | 1.1.0 | fe02021 | `tests/fixture_kano.mjs` (whole pipeline offline, z and anomaly grid hashes), engine tests |
| Portfolio (City Twins) | — | a21c50b, 9c423bb | `tests/twins_check.cjs`; `tools/check_shared.sh` |

## Findings and their status

| Finding | Status |
|---|---|
| S-1 empty first view, S-2 form first on phones | Done in all three tools (opening screen; purpose first on phones) |
| S-3 results not interpreted | Done: a computed Reading in every analytical tool; City Twins "Why this twin" |
| S-4 one Nigerian example, no random examples | **Not done.** No example outside Nigeria has an independent comparison yet; offering unvalidated ones as "validated" would be false. Candidates are listed in each tool's `docs/ux-notes.md` |
| S-5 inconsistent examples | Done: every example button runs |
| S-6, PI-1, PI-2 cross-tool navigation | Done: Tools menu in every tool; back link to the tools view |
| S-7 shared stylesheet drift | Done: `shared/dash.css` source and `tools/check_shared.sh`. Token alignment with the portfolio palette not done (tools keep their cool grey) |
| S-8, GV-6 charts without data | Done for GeoValidate (values tables); FloodScope histogram announces its value; AgroSignal already had a table |
| S-9 regression on live data | Done: fixed-input fixtures for FloodScope and AgroSignal, pinned figures for GeoValidate, a City Twins check |
| S-10 disabled buttons without reasons | Done |
| S-11 guide | Partly: the opening screens explain workflow, inputs and outputs; About keeps method and limits. No separate guide panel |
| S-12 / EX-1 map images without legend | Done (FloodScope, AgroSignal): legend or colour scale, scale bar, method, limits, wrapped attribution |
| S-13 / EX-2–4 exports without context | Done: limits and metadata in records; FloodScope class codes in the statistics and record (the bundled GeoTIFF writer cannot write tags) |
| S-14 / EX-5 shareable runs | Done for FloodScope and AgroSignal; GeoValidate not (data never leave the browser) |
| S-15 / VZ-1–3 palettes | Done and measured (`tools/colour_check.py`) |
| S-16 / VZ-4 modelled values | Done: estimate and modelled tags |
| S-17 / IX-1 search patterns | Not done: two search styles remain (place search for areas, city type-ahead) |
| FS-1, FS-2, FS-3, FS-4, FS-6, FS-11 | Done |
| AS-1, AS-2, AS-3, AS-4, AS-7, VZ-5 | Done |
| GV-1–GV-10 | Done except GV-7 (shortened matrix labels on screen) |
| CT-1–CT-6, CT-8 | Done; CT-7 (City Twins styling) unchanged |

## After the independent review (1.1.1, 25 November 2026)

An independent review of the live sites found no blocking failures, 2 High and 7 Medium defects. Both High and all seven Medium defects are corrected, along with most of the Low ones; the scores, evidence, corrections and what remains open are in `QUALITY_SCORECARD.md`. The fixed-input tests for FloodScope and AgroSignal and the GeoValidate expected values are unchanged after the corrections.
