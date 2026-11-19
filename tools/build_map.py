"""Draw the index map of the "Project areas" section of index.html: one map of Africa with the area of every project.

Shapes come from the studies' published files:
  01-05  docs/data/footprints.geojson of the Open-Geodata-Catalogue (vector items: the study outlines)
  06     the Lekki-Epe barrier outline (assets/atlas-06.json)
  07     the Mau Forest study box (scripts/study.py of Mau-Forest-Land-Cover)
  08     Mozambique's outline, dissolved from the study's district file (assets/atlas-08.json)
  09     the catalogue holds the layers of 01-06 and 08, so it is marked with a badge and named in the legend
Country outlines: Natural Earth, from the catalogue's docs/assets/basemap.geojson. Plate carrée, like the earlier map.

    python3 tools/build_map.py     # expects the catalogue clone next to this repository
"""
import html
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
CAT = ROOT.parent / 'open-geodata-catalogue' / 'docs'
GH = 'https://github.com/oloyededavid/'
LON0, LON1, LAT0, LAT1 = -2.0, 42.0, -27.5, 18.5
W = 1000
K = W / (LON1 - LON0)
H = round((LAT1 - LAT0) * K)

P = {  # colour, title, place, repository, shapes, badge offset in px (0, 0 = on the shape)
    '01': ('#1f5fae', 'Hydrological extremes where the gauges are missing', 'Sokoto–Rima basin and Lower Niger–Benue, Nigeria',
           'Observational-Hydrology-Extremes', ('fp', 'observational-hydrology-extremes', 'study-areas'), (0, 0)),
    '02': ('#0f766e', 'Surface water from headwaters to lagoon', 'Ogun River, from headwaters to the Lagos Lagoon',
           'Ogun-Catchment-Coast-Observatory', ('fp', 'ogun-catchment-coast-observatory', 'sub-basins'), (-62, -6)),
    '03': ('#a8661b', 'Testing a satellite water balance for groundwater recharge', 'Upper Ouémé, Benin, and Upper Ogun, Nigeria',
           'Oueme-Ogun-Groundwater-Recharge', ('fp', 'oueme-ogun-groundwater-recharge', 'basins'), (-58, -40)),
    '04': ('#5b6b7a', 'Water storage in the Lake Chad basin from GRACE and GRACE-FO', 'Lake Chad basin, Central Africa',
           'Groundwater-Storage-Gravimetry', ('fp', 'groundwater-storage-gravimetry', 'study-areas'), (0, 0)),
    '05': ('#b3361b', 'Urban heat island and distance to vegetation in Lagos State', 'Lagos State, Nigeria',
           'Lagos-Urban-Heat-Analytics', ('fp', 'lagos-urban-heat-analytics', 'lga-attributes'), (-40, 44)),
    '06': ('#6b4c9a', 'Urban sealing and the shallow water table of the Lekki–Epe barrier', 'Lekki–Epe barrier, Lagos, Nigeria',
           'Coastal-Hydrogeology-Modeling', ('file', 'atlas-06.json'), (12, 50)),
    '07': ('#2e7d4f', 'Land cover in the Mau Forest Complex', 'Mau Forest Complex, Kenya',
           'Mau-Forest-Land-Cover', ('box', (35.30, -0.95, 36.10, -0.15)), (46, -34)),
    '08': ('#a3346a', 'Travel time to health facilities', 'Mozambique, 159 districts',
           'Mozambique-Health-Access', ('file', 'atlas-08.json'), (0, 0)),
    '09': ('#3d4f9f', 'An open catalogue of the study outputs', 'The layers of projects 01–06 and 08',
           'Open-Geodata-Catalogue', None, None),
}
COUNTRIES = [('NIGERIA', 8.0, 9.6), ('NIGER', 9.5, 17.0), ('CHAD', 18.8, 16.0), ('CAMEROON', 12.6, 4.6),
             ('DR CONGO', 23.5, -3.0), ('KENYA', 38.0, 2.2), ('TANZANIA', 34.8, -6.6), ('ANGOLA', 17.6, -12.4),
             ('ZAMBIA', 26.5, -14.6), ('MOZAMBIQUE', 38.6, -13.6), ('SOUTH AFRICA', 25.0, -27.0)]
SEAS = [('Gulf of Guinea', 0.0, 2.2), ('Indian Ocean', 39.0, -21.5)]


def xy(lon, lat):
    return (lon - LON0) * K, (LAT1 - lat) * K


def rings(geom):
    t, c = geom['type'], geom['coordinates']
    return [c[0]] if t == 'Polygon' else [p[0] for p in c] if t == 'MultiPolygon' else []


def path(rs, step=0.6):
    out = []
    for r in rs:
        pts, last = [], None
        for lon, lat in (p[:2] for p in r):
            x, y = xy(lon, lat)
            if last is None or abs(x - last[0]) + abs(y - last[1]) >= step:
                pts.append((x, y)); last = (x, y)
        if len(pts) > 2:
            out.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z')
    return ''.join(out)


def shapes(spec, fp):
    if spec[0] == 'fp':
        return [r for f in fp if f['properties']['collection'] == spec[1] and f['properties']['id'] == spec[2]
                for r in rings(f['geometry'])]
    if spec[0] == 'box':
        a, b, c, d = spec[1]
        return [[[a, b], [c, b], [c, d], [a, d], [a, b]]]
    return json.loads((ROOT / 'assets' / spec[1]).read_text())


def centre(rs):
    big = max(rs, key=lambda r: (max(p[0] for p in r) - min(p[0] for p in r)) * (max(p[1] for p in r) - min(p[1] for p in r)))
    xs = [p[0] for p in big]; ys = [p[1] for p in big]
    return xy((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2)


def badge(n, x, y):
    return (f'<g class="badge" data-n="{n}" tabindex="-1" focusable="false" aria-hidden="true"><circle cx="{x:.1f}" cy="{y:.1f}" r="13.5"/>'
            f'<text x="{x:.1f}" y="{y + 4.2:.1f}" text-anchor="middle">{n}</text></g>')


def legend_item(n):
    col, title, place, repo = P[n][:4]
    t = html.escape(title, quote=False)
    sw = ('<rect x="1" y="1" width="20" height="14" class="sw-line sw-09" stroke-dasharray="3 2"/>' if n == '09' else
          f'<rect x="1" y="1" width="20" height="14" fill="url(#h{n})" class="sw-fill"/><rect x="1" y="1" width="20" height="14" class="sw-line sw-{n}"/>')
    return (f'<li class="leg" data-n="{n}"><svg class="sw" viewBox="0 0 22 16" aria-hidden="true">{sw}</svg><span class="leg-n">{n}</span>'
            f'<span class="leg-t"><a href="#study-{n}">{t}</a><small>{html.escape(place, quote=False)}</small></span>'
            f'<a class="leg-src" href="{GH}{repo}" rel="noopener" aria-label="Source code for {html.escape(title)}">Source</a></li>')


def main():
    fp = json.loads((CAT / 'data' / 'footprints.geojson').read_text())['features']
    base = json.loads((CAT / 'assets' / 'basemap.geojson').read_text())['features']
    land = path([r for f in base for r in rings(f['geometry'])])
    ang = {'01': 45, '02': -45, '03': 0, '04': 90, '05': 45, '06': -45, '07': 45, '08': -45}
    defs = ''.join(f'<pattern id="h{n}" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate({a})">'
                   f'<line x1="0" y1="0" x2="0" y2="5" class="hatch hatch-{n}"/></pattern>' for n, a in ang.items())
    g = [f'<title id="map-title">Index map of the nine projects</title>',
         '<desc id="map-desc">Africa from the Sahel to Mozambique with the area of each project: the Sokoto–Rima basin and the '
         'Lower Niger–Benue reach, the Ogun catchment, the Ouémé and Upper Ogun catchments, the Lake Chad basin, Lagos State, the '
         'Lekki–Epe barrier, the Mau Forest Complex in Kenya and Mozambique. The open data catalogue holds the layers of all but '
         'the Mau study.</desc>', f'<defs>{defs}</defs>',
         f'<rect class="sea" x="0" y="0" width="{W}" height="{H}"/>', f'<path class="land" d="{land}"/>', f'<path class="borders" d="{land}"/>']
    for lon in range(0, 41, 10):
        x = xy(lon, 0)[0]; g.append(f'<line class="grat" x1="{x:.1f}" y1="0" x2="{x:.1f}" y2="{H}"/>')
    for lat in range(-20, 11, 10):
        y = xy(0, lat)[1]; g.append(f'<line class="grat" x1="0" y1="{y:.1f}" x2="{W}" y2="{y:.1f}"/>')
    for name, lon, lat in COUNTRIES:
        x, y = xy(lon, lat); g.append(f'<text class="country" x="{x:.1f}" y="{y:.1f}" text-anchor="middle">{name}</text>')
    for name, lon, lat in SEAS:
        x, y = xy(lon, lat); g.append(f'<text class="sea-label" x="{x:.1f}" y="{y:.1f}">{name}</text>')
    order = ['04', '08', '01', '03', '02', '05', '06', '07']  # large shapes first, so small ones stay on top
    badges = []
    for n in order:
        rs = shapes(P[n][4], fp)
        d = path(rs, 0.3)
        g.append(f'<a class="fp-link" href="#study-{n}" tabindex="-1" aria-hidden="true"><g class="fp fp-{n}" data-n="{n}" tabindex="-1" '
                 f'focusable="false"><path class="fp-fill" d="{d}" fill="url(#h{n})"/><path class="fp-line" pathLength="1" d="{d}"/></g></a>')
        cx, cy = centre(rs); dx, dy = P[n][5]
        if dx or dy:
            badges.append(f'<line class="leader" data-n="{n}" x1="{cx:.1f}" y1="{cy:.1f}" x2="{cx + dx:.1f}" y2="{cy + dy:.1f}"/>'
                          f'<circle class="lead-dot" cx="{cx:.1f}" cy="{cy:.1f}" r="2"/>' + badge(n, cx + dx, cy + dy))
        else:
            badges.append(badge(n, cx, cy))
    g += badges
    g.append(f'<rect class="neat" x="0.5" y="0.5" width="{W - 1}" height="{H - 1}"/>')
    ticks_top = ''.join(f'<span style="left:{xy(lon, 0)[0] / W * 100:.2f}%">{abs(lon)}°{"E" if lon > 0 else ""}</span>' for lon in range(0, 41, 10))
    ticks_left = ''.join(f'<span style="top:{xy(0, lat)[1] / H * 100:.2f}%">{abs(lat)}°{"N" if lat > 0 else "S" if lat < 0 else ""}</span>'
                         for lat in range(-20, 11, 10))
    km_w = 1000 / 111.32 * K / W * 100  # 1,000 km along the equator, as a share of the map width
    block = f'''<!-- map:start -->
    <div class="sheet-frame">
      <figure class="mapbox">
        <div class="map-inner">
        <div class="ticks ticks-top" aria-hidden="true">{ticks_top}</div>
        <div class="ticks ticks-left" aria-hidden="true">{ticks_left}</div>
          <svg class="sheet-map" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="group" aria-labelledby="map-title map-desc">
{chr(10).join(g)}
</svg>
          <div class="coord" aria-hidden="true" data-extent="{LON0} {LON1} {LAT0} {LAT1}"></div>
          <div class="north" aria-hidden="true"><svg viewBox="0 0 20 30" width="16" height="24"><path d="M10 2 L16 26 L10 21 L4 26 Z"/></svg><span>N</span></div>
          <div class="scale" aria-hidden="true" style="--w:{km_w:.2f}%"><div class="scale-bar"><i></i><i></i></div><span>0</span><span class="mid">500</span><span class="end">1,000 km</span></div>
        </div>
      </figure>

      <div class="margin">
        <div class="legend" id="legend" aria-labelledby="legend-title">
          <p class="meta" id="legend-title">Nine projects in Africa</p>
          <ol class="leg-list">{''.join(legend_item(n) for n in sorted(P))}</ol>
        </div>
      </div>
    </div>
    <!-- map:end -->'''
    p = ROOT / 'index.html'
    s = p.read_text(encoding='utf-8')
    s, k = re.subn(r'<!-- (?:map|atlas):start -->.*?<!-- (?:map|atlas):end -->', lambda _: block, s, flags=re.S)
    if k != 1:
        raise SystemExit('index.html has no map markers')
    p.write_text(s, encoding='utf-8')
    print(f'wrote the index map ({W} x {H})')


if __name__ == '__main__':
    main()
