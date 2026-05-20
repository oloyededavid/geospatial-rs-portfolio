# Geospatial & Remote Sensing Portfolio

**Oloyede David Oluwayinka**
B.Tech Remote Sensing & GIS — First Class Honours
---

Four production ready Google Earth Engine scripts developed as an undergraduate research assistant at FUTA.

Each project addresses a distinct geomorphic domain which includes urban thermal dynamics, SAR flood hydrology, coastal shoreline change, and riverine flood vulnerability, using a shared pipeline of pre-processing, classification, and spatial analysis workflows.

---

## Projects at a Glance

| # | Project | Study Area | Core Method | Report |
|---|---------|------------|-------------|---------|
| 01 | SAR Flood Mapping | Nasarawa State, Nigeria | Sentinel-1 + Otsu thresholding | [Nasarawa_Flood_Impact_2022_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/c46d65ea69d8f0094203b2e08e68563bed59e516/Nasarawa_Flood_Impact_2022_2024.pdf) |
| 02 | Urban Heat Island | Lagos State, Nigeria | Random Forest LULC + Mono-window LST | [Lagos_UHI_Analysis_2015_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/d20c73007fecf943dd2c7b6d8cfca723bf78fa5f/Lagos_UHI_Analysis_2015_2024.pdf) |
| 03 | Coastline Change | Angola Coastline | NDWI delineation + DSAS EPR | [Angola_Coastline_Shoreline_Change.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/9acabb356f6f8e1102476f5c53a13d4dc2742bf7/Angola_Coastline_Shoreline_Change.pdf) |
| 04 | Flood Impact & Vulnerability | Ogbaru LGA, Anambra State, Nigeria | Sentinel-1 SAR + RF LULC + AHP-FVI | [Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/70794802bb8c7c4536dd457f18419cc1199a30ab/Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf) |

---

## Repository Structure

```
geospatial-rs-portfolio/
├── README.md
├── LICENSE
├── sentinel1_flood_mapping.js           # Project 01 — SAR Otsu flood detection
├── lagos_uhi_classification.js          # Project 02 — Random Forest LULC + LST
├── angola_coastline_dsas.js             # Project 03 — NDWI shoreline extraction + EPR
├── ogbaru_flood_impact_vulnerability.js # Project 04 — SAR flood mapping + RF LULC + AHP-FVI
└── reports/
    ├── Nasarawa_Flood_Impact_2022_2024.pdf
    ├── Lagos_UHI_Analysis_2015_2024.pdf
    ├── Angola_Coastline_Shoreline_Change.pdf
    └── Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf
```

> **PDF reports** are stored in the `reports/` folder and linked throughout this README. Each report contains the full methodology, maps, and statistical outputs corresponding to its GEE script.

---

## Project 01 — Sentinel-1 SAR Flood Mapping

**Script:** `sentinel1_flood_mapping.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/227bc81fde875996b884639d2f0d18af)
**Full Report:** [Nasarawa_Flood_Impact_2022_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/c46d65ea69d8f0094203b2e08e68563bed59e516/Nasarawa_Flood_Impact_2022_2024.pdf)

### What this project does

Detects and delineates flood-inundated areas across Nasarawa State, Nigeria, by comparing pre- and post-flood Sentinel-1 SAR backscatter across two flood seasons (2022 and 2024). Otsu thresholding automatically identifies water pixels, whilst SRTM slope masking and JRC surface water layers eliminate false positives.

**Primary dataset:** `COPERNICUS/S1_GRD` (Sentinel-1 IW GRD, VV polarisation) + SRTM DEM
**Analysis period:** Pre-flood (July 2022 & July 2024) vs. post-flood (October 2022 & October 2024)

### Methodology

**Pre-processing**
Radiometric calibration, Range-Doppler terrain correction, and Lee speckle filtering were applied to reduce geometric distortions and speckle noise inherent in SAR imagery before any analysis.

**Flood detection**
Otsu thresholding was applied to the VV backscatter difference image (post − pre). The algorithm finds the threshold that minimises intra-class variance between water and non-water pixels, producing a binary flood mask.

**False positive reduction**
SRTM DEM slope masking excluded steep terrain pixels that generate false SAR returns. The JRC Global Surface Water mask separated transient floodwater from permanent water bodies such as rivers and lakes.

**Area quantification**
Flood extent was computed in hectares at Local Government Area (LGA) resolution using `reduceRegion` with a `sum` reducer, enabling direct comparison between 2022 and 2024.

### Key Findings

The 2022 event inundated substantially larger areas than 2024 across all analysed LGAs, with flood extent concentrated along the Benue River floodplain in **Doma, Keana, and Toto LGAs**. The reduced 2024 extent suggests improved hydrological management or climatic variation.

For detailed statistics and inundation maps, see [Nasarawa_Flood_Impact_2022_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/bfb662a91f4daf97c4d4f8470386b82c6bf6d3b2/Nasarawa_Flood_Impact_2022_2024.pdf)
---





## Project 02 — Lagos Urban Heat Island Analysis

**Script:** `lagos_uhi_classification.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/b9e59934a3fd84aa96f71e99cfea4556)
**Full Report:** [Lagos_UHI_Analysis_2015_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/d20c73007fecf943dd2c7b6d8cfca723bf78fa5f/Lagos_UHI_Analysis_2015_2024.pdf)

### What this project does

Spatio-temporal assessment of Urban Heat Island (UHI) dynamics across Lagos State from 2015 to 2024, combining supervised Random Forest land use/land cover (LULC) classification with mono-window Land Surface Temperature (LST) retrieval from Landsat thermal bands.

**Primary datasets:** `LANDSAT/LC08/C02/T1_L2` and `LANDSAT/LC09/C02/T1_L2`
**Analysis years:** 2015, 2019, 2024

### Methodology

**Pre-processing**
Landsat Collection 2 surface reflectance products were used for their improved radiometric accuracy. Cloud and cloud shadow pixels were masked using the QA_PIXEL band. Landsat 8 and Landsat 9 images were harmonised to ensure spectral consistency.

**LULC classification**
A supervised Random Forest classifier (500 trees) was trained on manually digitised training samples across five classes: Urban, Vegetation, Water, Bare Soil, and Agriculture. Input features included reflectance bands, NDVI, NDBI, and NDMI.

**LST retrieval**
Land Surface Temperature was derived from Landsat Band 10 (thermal infrared) using the mono-window algorithm. Land surface emissivity was estimated from NDVI using the Sobrino threshold method.

**Spatial analysis**
Getis-Ord Gi* spatial autocorrelation identified statistically significant UHI hotspots. Pearson correlations between LST and NDVI/NDBI quantified the relationship between vegetation loss, built-up intensity, and surface temperature rise.

### Key Findings

The analysis reveals a strong negative relationship between vegetation cover and surface temperature (LST–NDVI Pearson r = −0.78), and a strong positive relationship between built-up intensity and LST (r = 0.82). Urban core temperatures exceed vegetation-rich peripheries by **5–7 °C**.

LULC classification accuracy: **89.2% overall accuracy, Kappa = 0.86.**

For full trend analysis, LST maps by year, and LULC transition matrices, see [Lagos_UHI_Analysis_2015_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/d20c73007fecf943dd2c7b6d8cfca723bf78fa5f/Lagos_UHI_Analysis_2015_2024.pdf)
---






## Project 03 — Angola Coastline Shoreline Change

**Script:** `angola_coastline_dsas.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/c20be2146d3386884ddfcde9173b02e6)
**Full Report:** [Angola_Coastline_Shoreline_Change.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/9acabb356f6f8e1102476f5c53a13d4dc2742bf7/Angola_Coastline_Shoreline_Change.pdf)

### What this project does

Multi-temporal shoreline extraction and DSAS-style change rate analysis along the Angola coastline (2018–2024). Shoreline positions are extracted from Landsat 8/9 and Sentinel-2 composites using NDWI thresholding, and End Point Rate (EPR) statistics quantify erosion vs. accretion along transects.

**Primary datasets:** `COPERNICUS/S2_SR_HARMONIZED`, `LANDSAT/LC08/C02/T1_L2`, `LANDSAT/LC09/C02/T1_L2`, NOAA ETOPO1
**Analysis period:** 2018–2024

### Methodology

**Multi-sensor compositing**
Cloud-masked composites were built from Landsat 8/9 and Sentinel-2 SR Harmonised collections. Float32 type homogenisation ensured consistent band arithmetic across sensors before merging.

**Shoreline extraction**
NDWI (McFeeters 1996) was applied to delineate water bodies at a threshold of 0. The water/land boundary was sharpened to a single-pixel edge using focal dilation, producing a clean shoreline vector.

**Change detection**
A binary change map classified each pixel as erosion (land → water) or accretion (water → land) between 2018 and 2024.

**DSAS transect analysis**
Ten east-west transects were placed at 1.2° latitude spacing from 5°S to 17°S (labelled A–J). For each transect, the End Point Rate was calculated as: EPR = (shoreline position 2024 − shoreline position 2018) / 6 years, expressing coastal change in metres per year.

**Outputs**
All products were exported to Google Drive: flood masks and change rasters as GeoTIFFs, transect EPR values as CSV, and shoreline vectors as shapefiles.

### Key Findings

The 10-transect EPR analysis reveals spatially variable coastal behaviour along the Angola coastline, with mixed erosion and accretion patterns. Bathymetric analysis from ETOPO1 contextualises the shelf gradient and sediment transport dynamics.

For EPR values per transect, change magnitude maps, and shelf bathymetry profiles, see [Angola_Coastline_Shoreline_Change.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/9acabb356f6f8e1102476f5c53a13d4dc2742bf7/Angola_Coastline_Shoreline_Change.pdf)
---
## Project 04 — Ogbaru LGA Flood Impact & Vulnerability Assessment

**Script:** `ogbaru_flood_impact_vulnerability.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/43f670fce32ea55affdfd4926880ffdd)
**Full Report:** [Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/70794802bb8c7c4536dd457f18419cc1199a30ab/Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf)
### What this project does

Multi-temporal geospatial assessment of flood impact and vulnerability in Ogbaru Local Government Area, Anambra State, Nigeria (2018–2023). Sentinel-1 SAR flood extents are mapped annually, overlaid on Random Forest LULC classifications, and combined with population density and terrain data via Analytical Hierarchy Process (AHP) to derive a spatially-explicit Flood Vulnerability Index (FVI).

**Primary datasets:** `COPERNICUS/S1_GRD` (Sentinel-1 IW GRD, VV polarisation) + `COPERNICUS/S2_SR_HARMONIZED` + SRTM DEM + CHIRPS Rainfall + WorldPop
**Analysis years:** 2018, 2020, 2022, 2023

### Methodology

**Flood Mapping**
VV-polarised SAR imagery was speckle-filtered and converted to dB. Otsu thresholding delineated water from land on post-flood (Aug–Oct) composites. SRTM slope masking (>5°) and JRC permanent water masks eliminated false positives.

**LULC Classification**
Cloud-masked Sentinel-2 SR composites were classified with supervised Random Forest (100 trees) across five classes: Water, Vegetation, Built-up, Bareland, and Forest. Input features included band reflectances, NDVI, NDBI, NDMI, and NDWI.

**Flood Impact Analysis**
Flood binary masks were overlaid on post-flood LULC maps to compute inundated area (ha) per land cover class. Infrastructure risk was assessed via 50 m buffers around OSM roads and settlements in each inundated zone.

**Vulnerability Assessment**
Five spatial layers were min-max normalised and combined via AHP-inspired weighted summation: elevation (30%), flood history (25%), population density (20%), LULC exposure (15%), slope (10%). The result is a spatially-continuous Flood Vulnerability Index (FVI) ranging from 0 (low) to 1 (very high).

### Key Findings

Average annual inundation of **2,158.68 ha** (~5.6% of Ogbaru's land area), peaking at **2,470.95 ha in 2018** and correlating strongly with CHIRPS rainfall (r = 0.65). Cumulative vegetation loss of ~340 ha over five years reflects repeated inundation stress. **High-to-very-high FVI zones** encompass **8,124 ha** (21% of LGA) and overlap with settlements and agricultural land, affecting ~187,000 people based on WorldPop density.

LULC classification accuracy: **>85% overall accuracy, Kappa > 0.80.**

For full flood extent maps by year, LULC transition matrices, impact tables by land cover class, and the FVI spatial map, see [Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/70794802bb8c7c4536dd457f18419cc1199a30ab/Ogbaru_Flood_Impact_Vulnerability_2018_2023.pdf)


## Technical environment

| Tool | Version / Notes |
|------|----------------|
| Google Earth Engine | JavaScript API |
| Python | 3.10+ |
| QGIS | 3.x (post-processing and cartography) |
| ArcGIS Pro | Overlay analysis and map production |
| Key satellite data | Sentinel-1 IW GRD, Sentinel-2 SR, Landsat 7/8/9 C2 L2, SRTM DEM, GEBCO, CHIRPS Rainfall, WorldPop |

---


**Oloyede David Oluwayinka**
🎓 B.Tech Remote Sensing & GIS — First Class Honors
