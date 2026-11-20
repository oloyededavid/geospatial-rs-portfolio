"""Build twin/cities.json for the City twins page from the GHSL Urban Centre Database R2024A V1.2 (CC BY 4.0).

Download GHS_UCDB_GLOBE_R2024A_V1_2.zip from the JRC GHSL data portal, unzip it, then:

    python3 tools/build_twin_data.py path/to/GHS_UCDB_GLOBE_R2024A.gpkg
"""
import sqlite3, json, math, sys
from pathlib import Path
OUT = Path(__file__).resolve().parents[1] / 'twin' / 'cities.json'
from pyproj import Transformer
# centroids are stored in World Mollweide (ESRI:54009); convert to longitude/latitude
to_ll = Transformer.from_crs('ESRI:54009', 'EPSG:4326', always_xy=True)
db = sqlite3.connect(sys.argv[1])
T = lambda t: f'"GHSL_UCDB_THEME_{t}_GLOBE_R2024A"'
q = f'''select a.ID_UC_G0, a.GC_UCN_MAI_2025, a.GC_CNT_GAD_2025, c.GC_UCC_LON_2025, c.GC_UCC_LAT_2025,
  a.GC_POP_TOT_2025, a.GC_UCA_KM2_2025, a.CL_B01_CUR_2010, a.CL_B12_CUR_2010, a.CL_B04_CUR_2010, a.CL_KOP_CUR_2025,
  g.GR_AVG_GRN_2025, h.GH_BUH_AVG_2020
  from {T("CLIMATE")} a join {T("GREENNESS")} g using(ID_UC_G0) join {T("GHSL")} h using(ID_UC_G0)
  join UC_centroids c using(ID_UC_G0)'''
rows, dropped = [], 0
for r in db.execute(q):
    id_, name, cn, lon, lat, pop, km2, t, p, ts, kop, grn, bh = r
    vals = [lon, lat, pop, km2, t, p, ts, grn, bh]
    if name is None or any(v is None or (isinstance(v, float) and math.isnan(v)) for v in vals) or km2 <= 0 or pop <= 0:
        dropped += 1; continue
    lon, lat = to_ll.transform(lon, lat)
    rows.append([name, cn, round(lon, 3), round(lat, 3), round(pop), round(pop / km2), round(t, 1), round(p), round(ts / 100, 2), round(grn, 3), round(bh, 1), int(kop) if kop is not None else 0, int(id_)])
rows.sort(key=lambda x: -x[4])  # largest cities first, so search suggestions list them first
meta = {"source": "GHSL Urban Centre Database R2024A V1.2, European Commission JRC, CC BY 4.0",
        "fields": ["name", "country", "lon", "lat", "pop2025", "density_per_km2", "temp_mean_c_2010s", "rain_mm_yr_2010s", "temp_seasonality_sd_c", "greenness_ndvi", "building_height_m", "koppen_beck", "ghsl_id"],
        "coords": "centroid converted from World Mollweide (ESRI:54009) to WGS 84 degrees", "n": len(rows), "dropped_missing": dropped}
print(meta['n'], 'kept', dropped, 'dropped')

# Mean and standard deviation of the seven matching features; the page standardises with these.
import numpy as np
X = np.array([[r[6], math.log(r[7] + 1), r[8], r[9], r[10], math.log(r[5]), math.log(r[4])] for r in rows])
mu, sd = X.mean(0), X.std(0)
meta.update({"feature_mean": [round(float(v), 5) for v in mu], "feature_sd": [round(float(v), 5) for v in sd]})
json.dump({"meta": meta, "rows": rows}, open(OUT, 'w'), separators=(',', ':'), ensure_ascii=False)
print('wrote', OUT)
# note: the page text quotes the city count (11,406); update index.html and i18n/*.json if it changes
