# Geospatial & Remote Sensing Portfolio

**Oloyede David Oluwayinka**
B.Tech Remote Sensing & GIS — First Class Honours · Federal University of Technology Akure (FUTA), Nigeria
📧 oloyededavid10@gmail.com · 📞 +234 706 730 1587

---

Three production-ready Google Earth Engine scripts developed during undergraduate research at FUTA. Each project addresses a distinct geomorphic domain — urban thermal dynamics, SAR flood hydrology, and coastal shoreline change — using a shared pipeline of cloud-native remote sensing, multi-temporal change detection, and automated classification on the Google Earth Engine JavaScript API.

---

## Projects at a Glance

| # | Project | Study Area | Core Method | Report |
|---|---------|------------|-------------|--------|
| 01 | SAR Flood Mapping | Nasarawa State, Nigeria | Sentinel-1 + Otsu thresholding | [📄 PDF][Nasarawa_Flood_Impact_2022_2024.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/c46d65ea69d8f0094203b2e08e68563bed59e516/Nasarawa_Flood_Impact_2022_2024.pdf) |
| 02 | Urban Heat Island | Lagos State, Nigeria | Random Forest LULC + Mono-window LST | [📄 PDF][(reports/Lagos_UHI_Analysis_2015_2024.pdf)](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/cda6d662b2f79866373ff551a3af51a75880b50f/Lagos_UHI_Analysis_2015_2024.pdf) |
| 03 | Coastline Change | Angola Coastline | NDWI delineation + DSAS EPR | [📄 PDF]([reports/Angola_Coastline_Shoreline_Change.pdf](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/45a3c505b79b98dff53fb01d816afd0dc2d123f7/Angola_Coastline_Shoreline_Change.pdf)) |

---

## Repository Structure

```
geospatial-rs-portfolio/
├── README.md
├── sentinel1_flood_mapping.js        # Project 01 — SAR Otsu flood detection
├── lagos_uhi_classification.js       # Project 02 — Random Forest LULC + LST
├── angola_coastline_dsas.js          # Project 03 — NDWI shoreline extraction + EPR
└── reports/
    ├── Nasarawa_Flood_Impact_2022_2024.pdf
    ├── Lagos_UHI_Analysis_2015_2024.pdf
    └── Angola_Coastline_Shoreline_Change.pdf
```

> **PDF reports** are stored in the `reports/` folder and linked throughout this README. Each report contains the full methodology, maps, and statistical outputs corresponding to its GEE script.

---

## Project 01 — Sentinel-1 SAR Flood Mapping

**Script:** `sentinel1_flood_mapping.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/227bc81fde875996b884639d2f0d18af)
**Full Report:** [[📄 Nasarawa_Flood_Impact_2022_2024.pdf]](https://github.com/oloyededavid/geospatial-rs-portfolio/blob/c46d65ea69d8f0094203b2e08e68563bed59e516/Nasarawa_Flood_Impact_2022_2024.pdf)

### What this project does

Detects and delineates flood-inundated areas across Nasarawa State, Nigeria, by comparing pre- and post-flood Sentinel-1 SAR backscatter across two flood seasons (2022 and 2024). Otsu thresholding — a histogram-based segmentation algorithm — automatically identifies the optimal water/land separation threshold without manual tuning. Results were cross-validated against NEMA and IOM field reports.

**Primary dataset:** `COPERNICUS/S1_GRD` (Sentinel-1 IW GRD, VV polarisation) + SRTM DEM
**Analysis period:** Pre-flood (July 2022 & July 2024) vs. post-flood (October 2022 & October 2024)

### Methodology

**Pre-processing**
Radiometric calibration, Range-Doppler terrain correction, and Lee speckle filtering were applied to reduce geometric distortions and speckle noise inherent in SAR imagery before any analysis.

**Flood detection**
Otsu thresholding was applied to the VV backscatter difference image (post − pre). The algorithm finds the threshold that minimises intra-class variance between water and non-water pixels, producing a binary flood mask without manual intervention.

**False positive reduction**
SRTM DEM slope masking excluded steep terrain pixels that generate false SAR returns. The JRC Global Surface Water mask separated transient floodwater from permanent water bodies such as rivers and reservoirs.

**Area quantification**
Flood extent was computed in hectares at Local Government Area (LGA) resolution using `reduceRegion` with a `sum` reducer, enabling direct comparison between 2022 and 2024.

### Key Findings

The 2022 event inundated substantially larger areas than 2024 across all analysed LGAs, with flood extent concentrated along the Benue River floodplain in **Doma, Keana, and Toto LGAs**. The reduction in 2024 inundation is contextualised in the full report.

For detailed statistics and inundation maps, see [📄 Nasarawa_Flood_Impact_2022_2024.pdf](reports/Nasarawa_Flood_Impact_2022_2024.pdf).

---

## Project 02 — Lagos Urban Heat Island Analysis

**Script:** `lagos_uhi_classification.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/b9e59934a3fd84aa96f71e99cfea4556)
**Full Report:** [📄 Lagos_UHI_Analysis_2015_2024.pdf](reports/Lagos_UHI_Analysis_2015_2024.pdf)

### What this project does

Spatio-temporal assessment of Urban Heat Island (UHI) dynamics across Lagos State from 2015 to 2024, combining supervised Random Forest land use/land cover (LULC) classification with mono-window Land Surface Temperature (LST) retrieval from Landsat 8 and Landsat 9. The analysis tracks how urban expansion has driven systematic changes in surface temperature across one of Africa's largest megacities.

**Primary datasets:** `LANDSAT/LC08/C02/T1_L2` and `LANDSAT/LC09/C02/T1_L2`
**Analysis years:** 2015, 2019, 2024

### Methodology

**Pre-processing**
Landsat Collection 2 surface reflectance products were used for their improved radiometric accuracy. Cloud and cloud shadow pixels were masked using the QA_PIXEL band. Landsat 8 and Landsat 9 image collections were merged into a single unified collection (Landsat 9 launched September 2021 and was required for the 2024 composite).

**LULC classification**
A supervised Random Forest classifier (500 trees) was trained on manually digitised training samples across five classes: Urban, Vegetation, Water, Bare Soil, and Agriculture. Input features included surface reflectance bands alongside spectral indices — NDVI, NDWI, NDBI, Urban Index, and Albedo.

**LST retrieval**
Land Surface Temperature was derived from Landsat Band 10 (thermal infrared) using the mono-window algorithm. Land surface emissivity was estimated from NDVI using the Sobrino threshold method.

**Spatial analysis**
Getis-Ord Gi* spatial autocorrelation identified statistically significant UHI hotspots. Pearson correlations between LST and NDVI/NDBI quantified the relationship between vegetation loss, built-up expansion, and surface heating.

### Key Findings

The analysis reveals a strong negative relationship between vegetation cover and surface temperature (LST–NDVI Pearson r = −0.78), and a strong positive relationship between built-up intensity and surface temperature (LST–NDBI Pearson r = +0.74). Primary hotspot zones were identified in Lagos Island, Surulere, Mushin, and Alimosho.

LULC classification accuracy: **89.2% overall accuracy, Kappa = 0.86.**

For full trend analysis, LST maps by year, and LULC transition matrices, see [📄 Lagos_UHI_Analysis_2015_2024.pdf](reports/Lagos_UHI_Analysis_2015_2024.pdf).

---

## Project 03 — Angola Coastline Shoreline Change

**Script:** `angola_coastline_dsas.js`
**GEE:** [Open in Earth Engine](https://code.earthengine.google.com/c20be2146d3386884ddfcde9173b02e6)
**Full Report:** [📄 Angola_Coastline_Shoreline_Change.pdf](reports/Angola_Coastline_Shoreline_Change.pdf)

### What this project does

Multi-temporal shoreline extraction and DSAS-style change rate analysis along the Angola coastline (2018–2024). Shoreline positions are extracted from Landsat 8/9 and Sentinel-2 composites using NDWI-based water boundary delineation. End Point Rate (EPR) statistics computed along 10 fixed cross-shore transects quantify the rate and direction of shoreline migration across the full coastline extent (5°S–17°S). Offshore bathymetry from ETOPO1 contextualises coastal morphodynamics relative to continental shelf geometry.

**Primary datasets:** `COPERNICUS/S2_SR_HARMONIZED`, `LANDSAT/LC08/C02/T1_L2`, `LANDSAT/LC09/C02/T1_L2`, NOAA ETOPO1
**Analysis period:** 2018–2024

### Methodology

**Multi-sensor compositing**
Cloud-masked composites were built from Landsat 8/9 and Sentinel-2 SR Harmonised collections. Float32 type homogenisation ensured consistent band arithmetic across sensors before merging.

**Shoreline extraction**
NDWI (McFeeters 1996) was applied to delineate water bodies at a threshold of 0. The water/land boundary was sharpened to a single-pixel edge using focal dilation, producing a clean shoreline vector for each composite year.

**Change detection**
A binary change map classified each pixel as erosion (land → water) or accretion (water → land) between 2018 and 2024.

**DSAS transect analysis**
Ten east-west transects were placed at 1.2° latitude spacing from 5°S to 17°S (labelled A–J). For each transect, the End Point Rate was calculated as: EPR = (shoreline position 2024 − shoreline position 2018) / 6 years. Negative EPR indicates shoreline retreat; positive EPR indicates progradation.

**Outputs**
All products were exported to Google Drive: flood masks and change rasters as GeoTIFFs, transect EPR values as CSV, and shoreline vectors as shapefiles.

### Key Findings

The 10-transect EPR analysis reveals spatially variable coastal behaviour along the Angola coastline, with mixed erosion and accretion patterns. Bathymetric analysis from ETOPO1 contextualises these dynamics relative to the shelf break geometry.

For EPR values per transect, change magnitude maps, and shelf bathymetry profiles, see [📄 Angola_Coastline_Shoreline_Change.pdf](reports/Angola_Coastline_Shoreline_Change.pdf).

---

## Technical Stack

**Cloud platform:** Google Earth Engine (JavaScript API)
**Post-processing:** QGIS 3.x · ArcGIS Pro
**Primary satellite datasets:** Sentinel-1 IW GRD · Sentinel-2 SR Harmonised · Landsat 7/8/9 Collection 2 Level 2 · SRTM DEM · NOAA ETOPO1

---

## How to Add the PDF Reports to This Repo

The three PDF reports should be committed to the `reports/` folder at the root of the repository so the links in this README resolve correctly:

```
reports/
├── Nasarawa_Flood_Impact_2022_2024.pdf
├── Lagos_UHI_Analysis_2015_2024.pdf
└── Angola_Coastline_Shoreline_Change.pdf
```

**Step-by-step:**

```bash
# From the root of your local clone
mkdir reports

# Copy your PDFs into the folder, then:
git add reports/
git commit -m "Add project reports"
git push
```

GitHub renders PDF links as direct download/view links — anyone visiting your portfolio can open the full report from the README in one click.

---

## Suggestions for Strengthening This Portfolio

**1. Add a `figures/` folder with key output images**
Export one representative map from each GEE script (as PNG) and embed it directly in the README using `![caption](figures/image.png)`. Visual outputs make the portfolio immediately compelling without requiring a PDF download.

**2. Export and commit sample outputs**
Add at least one exported CSV or GeoTIFF sample (small area, short time range) to the repo so reviewers can inspect real outputs without running the scripts themselves.

**3. Add a `requirements` or environment note**
Even though GEE is cloud-native, note the GEE account setup step and any Python/QGIS post-processing dependencies used to produce the reports.

**4. Add a `CHANGELOG.md`**
Document what changed between script versions. This signals code maintenance habits, which matters in research contexts.

**5. GitHub Releases for large PDFs**
If your PDFs are large (> 5 MB), use GitHub Releases to attach them rather than committing them to the main branch. Link to the release asset URL in the README instead of the `reports/` path.

**6. Add a short methods diagram (SVG or PNG)**
A simple flowchart showing the GEE pipeline for each project — input dataset → pre-processing → analysis → output — makes the methodology scannable at a glance and demonstrates systems thinking.

---

## Contact

**Oloyede David Oluwayinka**
📧 oloyededavid10@gmail.com
📞 +234 706 730 1587
🎓 B.Tech Remote Sensing & GIS — First Class Honours, GPA 4.51/5.00
🏫 Federal University of Technology Akure (FUTA), Nigeria
