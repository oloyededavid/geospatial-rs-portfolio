"""Write the audited Lagos figures into assets/lagos-lga.json for the homepage map tour.

Source: docs/data/extra_analysis.json in the Lagos-Urban-Heat-Analytics repository (the audited
2020-2024 study: surface urban heat island and distance to vegetation). Land area per LGA comes from
docs/data/lagos_ghsl.csv in the same repository. Geometry is kept from the existing file; every value
shown on the map comes from the study files.

    python3 tools/build_lagos_tour.py [path/to/lagos-urban-heat-analytics]
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
repo = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT.parent / 'lagos-urban-heat-analytics')
src = repo / 'docs/data/extra_analysis.json'
lga = json.loads(src.read_text())['lga']
land = {r['lga_name']: float(r['land_km2']) for r in csv.DictReader((repo / 'docs/data/lagos_ghsl.csv').open())}
out = ROOT / 'assets/lagos-lga.json'
g = json.loads(out.read_text())
g.pop('period', None)
g['source'] = 'Lagos-Urban-Heat-Analytics, docs/data/extra_analysis.json and docs/data/lagos_ghsl.csv'
for f in g['features']:
    p = f['properties']
    a = lga[p['n']]
    f['properties'] = {
        'n': p['n'],
        'area': round(land[p['n']]),
        'suhi': a['pop_weighted_mean_suhi_c'],
        'beyond': round(a['population_beyond_300m_share'] * 100, 1),
        'hot': round(a['population_in_hot_cells_share'] * 100, 1),
        'low': round(a['population_low_ground_share'] * 100, 1),
        'pop': a['population'],
    }
missing = {f['properties']['n'] for f in g['features']} ^ set(lga)
if missing:
    sys.exit(f'LGA names differ: {sorted(missing)}')
out.write_text(json.dumps(g, separators=(',', ':')))
print('wrote', out.relative_to(ROOT), len(g['features']), 'LGAs from', src)
