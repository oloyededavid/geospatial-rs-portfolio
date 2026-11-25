# Quality scorecard

Four tools, seven dimensions, scored 1 to 10. A score of 9 is a target, not something to claim without evidence.

## How the scores were made

1. **First scores.** An independent reviewer gave these. The reviewer did not take part in the implementation and changed nothing. They used the live sites on 25 November 2026 in headless Chromium at 1440 px and 390 px, and checked with axe and Playwright scripts.
2. **Corrections.** The defects the reviewer found were fixed in 1.1.1 (City Twins: the portfolio commit of the same date).
3. **Reassessment.** The scores were set again after the fixes. The reassessment was made by the implementer, not the reviewer. A score was raised only where the defect behind it was fixed and the fix was checked (see "Evidence after fixes"). Where a defect is still open, the score stays where it was.

## Scores

Each cell shows the first score, then the reassessed score.

| Dimension | FloodScope | AgroSignal | GeoValidate | City Twins |
|---|---|---|---|---|
| 1 First-use comprehension | 8 → 8 | 8 → 8 | 8 → 8 | 8 → 8 |
| 2 Visual quality | 7 → 8 | 7 → 8 | 8 → 8 | 7 → 7 |
| 3 Interaction quality | 8 → 8 | 7 → 8 | 8 → 8 | 7 → 8 |
| 4 Scientific integrity | 8 → 8 | 7 → 8 | 6 → 7 | 6 → 7 |
| 5 Accessibility | 8 → 8 | 8 → 8 | 8 → 8 | 8 → 8 |
| 6 Technical reliability | 8 → 8 | 7 → 7 | 8 → 8 | 8 → 8 |
| 7 Product consistency | 7 → 7 | 7 → 7 | 8 → 8 | 6 → 6 |

No dimension reaches 9. The reasons are listed under "What keeps each tool below 9".

## Evidence behind the first scores (independent review)

### FloodScope
- **Example run:** the Lokoja example ran in 34–37 s and gave 22.4 km² of new water (19.4 km² high confidence) and 4,987 modelled residents.
- **Population caveat:** the caveat sits beside the residents figure.
- **Threshold control:** the threshold slider works from the keyboard and announces its value.
- **Exports and link:** all 6 downloads produced files, and the map image has a legend, scale bar and limits. A shared link opened on a phone reproduced the figures exactly, and a stale link gave an honest message.
- **Country search:** searching a country is labelled "20 × 20 km around … not the whole country".
- **Accessibility:** axe found 0 violations at 1440 px and 390 px.
- **Defects found:**
  - the side-panel example button was cut off at 1440 px;
  - the Areas tab hid the reason the boundary service failed, and those requests had no timeout;
  - "most of it lies on cropland" was written when the share was 37%;
  - the subtitle showed "SENTINEL−1A" with a minus sign;
  - CSV numbers had full float noise;
  - one legend row had no checkbox;
  - map overlays collide on phones.

### AgroSignal
- **Example run:** the Kano example ran in 55–57 s and gave z +2.97, rank 20 of 20.
- **Drift caution:** the caution sits beside the headline.
- **Exports and link:** all 6 downloads produced files, and the shared link reproduced the figures.
- **Defects found:**
  - the Reading said "0% much browner" while the Pixels tab said 0.4%;
  - r = 0.18 was given without calling it weak;
  - the 2025 season failed everywhere, with no warning before the run;
  - bad shared links were silently changed or ignored;
  - the example button was cut off;
  - temperature varied between runs (27.7, 27.5, 27.7 °C). The cause was not confirmed.

### GeoValidate
- **Example run:** the Mau example reproduced 93.2% random and 88.8% spatial.
- **Bad files:** empty, header-only and binary files were rejected in about 4 s, before the engine download.
- **Sweep:** the sweep ran in 33 s.
- **Defects found:**
  - with 40 rows (8 points per fold), the Reading concluded that nearness "barely changes the score", and the data check said "No problems found";
  - "least likely to transfer" was drawn from one seed and one split;
  - the fold spread (±7.2) was larger than the 4.4-point gap, with no comment;
  - the chart image exported an empty half;
  - three different labels were used for the same example.

### City Twins
- **Phone order:** "Why this twin" follows the comparison table on phones.
- **Search:** the search box works from the keyboard, and duplicate city names are told apart by population.
- **Defects found:**
  - a weak match (Kathmandu and Hong Kong) looked like a good one on the shareable card;
  - the shared link lost the chosen twin;
  - only the 1975 population was marked as modelled;
  - the card text was about 8 px tall on a phone;
  - the page chrome differs from the other three tools.

## Corrections made (1.1.1)

| Defect (reviewer's number, severity) | Correction |
|---|---|
| 1 GeoValidate, small samples (High) | The data check warns when there are fewer than 30 test points per fold. The Reading says "too few to tell a small gap from chance" or "within fold-to-fold variation" when that is the case, and drops "barely changes the score" and "came from". The per-class sentence now says it comes from one seed and one split. |
| 2 City Twins, weak match on the card (High) | The card prints "No close match" above the headline (for example, "closest with the same climate type"). The same words begin the card's text alternative. |
| 3 City Twins, link loses the twin (Medium) | The link carries the twin's id (`t=`) and reopens on it. |
| 4 City Twins, 2025 population not marked as modelled (Medium) | Both population rows are tagged "modelled". The card footer and the How it works and Limits text say all population figures, 2025 included, are modelled. Updated in EN, FR and DE. |
| 5 AgroSignal, "0% much browner" (Medium) | Shares below 1% keep one decimal ("0.4%", or "under 0.1%"). |
| 6 AgroSignal, 2025 season (Medium) | The archive was checked directly: at the Kano box neither Terra nor Aqua has composites from July to October 2025, so the reviewer's "try Aqua" would not help. The page now checks the archive for the chosen place and season before a run and says how many composites exist out of how many are needed. The engine's message names the gap. |
| 7 City Twins, card unreadable on phones (Medium) | At 600 px and below, the card's caveat, headline and sentence are shown as page text above the card. |
| 8 FloodScope and AgroSignal, example button cut off (Medium) | The side-panel button reads "Example". Its accessible name keeps the place ("Run the Lokoja example"). |
| 9 FloodScope, Areas tab hides the failure (Medium) | The tab gives the reason, or says the areas were switched off. The boundary requests time out after 20 s and 30 s. |
| 10 FloodScope, "most of it" (Low) | Now "the largest share". |
| 11 FloodScope, "SENTINEL−1A" (Low) | The minus sign is applied to the threshold number only. |
| 12 AgroSignal, bad links (Low) | A link with values the page does not offer, an unreadable area or an area outside the limits says so and runs nothing. |
| 13 GeoValidate, empty chart half (Low) | Before the sweep, the chart image holds the folds chart only. |
| 14 GeoValidate, three labels (Low) | "Load example data", "Run the example" and "Run the example (Mau Forest, Kenya)". |
| 16 FloodScope, legend row without a checkbox (Low) | The row now reads "(shown with the row above)". |
| Consistency: CSV rounding | FloodScope summary CSV numbers are now written to six decimal places at most, as GeoValidate's already were. |
| AgroSignal, correlation | The rainfall correlation is described as a weak, moderate or strong association. |
| 15 All map tools, overlays collide on phones (Low) | At 860 px and below, the layer chips stay in one row that scrolls sideways. The scale bar sits bottom-left above the Legend chip. The map credits start closed behind the i button and, when opened, wrap beside the Legend chip. The change is in the shared stylesheet plus three lines per tool. |
| GeoValidate, heading | The result heading states the finding ("Spatial blocks score 4.4 points lower than random folds"), with the file name below it. |

## Not corrected

- **17. City Twins chrome and type differ** from the three analytical tools (buttons, About pattern, the "City twins" and "City Twins" capitalisation).
- **18.**
  - FloodScope's UNOSAT comparison sentence still uses fixed numbers. It is shown only for the stored example, for which they are correct.
  - Download buttons are visible, though disabled, before a result exists.
- **AgroSignal temperature variation between runs:** not investigated further. NASA POWER updates are a plausible cause but were not confirmed.
- **Sweep chart uncertainty:** the GeoValidate sweep chart still shows no uncertainty band.

## Evidence after fixes (25 November 2026, local build of the commits pushed the same day)

| Check | Result |
|---|---|
| FloodScope fixed-input Lokoja test | 11 of 11 pass; class-grid SHA-256 unchanged (`651407e8…`) |
| FloodScope unit tests | all passed |
| AgroSignal fixed-input Kano test | 10 of 10 pass; both grid hashes unchanged |
| AgroSignal engine test (`tests/engine_test.mjs`) | all passed |
| GeoValidate browser journey | 93.2% / 88.8%; five exports; 0 px overflow at 390 px; no console errors |
| GeoValidate, 40-row file | warning "about 8 test points per fold"; Reading ends "too few to tell a small gap from chance" |
| GeoValidate version check | page and engine agree, 1.1.1 |
| AgroSignal, 2025 at Kano | "3 of about 10 composites … fewer than the 5 a run needs" |
| AgroSignal, 2024 at Kano | no warning |
| AgroSignal, link with `year=2027` | "asks for season year 2027, which this page does not offer, so nothing was run" |
| City Twins test (Lagos, Tokyo, La Paz, Reykjavik) | 4 of 4 pass; tiers as before |
| City Twins, Kathmandu | card and text alternative begin "No close match · closest with the same climate type" |
| City Twins, twin link | choosing Hanoi gives `…&id=1822&t=1999`, which reopens on "Kathmandu and Hanoi" |
| City Twins at 390 px | caveat, headline and sentence shown as page text above the card |
| axe | 0 violations: City Twins (EN 390 and 1440 px, FR 390 px), AgroSignal (1440 px), FloodScope (1440 px), GeoValidate (390 px) |
| Horizontal overflow | 0 px on every page above |
| Phone map overlays, 390 px, after each example run | no overlap between the legend, scale bar, credits, zoom buttons and layer bar in FloodScope, AgroSignal or GeoValidate (they overlapped before: legend and credits); AgroSignal layer bar 36 px tall, was 65 px |
| axe at 390 px after the overlay change | 0 violations in all three tools |

## What keeps each tool below 9

- **FloodScope:**
  - the fixed UNOSAT sentence;
  - no validated example outside Nigeria.
- **AgroSignal:**
  - the temperature variation has no confirmed explanation;
  - archive gaps are found only by checking at the time.
- **GeoValidate:**
  - no uncertainty on the sweep chart;
  - one seed per run;
  - no repeated-seed option to show how stable the gap is.
- **City Twins:**
  - different chrome and type from the other tools;
  - English-only card text inside French and German pages (stated on the page);
  - no About or Download pattern shared with the other three.
