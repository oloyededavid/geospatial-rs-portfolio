"""Build twin/cities.json for the City twins section from the GHSL Urban Centre Database R2024A V1.2 (CC BY 4.0).

Download GHS_UCDB_GLOBE_R2024A_V1_2.zip from the JRC GHSL data portal, unzip it, then:

    python3 tools/build_twin_data.py path/to/GHS_UCDB_GLOBE_R2024A.gpkg

What is kept, and why (checked 20 Nov 2026):
- Matching uses climate type (Koppen-Geiger, Beck et al.), mean temperature and temperature seasonality, plus size.
  Temperature and seasonality agreed closely with the independent, station-based WorldClim 2.1 data at all
  11,4xx centres (r = 0.97 and 0.99). The database's rainfall did not (r = 0.79, 1 in 18 centres off by more than
  a factor of two), so rainfall is not used.
- Population density is not used: urban centres are drawn around their densest cells only, so small towns score
  as dense as megacities.
- The card contrasts population since 1975 (modelled, within today's urban centre), building height (2020) and
  greenness (NDVI, 2025). These are satellite-based estimates and are shown as such, without rankings.
"""
import sqlite3, json, math, sys
from pathlib import Path
import numpy as np
from pyproj import Transformer  # requires: pip install numpy pyproj

OUT = Path(__file__).resolve().parents[1] / 'twin' / 'cities.json'
YEARS = list(range(1975, 2030, 5))  # 1975 ... 2025
to_ll = Transformer.from_crs('ESRI:54009', 'EPSG:4326', always_xy=True)  # centroids are in World Mollweide
db = sqlite3.connect(sys.argv[1])
T = lambda t: f'"GHSL_UCDB_THEME_{t}_GLOBE_R2024A"'
pops = ', '.join(f'h.GH_POP_TOT_{y}' for y in YEARS)
# names and countries are read from the CLIMATE table: the GENERAL_CHARACTERISTICS table has mis-encoded country names
q = f'''select a.ID_UC_G0, a.GC_UCN_MAI_2025, a.GC_CNT_GAD_2025, c.GC_UCC_LON_2025, c.GC_UCC_LAT_2025,
  a.CL_B01_CUR_2010, a.CL_B04_CUR_2010, a.CL_KOP_CUR_2025, g.GR_AVG_GRN_2025, h.GH_BUH_AVG_2020, {pops}
  from {T("CLIMATE")} a join {T("GREENNESS")} g using(ID_UC_G0) join {T("GHSL")} h using(ID_UC_G0)
  join UC_centroids c using(ID_UC_G0)'''
bad = lambda v: v is None or (isinstance(v, float) and math.isnan(v))
rows, dropped = [], 0
for r in db.execute(q):
    id_, name, cn, x, y, t, ts, kop, grn, bh, *series = r
    if name is None or any(bad(v) for v in [x, y, t, ts, kop, grn, bh, *series]) or series[-1] <= 0:
        dropped += 1; continue
    lon, lat = to_ll.transform(x, y)
    # fields: name, country, lon, lat, population 2025, mean temperature (C, 2010s), seasonality (SD of monthly means, C),
    # greenness (NDVI), building height (m), Koppen class, GHSL id, population 1975..2025 in steps of 5 years
    rows.append([name, cn, round(lon, 3), round(lat, 3), round(series[-1]), round(t, 1) + 0.0, round(ts / 100, 2),
                 round(grn, 3), round(bh, 1), int(kop), int(id_), [round(p) for p in series]])
rows.sort(key=lambda r: -r[4])  # largest first, so search suggestions list them first
X = np.array([[r[5], r[6], math.log(r[4])] for r in rows])
meta = {"source": "GHSL Urban Centre Database R2024A V1.2, European Commission JRC, CC BY 4.0",
        "fields": ["name", "country", "lon", "lat", "pop2025", "temp_mean_c_2010s", "temp_seasonality_sd_c", "greenness_ndvi_2025",
                   "building_height_m_2020", "koppen_beck", "ghsl_id", "pop_1975_to_2025_every_5y"],
        "coords": "centroid converted from World Mollweide (ESRI:54009) to WGS 84 degrees",
        "years": YEARS, "n": len(rows), "dropped_missing": dropped,
        "feature_mean": [round(float(v), 5) for v in X.mean(0)], "feature_sd": [round(float(v), 5) for v in X.std(0)]}
json.dump({"meta": meta, "rows": rows}, open(OUT, 'w'), separators=(',', ':'), ensure_ascii=False)
print(meta['n'], 'kept,', dropped, 'dropped; wrote', OUT)
# note: the page text quotes the city count; update index.html and i18n/*.json if it changes
