# City Twins: method and tests

City Twins (`twin/`) finds, for a city, a city in another country with a similar climate and size, and draws a card that contrasts how the two have grown and built.

## Data

`twin/cities.json`, built by `tools/build_twin_data.py` from the GHS Urban Centre Database R2024A V1.2 (European Commission, Joint Research Centre, CC BY 4.0): 11,403 urban centres of 50,000 people or more; 19 left out (14 unnamed, 5 with missing values). Fields: name, country, centroid, population 2025 and 1975–2025 every five years (modelled before 2025), mean temperature of the 2010s, seasonal spread (standard deviation of monthly means), greenness (mean NDVI of the greener built-up land, 2025), average building height (2020) and Köppen–Geiger class.

## Matching (as implemented in `twin/twin.js`)

1. Candidates are cities in another country at least 50 km away.
2. The three ranking measures are mean temperature, seasonal spread and the logarithm of population, each standardised with the dataset's mean and standard deviation, combined as a Euclidean distance with equal weights.
3. **Close match**: same Köppen class, mean temperature within 2.0 °C, seasonal spread within 1.0 °C and population within 1.5 times (compared in tenths of a degree, as shown). If none: **closest of the same climate type**; if the class is unique: **closest of any type**. The page names the tier and lists every limit as within or outside.
4. The card's opening words follow the tier: "Same climate" only for a close match, "Same climate type" when only the class matches, "Nearest climate" otherwise; "similar size" only within 1.5 times.
5. The contrast on the card is the largest of: growth since 1975 (ratio at least 1.5, only where the 1975 population is at least 10,000 and the ratio at least 0.25), building height (at least 30 % and 2 m apart, both above the 2.5 m data floor) and greenness (at least 0.08 NDVI apart). Otherwise the card says the two are "close on every measure compared".
6. The ten nearest candidates are kept; the page offers the next four.

The limits (2 °C, 1 °C, 1.5 times, and the contrast margins) are the author's tolerances for "close", not values taken from the literature. The page's "How it works" states that temperature and seasonal spread were checked against WorldClim 2.1 station-interpolated climate and that rainfall and density were dropped because they did not hold up; the record of that check is not in this repository.

## Limits

A twin is a statistical likeness on climate and size, not a judgement that two cities are alike in other ways. Population before 2025 is modelled; building height and greenness are satellite estimates.

## Tests

`tests/twins_check.cjs` (Playwright, against a local server) checks the twin, the match tier and the card wording for Lagos, Tokyo, La Paz and Reykjavik, and that "much alike" no longer appears.
