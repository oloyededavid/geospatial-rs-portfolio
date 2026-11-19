"""Draw the "Project areas" section of index.html: one panel per project, each at its own scale, so no project is
shown as a dot on a map drawn for the others. Panels follow the order of the project cards.

Shapes come from the studies' published files:
  01-05, 09      docs/data/footprints.geojson of the Open-Geodata-Catalogue (vector items: the study outlines)
  06             the Lekki-Epe barrier outline, read back from the earlier index map in this page (assets/atlas-06.json)
  08             Mozambique's outline, dissolved from the study's district file (assets/atlas-08.json)
  07             the Mau Forest study box (scripts/study.py of Mau-Forest-Land-Cover)
Country outlines: Natural Earth, from the catalogue's docs/assets/basemap.geojson.

    python3 tools/build_atlas.py     # expects the catalogue clone next to this repository
"""
import html
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
CAT = ROOT.parent / 'open-geodata-catalogue' / 'docs'
GH = 'https://github.com/oloyededavid/'
W, H = 400, 300  # panel viewBox

# number, colour, title, place, repository, how to get the shapes
P = {
    '01': ('#1f5fae', 'Hydrological extremes where the gauges are missing', 'Sokoto–Rima basin and Lower Niger–Benue, Nigeria',
           'Observational-Hydrology-Extremes', ('fp', 'observational-hydrology-extremes', 'study-areas')),
    '02': ('#0f766e', 'Surface water from headwaters to lagoon', 'Ogun River, from headwaters to the Lagos Lagoon',
           'Ogun-Catchment-Coast-Observatory', ('fp', 'ogun-catchment-coast-observatory', 'sub-basins')),
    '03': ('#a8661b', 'Testing a satellite water balance for groundwater recharge', 'Upper Ouémé, Benin, and Upper Ogun, Nigeria',
           'Oueme-Ogun-Groundwater-Recharge', ('fp', 'oueme-ogun-groundwater-recharge', 'basins')),
    '04': ('#5b6b7a', 'Water storage in the Lake Chad basin from GRACE and GRACE-FO', 'Lake Chad basin, Central Africa',
           'Groundwater-Storage-Gravimetry', ('fp', 'groundwater-storage-gravimetry', 'study-areas')),
    '05': ('#b3361b', 'Urban heat island and distance to vegetation in Lagos State', 'Lagos State, Nigeria',
           'Lagos-Urban-Heat-Analytics', ('fp', 'lagos-urban-heat-analytics', 'lga-attributes')),
    '06': ('#6b4c9a', 'Urban sealing and the shallow water table of the Lekki–Epe barrier', 'Lekki–Epe barrier, Lagos, Nigeria',
           'Coastal-Hydrogeology-Modeling', ('file', 'atlas-06.json')),
    '07': ('#2e7d4f', 'Land cover in the Mau Forest Complex', 'Mau Forest Complex, Kenya',
           'Mau-Forest-Land-Cover', ('box', (35.30, -0.95, 36.10, -0.15))),
    '08': ('#a3346a', 'Travel time to health facilities', 'Mozambique, 159 districts',
           'Mozambique-Health-Access', ('file', 'atlas-08.json')),
    '09': ('#3d4f9f', 'An open catalogue of the study outputs', 'Seven studies, West, Central and southern Africa',
           'Open-Geodata-Catalogue', ('all',)),
}
ORDER = ['01', '07', '05', '08', '03', '06', '04', '02', '09']


def rings(geom):
    t, c = geom['type'], geom['coordinates']
    if t == 'Polygon':
        return [c[0]]
    if t == 'MultiPolygon':
        return [p[0] for p in c]
    return []


def shapes(spec, fp):
    kind = spec[0]
    if kind == 'fp':
        return [r for f in fp if f['properties']['collection'] == spec[1] and f['properties']['id'] == spec[2]
                for r in rings(f['geometry'])]
    if kind == 'all':
        return [r for f in fp for r in rings(f['geometry'])]
    if kind == 'box':
        a, b, c, d = spec[1]
        return [[[a, b], [c, b], [c, d], [a, d], [a, b]]]
    return json.loads((ROOT / 'assets' / spec[1]).read_text())


def nice(km):
    for v in (1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000):
        if v >= km:
            return v
    return 2000


def panel(n, fp, base):
    col, title, place, repo, spec = P[n]
    rs = shapes(spec, fp)
    xs = [p[0] for r in rs for p in r]; ys = [p[1] for r in rs for p in r]
    lat0 = (min(ys) + max(ys)) / 2
    k = math.cos(math.radians(lat0))
    cx, cy = (min(xs) + max(xs)) / 2, lat0
    w, h = (max(xs) - min(xs)) * k, max(ys) - min(ys)
    s = min(W * .8 / w, H * .74 / h)  # px per degree of latitude
    pr = lambda lon, lat: (W / 2 + (lon - cx) * k * s, H / 2 - (lat - cy) * s)
    def d(ring):
        pts = [pr(*p[:2]) for p in ring]
        out, last = [], None
        for x, y in pts:
            q = (round(x, 1), round(y, 1))
            if q != last:
                out.append(q); last = q
        return 'M' + 'L'.join(f'{x},{y}' for x, y in out) + 'Z'
    # country outlines that reach the panel
    lon_r = (cx - W / 2 / (k * s), cx + W / 2 / (k * s)); lat_r = (cy - H / 2 / s, cy + H / 2 / s)
    ctx = []
    # Natural Earth is too coarse for panels under about 400 km across: there the panel shows the study outline alone
    wide = W / (s / 111.32) > 400
    for f in (base if wide else []):
        for r in rings(f['geometry']):
            if any(lon_r[0] - 2 < p[0] < lon_r[1] + 2 and lat_r[0] - 2 < p[1] < lat_r[1] + 2 for p in r):
                ctx.append(d(r))
    study = ''.join(d(r) for r in rs)
    # scale bar: about a fifth of the panel
    km_px = s / 111.32
    km = nice(W * .2 / km_px); bar = km * km_px
    g = (f'<svg class="at-map{"" if wide else " at-local"}" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
         f'<path class="at-land" d="{"".join(ctx)}"/>'
         f'<path class="at-fill" d="{study}" fill="url(#h{n})"/><path class="at-line" d="{study}" style="stroke:{col}"/>'
         f'<g class="at-scale" transform="translate(14,{H - 16})"><path d="M0,0H{bar:.1f}"/><text x="{bar + 6:.1f}" y="4">{km:,} km</text></g>'
         f'</svg>')
    return (f'<li class="at-cell" data-n="{n}">{g}<div class="at-text"><span class="at-n">{n}</span>'
            f'<span class="leg-t"><a href="#study-{n}">{html.escape(title, quote=False)}</a><small>{html.escape(place, quote=False)}</small></span>'
            f'<a class="leg-src" href="{GH}{repo}" rel="noopener" aria-label="Source code for {html.escape(title)}">Source</a></div></li>')


def patterns():
    ang = {'01': 45, '02': -45, '03': 0, '04': 90, '05': 45, '06': -45, '07': 45, '08': -45, '09': 0}
    return ''.join(f'<pattern id="h{n}" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate({ang[n]})">'
                   f'<line x1="0" y1="0" x2="0" y2="5" style="stroke:{P[n][0]}"/></pattern>' for n in ORDER)


def main():
    fp = json.loads((CAT / 'data' / 'footprints.geojson').read_text())['features']
    base = json.loads((CAT / 'assets' / 'basemap.geojson').read_text())['features']
    block = ('<!-- atlas:start -->\n    <svg width="0" height="0" class="at-defs" aria-hidden="true" focusable="false"><defs>'
             + patterns() + '</defs></svg>\n    <ol class="atlas">\n'
             + '\n'.join('      ' + panel(n, fp, base) for n in ORDER)
             + '\n    </ol>\n    <p class="at-note">Each panel is drawn at its own scale. Country outlines: Natural Earth, omitted where the panel spans less than 400 km.</p>\n    <!-- atlas:end -->')
    p = ROOT / 'index.html'
    s = p.read_text(encoding='utf-8')
    s, k = re.subn(r'<!-- atlas:start -->.*?<!-- atlas:end -->', lambda _: block, s, flags=re.S)
    if k != 1:
        raise SystemExit('index.html has no atlas markers')
    p.write_text(s, encoding='utf-8')
    print('wrote the project areas panels')


if __name__ == '__main__':
    main()
