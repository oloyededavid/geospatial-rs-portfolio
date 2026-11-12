"""Build the index-map SVG for the portfolio's map sheet.

Real geometry only: Natural Earth 1:50m countries (world-atlas 2.0.2) and each study's own footprint file.
Projection: equirectangular with standard parallel 11 N (x scaled by cos 11), WGS 84.
Writes sheet.svg and sheet_meta.json (scale-bar length for the page).
"""
import json, math
from shapely.geometry import shape, box, Point, LineString
from shapely.ops import unary_union

G = '/home/user/portfolio-work/geo/'
W0, W1, S0, S1 = -1.0, 26.0, 3.5, 18.0          # extent, degrees
PHI = math.radians(11.0)
W = 1000.0                                       # svg width in user units
SX = W / ((W1 - W0) * math.cos(PHI))
H = round((S1 - S0) * SX, 1)

def px(lon, lat):
    return ((lon - W0) * math.cos(PHI) * SX, (S1 - lat) * SX)

def path(geom, tol=0.0):
    g = geom.simplify(tol, preserve_topology=True) if tol else geom
    polys = [g] if g.geom_type in ('Polygon', 'LineString') else list(g.geoms)
    out = []
    for p in polys:
        rings = [p.exterior] + list(p.interiors) if p.geom_type == 'Polygon' else [p]
        for r in rings:
            pts = [px(x, y) for x, y in r.coords]
            if len(pts) < 2:
                continue
            out.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ('Z' if p.geom_type == 'Polygon' else ''))
    return ''.join(out)

frame = box(W0, S0, W1, S1)
countries = json.load(open(G + 'countries.geojson'))['features']
borders = []
for f in countries:
    g = shape(f['geometry'])
    if g.bounds[2] < W0 - 1 or g.bounds[0] > W1 + 1 or g.bounds[3] < S0 - 1 or g.bounds[1] > S1 + 1:
        continue
    g = g.buffer(0)
    if g.intersects(frame):
        borders.append(g.intersection(frame))
land = unary_union(borders)

def feats(p):
    return json.load(open(p))['features']

hyd = {f['properties']['id']: shape(f['geometry']) for f in feats(G + 'hydro.geojson')}
ogun = unary_union([shape(f['geometry']) for f in feats(G + 'ogun.geojson')])
oueme = {f['properties']['basin_id']: shape(f['geometry']) for f in feats(G + 'oueme.geojson')}
chad = [shape(f['geometry']) for f in json.load(open(G + 'grace_cells.json'))['domains']['features'] if f['properties']['id'] == 'lev3'][0]
lagos = unary_union([shape(f['geometry']) for f in feats(G + 'lagos.geojson')]).buffer(0)

# footprints: (number, key, geometries, label anchor for the badge, leader start)
FP = [
    ('04', 'chad', [chad], (17.6, 11.2), None),
    ('01', 'hydro', [hyd['sokoto_rima'], hyd['niger_benue']], (6.3, 13.0), None),
    ('03', 'oueme', [oueme['upper_oueme'], oueme['upper_ogun']], (0.2, 11.4), (2.25, 9.6)),
    ('02', 'ogun', [ogun], (5.6, 8.9), (3.75, 7.9)),
    ('05', 'lagos', [lagos], (2.4, 4.75), (3.4, 6.45)),
]
EXTRA_BADGES = [('01', (8.1, 6.55), (7.3, 6.9))]   # second badge for the Lower Niger-Benue box

B_ = 'https://oloyededavid.github.io/'
LINKS = {'01': (B_ + 'Observational-Hydrology-Extremes/', 'Hydrological extremes where the gauges are missing'),
         '02': (B_ + 'Ogun-Catchment-Coast-Observatory/', 'Ogun Catchment-to-Coast Observatory'),
         '03': (B_ + 'Oueme-Ogun-Groundwater-Recharge/', 'Testing a satellite water balance for groundwater recharge'),
         '04': (B_ + 'Groundwater-Storage-Gravimetry/', 'Water storage in the Lake Chad basin'),
         '05': (B_ + 'Lagos-Urban-Heat-Analytics/', 'Urban heat island in Lagos State')}
LABELS = [('NIGERIA', 6.9, 9.6), ('NIGER', 9.5, 16.6), ('CHAD', 20.5, 16.6), ('CAMEROON', 12.6, 4.7), ('BENIN', 2.25, 11.9),
          ('CENTRAL AFRICAN REP.', 21.6, 5.0), ('GHANA', -0.2, 7.0), ('TOGO', 1.05, 9.0)]

svg = [f'<svg class="sheet-map" viewBox="0 0 {W:.0f} {H:.0f}" xmlns="http://www.w3.org/2000/svg" role="group" aria-labelledby="map-title map-desc">',
       '<title id="map-title">Index map of the five studies</title>',
       '<desc id="map-desc">West and Central Africa with the footprint of each study: the Lake Chad basin, the Sokoto–Rima basin and the Lower Niger–Benue reach, the Ouémé and Upper Ogun catchments, the Ogun catchment, and Lagos State.</desc>',
       '<defs>',
       ''.join(f'<pattern id="h{n}" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate({a})"><line x1="0" y1="0" x2="0" y2="5" class="hatch hatch-{n}"/></pattern>'
               for n, a in (('01', 45), ('02', -45), ('03', 0), ('04', 90), ('05', 45))),
       '</defs>',
       f'<rect class="sea" x="0" y="0" width="{W:.0f}" height="{H:.0f}"/>',
       f'<path class="land" d="{path(land, 0.02)}"/>',
       f'<path class="borders" d="{"".join(path(b.boundary, 0.02) for b in borders)}"/>']
# graticule
for lon in range(0, 26, 5):
    x, _ = px(lon, S0); svg.append(f'<line class="grat" x1="{x:.1f}" y1="0" x2="{x:.1f}" y2="{H:.0f}"/>')
for lat in range(5, 18, 5):
    _, y = px(W0, lat); svg.append(f'<line class="grat" x1="0" y1="{y:.1f}" x2="{W:.0f}" y2="{y:.1f}"/>')
for t, lon, lat in LABELS:
    x, y = px(lon, lat); svg.append(f'<text class="country" x="{x:.1f}" y="{y:.1f}" text-anchor="middle">{t}</text>')
x, y = px(3.6, 4.0); svg.append(f'<text class="sea-label" x="{x:.1f}" y="{y:.1f}">Gulf of Guinea</text>')

for n, key, geoms, anchor, lead in FP:
    d = ''.join(path(g, 0.01) for g in geoms)
    url, name = LINKS[n]
    svg.append(f'<a class="fp-link" href="{url}" tabindex="-1" aria-hidden="true"><g class="fp fp-{n}" data-n="{n}" tabindex="-1" focusable="false"><path class="fp-fill" d="{d}" fill="url(#h{n})"/><path class="fp-line" d="{d}"/></g></a>')
def badge(n, anchor, lead):
    bx, by = px(*anchor); s = []
    if lead:
        lx, ly = px(*lead); s.append(f'<line class="leader" data-n="{n}" x1="{lx:.1f}" y1="{ly:.1f}" x2="{bx:.1f}" y2="{by:.1f}"/><circle class="lead-dot" cx="{lx:.1f}" cy="{ly:.1f}" r="2"/>')
    s.append(f'<g class="badge" data-n="{n}" tabindex="-1" focusable="false" aria-hidden="true"><circle cx="{bx:.1f}" cy="{by:.1f}" r="13.5"/><text x="{bx:.1f}" y="{by + 4.2:.1f}" text-anchor="middle">{n}</text></g>')
    return ''.join(s)
for n, key, geoms, anchor, lead in FP:
    svg.append(badge(n, anchor, lead))
for n, anchor, lead in EXTRA_BADGES:
    svg.append(badge(n, anchor, lead))
svg.append(f'<rect class="neat" x="0.5" y="0.5" width="{W - 1:.0f}" height="{H - 1:.0f}"/>')
svg.append('</svg>')
open('/home/user/portfolio-work/sheet.svg', 'w').write('\n'.join(svg))

# collar ticks (percent positions) and scale bar
ticks = {'lon': [(lon, px(lon, S0)[0] / W * 100) for lon in range(0, 26, 5)],
         'lat': [(lat, px(W0, lat)[1] / H * 100) for lat in range(5, 18, 5)]}
km_per_unit = (111.32 * math.cos(PHI)) / (SX * math.cos(PHI))   # km per svg unit along the parallel
meta = {'W': W, 'H': H, 'km_per_unit': km_per_unit, 'ticks': ticks}
json.dump(meta, open('/home/user/portfolio-work/sheet_meta.json', 'w'))
print('svg', round(len('\n'.join(svg)) / 1024, 1), 'KB', 'H', H, 'km/unit', round(km_per_unit, 3))
