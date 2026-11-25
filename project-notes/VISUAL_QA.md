# Visual QA

Live sites after the upgrade (FloodScope 1.1.0, AgroSignal 1.1.0, GeoValidate 1.1.0, City Twins in the portfolio), 25 November 2026, headless Chromium. Each tool was captured on its opening screen and after its example result at four widths; City Twins with La Paz (a weak match). Files: `visual-qa/{tool}-{open|result}-{width}.webp` (phone and tablet captures are full-page, cut at 2,400 px).

| Width | Screens inspected | Horizontal overflow | Console errors |
|---|---|---|---|
| 1440 × 900 | 8 (4 opening, 4 result) | 0 px | none |
| 1280 × 800 | 8 | 0 px | none |
| 768 × 1024 | 8 | 0 px | none |
| 390 × 844 | 8 | 0 px | none |

## Defects found during visual inspection and corrected

| Defect | Where | Correction |
|---|---|---|
| Reading's label column sized for three paragraphs; a fourth wrapped into a narrow column and pushed the map off screen | AgroSignal 1440 | Reading in two columns (findings; cautions and limits), each column a group |
| Reading repeated the panel's sentence word for word | GeoValidate | Panel now explains how to read the chart |
| Exported map image footer ran off the right edge | FloodScope | Footer lines wrap to the image width |
| "Why this twin" appeared above the card on phones | City Twins 390 | Phone order: card, buttons, table, why this twin |
| White rectangle over the phone map | FloodScope 390 | Not a defect: captured mid-render; a settled capture shows the full map |

## Remaining

- On phones the settings stay above the results after a run; the page scrolls to the Reading when a run finishes.
- City Twins' card is drawn in English on the French and German pages (by design since its first version).
