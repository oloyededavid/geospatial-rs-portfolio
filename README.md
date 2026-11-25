# David Oloyede · Geospatial research portfolio

Source for [oloyededavid.github.io/geospatial-rs-portfolio](https://oloyededavid.github.io/geospatial-rs-portfolio/).

A one-page site in English, French and German: an introduction with a globe and timeline, a searchable card for each of the nine projects that opens its study site, and an About section with skills. Static files only, served by GitHub Pages from `main`.

## Files

- `index.html`: the English page and the source for the translations.
- `fr/index.html`, `de/index.html`: generated from `index.html` and `i18n/*.json`. Do not edit them by hand.
- `styles.css`: one stylesheet, with design tokens (colour, type, spacing) at the top.
- `script.js`: reveal on scroll, the current section in the header and the language switch. The page reads correctly without it.
- `globe.js`: the globe and timeline in the introduction.
- `lagos.js`: the Lagos map tour, drawn from `assets/lagos-lga.json`. Not loaded since the Lagos card became a standard card.
- `assets/projects/`: WebP images of each project at several widths. Each one is a real output of the study (see below).
- `assets/fonts/`: self-hosted fonts (Satoshi, Zodiak, Newsreader, Geist Mono) and `range-dash*.woff`, an en dash taken from DejaVu Sans, because Satoshi's en dash is almost as wide as an em dash.
- `assets/vendor/leaflet-1.9.4/`: Leaflet, used by the Lagos map.
- `assets/earth.jpg`, `assets/globe-still.webp`: the globe texture and its still image when scripts are off.
- `assets/og.png`: the image shown in link previews.
- `404.html`, `robots.txt`, `sitemap.xml`, `favicon.svg`.

## Tools

Run from the repository root.

```bash
python3 tools/build_i18n.py        # rebuild fr/ and de/ after any change to index.html or i18n/*.json
python3 tools/build_lagos_tour.py  # rebuild assets/lagos-lga.json from the Lagos study's data files
python3 tools/sync_nav.py          # rewrite the study bar, next-study card and Other studies line on the nine study sites
```

- `build_i18n.py` stops if a dictionary entry no longer matches the page, or if any English text is left untranslated. Text inside the map images is part of the images and stays in English.
- `build_lagos_tour.py` reads `docs/data/extra_analysis.json` and `docs/data/lagos_ghsl.csv` from a local clone of [Lagos-Urban-Heat-Analytics](https://github.com/oloyededavid/Lagos-Urban-Heat-Analytics) next to this repository. Every value on the map comes from those files.
- `sync_nav.py` expects local clones of the nine study repositories next to this one. It also copies each next study's `-720` image into the previous site as `next-study.webp`.

## Image sources

| File | Source |
|---|---|
| `hydrology-*` | The study-areas map of the hydrology study |
| `ogun-area-*`, `ogun-720` | The Ogun surface water explorer |
| `oueme-*` | The Ouémé–Ogun explorer, rainfall minus evapotranspiration |
| `gravimetry-area-*`, `gravimetry-720` | The Lake Chad water storage study |
| `lagos-*` | The Lagos explorer: heat by local government area |
| `coastal-area-*`, `coastal-720` | The Lekki–Epe barrier outline from the coastal study's land mask (`outputs/index_arrays.npz`), on the Esri light grey basemap |
| `mau-*` | The study box and the forest class of the 2025 land-cover map from the Mau Forest study, on the Esri light grey basemap |
| `mozambique-*` | The 159 district outlines (geoBoundaries ADM2) used by the Mozambique health-access study, on the Esri light grey basemap |
| `catalogue-*` | The item footprints of the open geodata catalogue (`docs/data/footprints.geojson`), on the Esri light grey basemap |

## Certificates

`assets/certificates/*.webp` are 900-pixel previews of the first page of each certificate, made from the PDFs the author holds. The PDFs are not in the repository and the page offers no download. They sit beside the About text as one card that turns to the next every five seconds, with arrows and swipe; each image's description names the course and its issuer.

## Editing

To add a project, copy one `<article class="inset">` block in `index.html`, add its image at 720, 1200 and 1600 px wide in `assets/projects/`, add its translations to `i18n/fr.json` and `i18n/de.json`, then run `tools/build_i18n.py`. Check every link before publishing.
