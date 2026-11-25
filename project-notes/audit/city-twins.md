# City Twins: Stage 1 audit

Code audited: `oloyededavid/geospatial-rs-portfolio`, `twin/` at 2657149, served locally, unchanged. Live at https://oloyededavid.github.io/geospatial-rs-portfolio/twin/. Languages: English, French (`/fr/twin/`), German (`/de/twin/`).
Screenshots and the journey record were taken during the audit and are not kept in the repository; the upgraded screens are in `../visual-qa/`.

## The existing matching algorithm (verified in `twin/twin.js`, not assumed)

| Element | What the code does | Where |
|---|---|---|
| Data | 11,403 GHSL Urban Centre Database R2024A centres (≥ 50,000 people); 19 left out (14 unnamed, 5 missing values) | `cities.json` meta; How it works |
| Features for ranking | Mean temperature 2010s (°C), seasonality (SD of monthly means, °C), log of population 2025 | `feats`, line 19 |
| Scaling | Each feature standardised with the dataset mean and SD (`feature_mean`, `feature_sd` in `cities.json`) | line 374 |
| Weights | Equal: Euclidean distance over the three standardised features | `near`, line 49 |
| Exclusions | Same country; anything closer than 50 km | line 48 |
| First tier ("strict") | Same Köppen class, temperature within 2.0 °C, seasonality within 1.0 °C (compared in tenths), population within 1.5× | `sameClimate`, `similarSize`, lines 38–39 |
| Fallbacks | If no strict candidate: same Köppen class, nearest; if the class is unique: any class, nearest | line 51 |
| Card wording | "Same climate" only when the strict climate test holds; "Same climate type" when only the Köppen class matches; "Similar climate" otherwise; ", similar size" only within 1.5× | line 171 |
| Contrast shown | The largest of: growth since 1975 (ratio ≥ 1.5, only where 1975 population ≥ 10,000 and ratio ≥ 0.25), building height (≥ 30 % and ≥ 2 m apart, both above the 2.5 m data floor), greenness (≥ 0.08 NDVI apart); otherwise "alike" | `contrast`, lines 60–68 |
| Validation stated | Temperature and seasonality checked against WorldClim 2.1; rainfall and density dropped because they did not hold up | How it works |

The 1.5× size limit and the 2 °C / 1 °C climate limits **already exist** and are explained to users in "How it works". Their scientific justification is not documented beyond that text: they are author-chosen tolerances, not values from the literature. The ten nearest candidates are computed, but only the first is ever shown.

## Measured behaviour

| Case | Result |
|---|---|
| Load | 3.1 s; a sample twin (Lagos ↔ Ho Chi Minh City) shows on arrival |
| "Lagos" | Lagos ↔ Ho Chi Minh City: tropical savanna, 26.8 / 27.8 °C, 12.8 M / 14.6 M |
| "Lgos" (typo) | "No exact match. Closest names: Lagos" |
| "Japan" (country) | Suggests Japan's largest cities; Tokyo ↔ Shanghai |
| "Zzxq" | "No city by that name. Try a larger city nearby." Previous result kept |
| "La Paz" | Fallback: La Paz ↔ Ushuaia, "Same climate type"; 8.6 / 4.4 °C, 2.1 M / 70 K |
| "Reykjavik" | Fallback across classes: subpolar oceanic ↔ oceanic (Aberdeen), "Similar climate, similar size" |
| Save card | PNG 2.7 MB |
| Share | Copies `?city=…&id=…#twin`; button reads "Link copied" |
| French and German | Page, table and climate names translated; numbers localised (26,8 °C) |
| axe | 0 violations before and after searches |
| Phone | 0 px overflow |
| Console | No errors |

## Findings

| # | Severity | Type | Evidence | User impact | Recommendation |
|---|---|---|---|---|---|
| CT-1 | Medium | Science communication | Strict matches end "Much alike." (`twin.js` line 176) when growth, height and greenness are within the margins; the page's own limit says a twin "is not a judgement that two cities are alike in other ways" | The headline says more than the method supports | Phrase as "Close on every measure compared" and keep the limit visible near the card |
| CT-2 | Medium | Science communication | 06-lapaz: fallback twin with a 30× population gap and 4.2 °C apart; the card says "Same climate type" but never states that no close twin exists | Users may read a weak match as a good one | An explicit match-strength line computed from the tier: "closest available; no city within the size and temperature limits" |
| CT-3 | Medium | Explanation | The table lists values but not which ones passed the matching tests, nor that ranking uses temperature, seasonality and size with equal weight | Users cannot see why this city was chosen | Mark each measure as used for matching or shown for contrast, with pass/fail against the stated limits |
| CT-4 | Medium | Exploration | The ten nearest candidates are computed (`twinsOf`), only the first is shown; no way to see the next | Weak support for discovery, the tool's purpose | "Next twin" control over the existing ranked list (no new method) |
| CT-5 | Low | Translation | FR and DE pages show "Lagos and Ho Chi Minh City" (`twin-rank`, line 265, not passed through translation) | English word on translated pages | Translate the joining word; the card itself is English by design (comment line 26) and should say so or be translated later |
| CT-6 | Low | Discoverability | "How it works" is collapsed at the foot of the page (01, 08) | Method and limits are rarely seen | A short "why this twin" line on the card, with the full method one click away |
| CT-7 | Low | Consistency | City Twins uses the portfolio's styles (mono caps buttons, serif title), the other three tools share `dash.css` | Family resemblance is weak | Shared tokens (type, colour, controls) while keeping the card-led layout |
| CT-8 | Low | Documentation | No methodology or test record in a `docs/` folder for City Twins, unlike the other tools; the build script is `tools/build_twin_data.py` | Method and checks are harder to review | A short methodology and test note, including the WorldClim check behind "How it works" |

## Preserve

The algorithm and its tiers; the honest wording tiers (same climate / same climate type / similar climate); the contrast thresholds that suppress differences within data uncertainty; the 1975 growth guard; "How it works" and its limits; search tolerance (typos, countries); share links; the three languages.

## Not tested

The WorldClim check itself (described, not reproduced here); every one of 11,403 cities; a screen reader on the canvas card (the canvas has an `aria-label` with the full sentence, checked); Safari's share sheet.
