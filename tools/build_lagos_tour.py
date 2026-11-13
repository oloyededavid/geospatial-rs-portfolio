"""Write the audited Lagos figures into assets/lagos-lga.json for the homepage map tour.

Source: docs/data/extra_analysis.json in the Lagos-Urban-Heat-Analytics repository (the audited
2020-2024 study: surface urban heat island and distance to vegetation). Geometry and land area are
kept from the existing file; every value shown on the map comes from the study file.

    python3 tools/build_lagos_tour.py [path/to/lagos-urban-heat-analytics]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT.parent / 'lagos-urban-heat-analytics') / 'docs/data/extra_analysis.json'
lga = json.loads(src.read_text())['lga']
out = ROOT / 'assets/lagos-lga.json'
g = json.loads(out.read_text())
for f in g['features']:
    p = f['properties']
    a = lga[p['n']]
    f['properties'] = {
        'n': p['n'],
        'area': p['area'],
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
