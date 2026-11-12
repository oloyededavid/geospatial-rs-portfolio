# Oloyede David · Geospatial research portfolio

Source for [oloyededavid.github.io/geospatial-rs-portfolio](https://oloyededavid.github.io/geospatial-rs-portfolio/).

A two-section personal site: an introduction, and selected research shown as cards. Each card opens a live study and links to its source code.

## Structure

- `index.html`: the page. No build step.
- `styles.css`: one stylesheet built on design tokens (colour, type scale, spacing, grid) at the top of the file.
- `script.js`: small enhancements only (reveal on scroll, current section in the header). The page is complete without it.
- `assets/projects/`: optimised WebP images of the studies. Each is a real output: a screenshot of the live application, or the study's own figure. Sources are listed below.
- `legacy/v1/`: the previous version of the site, kept unchanged, including the full Credentials section.
- `Lagos_UHI_Analysis_2015_2024.pdf`, `Ogbaru_Flood_Impact_Vulnerability.pdf`: the two earlier study PDFs, kept in place.

## Image sources

| File | Source |
|---|---|
| `hydrology-*` | The study-areas map from the hydrology study (Plate 2) |
| `ogun-*` | The Ogun Catchment-to-Coast Observatory explorer |
| `oueme-*` | The Ouémé–Ogun explorer, rainfall minus evapotranspiration |
| `gravimetry-960` | Figure 1 of the Lake Chad GRACE study |
| `lagos-*` | The Lagos study’s explorer: heat by local government area |

## Editing

Add a study by copying one `<article class="card">` block in `index.html` and adding its image (4:3) at two widths in `assets/projects/`. The first card uses `card--feature` for the wide layout. Check every link before publishing.

Fonts load from Fontshare (Satoshi, Zodiak) and Google Fonts (Geist Mono).
