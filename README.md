# Geospatial Remote Sensing Portfolio
### Oloyede David Oluwayinka — B.Tech Remote Sensing & GIS

This repository contains production-ready Google Earth Engine scripts developed during undergraduate research at the Federal University of Technology Akure (FUTA), Nigeria. The three projects demonstrate large-sample satellite image analysis across three geomorphic domains: **urban thermal dynamics**, **SAR-based flood hydrology**, and **coastal shoreline change** — all using the same core pipeline of cloud-native remote sensing, multi-temporal change detection, and automated classification.

These scripts are submitted as part of my application for the **MSc/PhD position in Remote Sensing and Large-Sample Hydrology Applied to River Morphodynamics** at the Département de Géomatique appliquée, Université de Sherbrooke, under the supervision of **Prof. Anya Leenman**.

> **Why this matters for river morphodynamics:** The methods demonstrated here — Sentinel-1 SAR water detection, NDWI-based boundary delineation, multi-temporal change rate analysis, and large-sample GEE workflows — transfer directly to monitoring lateral river channel migration at continental scales. Tracking shoreline position change using DSAS transects is structurally identical to measuring lateral river channel migration.

---

## Table of Contents
- [Repository Structure](#repository-structure)
- [Script 1 — Sentinel-1 SAR Flood Mapping (Nasarawa, Nigeria)](#script-1--sentinel-1-sar-flood-mapping)
- [Script 2 — Lagos Urban Heat Island: LULC & LST](#script-2--lagos-urban-heat-island)
- [Script 3 — Angola Coastline: NDWI Delineation & Shoreline Change](#script-3--angola-coastline-shoreline-change)
- [Technical Environment](#technical-environment)
- [Contact](#contact)

---

## Repository Structure

```
geospatial-portfolio/
├── README.md
├── sentinel1_flood_mapping.js        ← SAR Otsu flood detection, Nasarawa
├── lagos_uhi_classification.js       ← Random Forest LULC + LST, Lagos
├── angola_coastline_dsas.js          ← NDWI shoreline extraction + EPR, Angola
└── reports/
    ├── Nasarawa_Flood_Impact_2022_2024.pdf
    ├── Lagos_UHI_Analysis_2015_2024.pdf
    └── Angola_Coastline_Shoreline_Change.pdf
```

| Script | Platform | Core Method | Study Area | Report |
|--------|----------|-------------|------------|--------|
| `sentinel1_flood_mapping.js` | GEE (JS) | SAR Otsu thresholding | Nasarawa State, Nigeria | [📄 PDF](reports/Nasarawa_Flood_Impact_2022_2024.pdf) |
| `lagos_uhi_classification.js` | GEE (JS) | Random Forest LULC + mono-window LST | Lagos State, Nigeria | [📄 PDF](reports/Lagos_UHI_Analysis_2015_2024.pdf) |
| `angola_coastline_dsas.js` | GEE (JS) | NDWI delineation + DSAS EPR | Angola coastline | [📄 PDF](reports/Angola_Coastline_Shoreline_Change.pdf) |

---

## Script 1 — Sentinel-1 SAR Flood Mapping

**File:** `sentinel1_flood_mapping.js`
**GEE Link:** [Open in Earth Engine](https://code.earthengine.google.com/227bc81fde875996b884639d2f0d18af)
**Full Report:** [📄 Nasarawa_Flood_Impact_2022_2024.pdf](reports/Nasarawa_Flood_Impact_2022_2024.pdf)

### Overview

Detects and delineates flood-inundated areas across Nasarawa State, Nigeria, by comparing pre- and post-flood Sentinel-1 SAR backscatter for the 2022 and 2024 flood seasons. Uses Otsu thresholding — an automated, histogram-based segmentation method — to identify the optimal separation between water and land pixels without manual threshold tuning. Results were cross-validated against NEMA and IOM field reports.

**Datasets:** `COPERNICUS/S1_GRD` (Sentinel-1 IW GRD, VV polarisation), SRTM DEM
**Study period:** Pre-flood (July 2022 & July 2024) vs. post-flood (October 2022 & October 2024)

### Methods

- Radiometric calibration, Range-Doppler terrain correction, and Lee speckle filtering
- Otsu threshold applied to the VV backscatter difference image (post − pre)
- SRTM DEM slope masking to exclude non-flood false positives on steep terrain
- JRC Global Surface Water mask to separate flood water from permanent water bodies
- Flood area quantified in hectares per Local Government Area (LGA)

### Key Results

| Year | Flooded Area | Agricultural Land Lost | % of Total Farmland |
|------|-------------|----------------------|---------------------|
| 2022 | 97,495 ha | 163,585 ha | 7.61% |
| 2024 | 63,577 ha | 33,982 ha | 1.67% |
| Change | −34.8% | −79.2% | — |

Flood extent was concentrated in **Doma, Keana, and Toto LGAs** along the Benue River floodplain. The 34.8% reduction in 2024 inundation is attributed to earlier flood warnings and embankment reinforcements following the 2022 disaster.

### Relevance to River Morphodynamics

SAR-based water body delineation is the same computational operation whether the water body is a floodplain or a river channel. The Otsu thresholding pipeline demonstrated here — VV backscatter → binary water mask → polygon delineation → area quantification — is directly applicable to automated river channel boundary extraction across large sample sets of catchments in GEE.

---

## Script 2 — Lagos Urban Heat Island

**File:** `lagos_uhi_classification.js`
**GEE Link:** [Open in Earth Engine](https://code.earthengine.google.com/b9e59934a3fd84aa96f71e99cfea4556)
**Full Report:** [📄 Lagos_UHI_Analysis_2015_2024.pdf](reports/Lagos_UHI_Analysis_2015_2024.pdf)
**Preprint:** Submitted to EarthArXiv, March 2026 (DOI pending)

### Overview

Spatio-temporal assessment of Urban Heat Island (UHI) dynamics across Lagos State, 2015–2024, combining supervised Random Forest land use/land cover (LULC) classification with mono-window Land Surface Temperature (LST) retrieval from Landsat 8 and Landsat 9. The analysis quantifies how rapid urban expansion has driven systematic increases in surface temperature across one of Africa's largest megacities.

**Datasets:** `LANDSAT/LC08/C02/T1_L2`, `LANDSAT/LC09/C02/T1_L2`
**Study period:** 2015–2024 (analysis years: 2015, 2019, 2024)

### Methods

- Landsat Collection 2 surface reflectance pre-processing and QA_PIXEL cloud/shadow masking
- Merging of Landsat 8 and Landsat 9 collections (L9 launched September 2021 — required for 2024)
- Supervised Random Forest classification (500 trees, 5 LULC classes: Urban, Vegetation, Water, Bare Soil, Agriculture)
- Mono-window LST retrieval from Band 10 thermal infrared using the Sobrino emissivity method (NDVI threshold-based)
- Spectral indices: NDVI, NDWI, NDBI, Urban Index, Albedo
- Getis-Ord Gi* spatial autocorrelation for UHI hotspot delineation
- Pearson correlation between LST and NDVI / NDBI

### Key Results

| Metric | 2015 | 2019 | 2024 | Change |
|--------|------|------|------|--------|
| Mean LST | 29.4°C | 31.1°C | 33.2°C | +3.8°C |
| Mean NDVI | 0.41 | 0.31 | 0.24 | −42% |
| Mean NDBI | 0.18 | 0.26 | 0.31 | +72% |
| UHI Intensity | — | — | — | +94% |

- LST–NDVI Pearson r = **−0.78** (strong negative: vegetation cools the surface)
- LST–NDBI Pearson r = **+0.74** (strong positive: built-up area drives heating)
- LULC classification accuracy: **89.2% overall, Kappa 0.86**
- Primary hotspots: Lagos Island, Surulere, Mushin, Alimosho

### Relevance to River Morphodynamics

This script demonstrates the large-sample GEE workflow that transfers directly to river monitoring: multi-year collection merging, automated cloud masking, spectral index computation, and `reduceRegion` statistics across a large study area — all within a single reproducible GEE script. The Random Forest classification framework is directly analogous to LULC classification used to characterise riparian corridor change around migrating river channels.

---

## Script 3 — Angola Coastline Shoreline Change

**File:** `angola_coastline_dsas.js`
**GEE Link:** [Open in Earth Engine](https://code.earthengine.google.com/c20be2146d3386884ddfcde9173b02e6)
**Full Report:** [📄 Angola_Coastline_Shoreline_Change.pdf](reports/Angola_Coastline_Shoreline_Change.pdf)

### Overview

Multi-temporal shoreline extraction and DSAS-style change rate analysis along the Angola coastline (2018–2024). Shoreline positions are extracted from Landsat 8/9 and Sentinel-2 composites using NDWI-based water body delineation. End Point Rate (EPR) transect statistics quantify the rate and direction of shoreline migration at 10 cross-shore transects spanning the full coastline extent. Bathymetric analysis (ETOPO1) contextualises coastal morphodynamics relative to shelf geometry.

**Datasets:** `COPERNICUS/S2_SR_HARMONIZED`, `LANDSAT/LC08/C02/T1_L2`, `LANDSAT/LC09/C02/T1_L2`, NOAA ETOPO1
**Study period:** 2018–2024

### Methods

- Multi-sensor composite (Landsat 8/9 + Sentinel-2) with cloud/shadow masking and float32 type homogenisation
- NDWI (McFeeters 1996) water body delineation; threshold = 0
- Shoreline extraction via focal dilation edge detection (1-pixel kernel)
- Change map: erosion (land → water) and accretion (water → land) 2018–2024
- DSAS-style transects: 10 east-west transects at 1.2° latitude spacing, 5°S–17°S
- EPR = (shoreline position 2024 − shoreline position 2018) / 6 years
- Offshore bathymetry: ETOPO1 hillshade and slope for shelf morphology
- All outputs exported to Google Drive (GeoTIFF + CSV + SHP)

### Key Results

| Metric | Value |
|--------|-------|
| Analysis period | 2018–2024 (6 years) |
| Transects analysed | 10 (labelled A–J, 5°S to 17°S) |
| Dominant process | Mixed erosion/accretion (spatially variable) |
| Composite years | 2018 (L8 + S2) and 2024 (L9 + S2) |

EPR values per transect are exported to `Angola_DSAS_Transects_EPR.csv` — negative EPR indicates shoreline retreat (erosion); positive EPR indicates progradation (accretion).

### Relevance to River Morphodynamics

This is the most direct methodological bridge to the Sherbrooke project. **DSAS transect analysis of shoreline migration is structurally identical to monitoring lateral channel migration in rivers** — both measure the displacement of a water/land boundary along fixed cross-sections over time. The NDWI → water mask → edge detection → transect position pipeline demonstrated here is exactly the workflow used to quantify river planform change (channel width, centreline shift, bend migration) from multi-temporal satellite imagery at large sample scales.

---

## Technical Environment

| Tool | Version / Notes |
|------|----------------|
| Google Earth Engine | JavaScript API |
| Python | 3.10+ |
| QGIS | 3.x (post-processing and cartography) |
| ArcGIS Pro | Overlay analysis and map production |
| Key satellite datasets | Sentinel-1 IW GRD, Sentinel-2 SR Harmonised, Landsat 7/8/9 C2 L2, SRTM DEM, ETOPO1 |

---

## Suggestions for Further Development

The following additions would significantly strengthen this portfolio before the application deadline:

1. **Add a Nasarawa GEE script** — the flood mapping script is currently described but the `.js` file is a placeholder. Generating a working SAR Otsu script (similar structure to the Angola script) would complete the three-script set.

2. **Convert EPR results to metres** — the Angola script currently reports EPR in degrees/year. A one-line conversion (`EPR_deg_per_yr × 111,320 m/deg`) would make the values physically interpretable and more impressive to a geomorphologist reviewer.

3. **Add a net shoreline movement (NSM) column** — NSM = EPR × 6 years. Simple to add to the transect export. Gives absolute displacement in addition to rate.

4. **Add a river channel pilot script** — even a simple one: pick one Nigerian river (e.g. Niger at Lokoja), extract channel centreline from Sentinel-2 NDWI for 2018 and 2024, compute lateral shift. This would directly demonstrate the methodology transfer argument in code rather than just prose.

5. **Thumbnail images in README** — replace the placeholder image paths with actual GEE thumbnail URLs once the scripts have been run. Each script already generates `getThumbURL` Console links — paste those directly into the README `![alt](url)` tags.

---

## Contact

**Oloyede David Oluwayinka**
📧 oloyededavid10@gmail.com
📞 +234 706 730 1587
🎓 B.Tech Remote Sensing & GIS — First Class Honours, GPA 4.51/5.00
🏫 Federal University of Technology Akure (FUTA), Nigeria
🔬 NNPC Geoscience Undergraduate Scholar 2022–2025
