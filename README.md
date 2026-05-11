# Geospatial Remote Sensing Portfolio
### Oloyede David Oluwayinka — B.Tech Remote Sensing & GIS, FUTA (First Class, 4.51/5.00)

This repository contains code samples demonstrating large-sample satellite image analysis,
SAR-based water detection, multi-temporal LULC classification, and shoreline change analysis
using Google Earth Engine, Python, and GIS tools.

These scripts were developed during undergraduate research at the Federal University of
Technology Akure (FUTA), Nigeria, and are submitted as part of my application for the
MSc/PhD position in remote sensing and large-sample hydrology applied to river morphodynamics
at the Département de Géomatique appliquée, Université de Sherbrooke, under the supervision
of Prof. Anya Leenman.

---

## Repository contents

| File | Platform | Method | Study area |
|------|----------|--------|------------|
| `sentinel1_flood_mapping.js` | Google Earth Engine | SAR Otsu thresholding, flood extent delineation | Nasarawa State, Nigeria |
| `lagos_uhi_classification.js` | Google Earth Engine | Random Forest LULC, LST retrieval, spectral indices | Lagos State, Nigeria |
| `angola_coastline_dsas.js` | Google Earth Engine | NDWI water delineation, multi-temporal shoreline extraction | Angola coastline |

---

## Script 1 — Sentinel-1 SAR flood mapping

**File:** `sentinel1_flood_mapping.js`  
**Platform:** Google Earth Engine (JavaScript API)  
**Datasets:** `COPERNICUS/S1_GRD` (Sentinel-1 IW SAR, VV polarisation)  
**Study area:** Nasarawa State, Nigeria (Benue River basin)  
**Time periods:** Pre-flood (July 2022 & July 2024) vs. post-flood (October 2022 & October 2024)

### What it does
Detects and delineates flood-inundated areas by comparing pre- and post-flood Sentinel-1 SAR
backscatter. Uses Otsu thresholding — an automated histogram-based segmentation method — to
separate water pixels from land. Outputs flood extent polygons with area quantified in hectares.
Results were validated against NEMA and IOM field reports.

### Key methods
- Radiometric calibration, terrain correction, and speckle filtering (Lee filter)
- Otsu threshold applied to VV backscatter difference image
- SRTM DEM masking to exclude permanent water bodies and steep slopes
- Flood area calculation and export to Google Drive

### Run it in GEE
> **To get your shareable link:** Open the script in the [GEE Code Editor](https://code.earthengine.google.com),
> click **"Get Link"** (top-right of the editor toolbar) → copy the URL that appears.
> Paste it here to replace this placeholder.

🔗 **GEE link:** `https://code.earthengine.google.com/b9e59934a3fd84aa96f71e99cfea4556`

### Output
![Flood extent map 2022](outputs/flood_extent_2022.png)
*Flood extent map for Nasarawa State, 2022 — 97,495 ha inundated, concentrated in Doma, Keana, and Toto LGAs along the Benue River.*

![Flood extent map 2024](outputs/flood_extent_2024.png)
*Flood extent map for Nasarawa State, 2024 — 63,577 ha inundated (34.8% reduction from 2022).*

### Relevance to river morphodynamics
SAR backscatter-based water detection is directly applicable to delineating river channel
boundaries over time. Adapting this workflow to multi-year Sentinel-1 time series would enable
detection of lateral channel migration, cutoffs, and avulsions — a core objective of Prof.
Leenman's research on river morphodynamics.

---

## Script 2 — Lagos Urban Heat Island: LULC classification & LST retrieval

**File:** `lagos_uhi_classification.js`  
**Platform:** Google Earth Engine (JavaScript API)  
**Datasets:** `LANDSAT/LC08/C02/T1_L2`, `LANDSAT/LC09/C02/T1_L2`, `LANDSAT/LE07/C01/T1_L2`  
**Study area:** Lagos State, Nigeria  
**Time period:** 2015–2024 (10-year multi-temporal analysis)

### What it does
Retrieves Land Surface Temperature (LST) across Lagos State over a 10-year period using the
mono-window algorithm on Landsat 7/8/9 imagery. Classifies land use and land cover (LULC)
into five classes using supervised Random Forest classification, and computes spectral indices
(NDVI, NDWI, NDBI) to quantify vegetation loss, water extent, and built-up expansion.
Results showed a +2.4°C increase in mean LST and conversion of 34% of vegetated land to
impervious surfaces over the study period.

### Key methods
- Landsat surface reflectance pre-processing and cloud masking
- Supervised Random Forest classification (5 LULC classes, 500 trees)
- Mono-window LST retrieval using Band 10 thermal infrared
- NDVI, NDWI, NDBI computation and correlation with LST
- Multi-temporal change detection across 2015, 2018, 2021, and 2024

### Run it in GEE
> **To get your shareable link:** In the GEE Code Editor, click **"Get Link"** in the toolbar
> and copy the URL.

🔗 **GEE link:** `[PASTE YOUR GEE SHAREABLE LINK HERE]`

### Output
![LULC classification Lagos 2024](outputs/lagos_lulc_2024.png)
*Random Forest LULC classification of Lagos State, 2024, showing urban expansion into
previously vegetated areas.*

![LST map Lagos](outputs/lagos_lst_map.png)
*Land Surface Temperature map showing UHI hotspots in high-density urban cores
(Lagos Island, Surulere, Mushin).*

### Relevance to river morphodynamics
This script demonstrates a complete large-sample, multi-temporal change detection pipeline
in GEE — the same methodological framework applicable to tracking river channel planform
change at regional scale using Sentinel-2 or Landsat time series.

---

## Script 3 — Angola coastline: NDWI delineation & shoreline change analysis

**File:** `angola_coastline_dsas.js`  
**Platform:** Google Earth Engine (JavaScript API)  
**Datasets:** `COPERNICUS/S2_SR`, `LANDSAT/LC08/C02/T1_L2`, GEBCO bathymetry  
**Study area:** Angola coastline  
**Time period:** Multi-temporal (2015–2024)

### What it does
Extracts shoreline positions from multi-temporal Landsat and Sentinel-2 imagery using
NDWI-based water body delineation. Shoreline change rates (erosion and accretion) are
quantified using the Digital Shoreline Analysis System (DSAS) methodology. Bathymetric
analysis of the continental shelf is performed using GEBCO data to contextualise coastal
morphodynamics.

### Key methods
- NDWI computation and thresholding to extract water/land boundary
- Multi-temporal shoreline extraction from Landsat 7/8/9 and Sentinel-2
- DSAS transect-based analysis: Net Shoreline Movement (NSM), End Point Rate (EPR),
  Linear Regression Rate (LRR)
- GEBCO bathymetric profiling and contour mapping

### Run it in GEE
> **To get your shareable link:** In the GEE Code Editor, click **"Get Link"** in the toolbar
> and copy the URL.

🔗 **GEE link:** `[PASTE YOUR GEE SHAREABLE LINK HERE]`

### Output
![Angola shoreline change](outputs/angola_shoreline_change.png)
*Multi-temporal shoreline positions along the Angola coast showing zones of erosion and
accretion derived from DSAS transect analysis.*

### Relevance to river morphodynamics
Tracking shoreline position change over time using transect-based rate calculations is
structurally identical to measuring lateral river channel migration. The DSAS methodology —
extracting a boundary, projecting transects, computing displacement rates — translates
directly to quantifying river bank migration and channel width change from satellite imagery.

---

## Script 4 — Python geospatial analysis

**File:** `geospatial_analysis.py`  
**Language:** Python 3  
**Key libraries:** `geopandas`, `rasterio`, `numpy`, `matplotlib`, `shapely`, `pandas`

### What it does
Demonstrates Python-based geospatial data processing including raster reading and band
manipulation, vector spatial operations, and map-quality output generation. Includes
workflows for clipping rasters to study area boundaries, computing zonal statistics,
and producing publication-ready figures.

### Setup and run

```bash
pip install geopandas rasterio numpy matplotlib shapely pandas
python geospatial_analysis.py
```

### Output
![Python output](outputs/python_output.png)
*Example output from the Python geospatial analysis workflow.*

---

## Technical environment

| Tool | Version / Notes |
|------|----------------|
| Google Earth Engine | JavaScript API — free academic access via [signup](https://earthengine.google.com/signup/) |
| Python | 3.10+ |
| QGIS | 3.x (post-processing and cartography) |
| ArcGIS Pro | Overlay analysis and map production |
| Key satellite data | Sentinel-1 IW GRD, Sentinel-2 SR, Landsat 7/8/9 C2 L2, SRTM DEM, GEBCO |

---

## How to run the GEE scripts

1. Sign in to [Google Earth Engine Code Editor](https://code.earthengine.google.com)
2. Click any of the GEE shareable links above — the script opens directly in your browser
3. Click **"Run"** — no setup, no installation required
4. Results appear in the map panel and console output

> **Note on boundary assets:** Some scripts reference study area boundary assets stored in
> my personal GEE account (e.g., Nasarawa State shapefile). Where these are used, a comment
> in the script indicates how to substitute the equivalent from public sources such as
> FAO GAUL (`FAO/GAUL/2015/level1`) or OCHA CODs.

---

## Contact

**Oloyede David Oluwayinka**  
B.Tech Remote Sensing & GIS — Federal University of Technology Akure (FUTA), Nigeria  
📧 oloyededavid10@gmail.com  
📞 +234 706 730 1587  
📄 Thesis preprint: *Spatio-Temporal Assessment of Urban Heat Island Dynamics in Lagos State, Nigeria (2015–2024)* — EarthArXiv [link pending]
