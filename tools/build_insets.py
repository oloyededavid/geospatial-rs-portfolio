"""Build the Insets section: one study per row, real-data figure per study (inline SVG)."""
import json, csv, re, html

P = '/home/user/oloyededavid/geospatial-rs-portfolio/index.html'
B = 'https://oloyededavid.github.io/'
G = 'https://github.com/oloyededavid/'
W, H = 300, 64            # figure viewBox
PADT, PADB = 8, 14

def months(a, b):
    y0, m0 = map(int, a.split('-')); y1, m1 = map(int, b.split('-'))
    return (y1 - y0) * 12 + (m1 - m0)

def line_fig(series, lo=None, hi=None, zero=False):
    """series: list of (t, v) with t in months from start; gaps over 2 months break the line."""
    t0, t1 = series[0][0], series[-1][0]
    vs = [v for _, v in series]
    lo = min(vs) if lo is None else lo; hi = max(vs) if hi is None else hi
    X = lambda t: (t - t0) / (t1 - t0) * (W - 2) + 1
    Y = lambda v: PADT + (hi - v) / (hi - lo) * (H - PADT - PADB)
    d, prev = [], None
    for t, v in series:
        d.append(('L' if prev is not None and t - prev <= 2 else 'M') + f'{X(t):.1f},{Y(v):.1f}'); prev = t
    out = []
    if zero:
        out.append(f'<line class="fx-zero" x1="0" x2="{W}" y1="{Y(0):.1f}" y2="{Y(0):.1f}"/>')
    out.append(f'<path class="fx-line" d="{"".join(d)}"/>')
    pts = [[round(X(t), 1), round(Y(v), 1)] for t, v in series]
    return ''.join(out), pts

def bar_fig(vals):
    lo, hi = 0, max(vals) * 1.08
    n = len(vals); bw = (W - (n - 1) * 6) / n
    out, pts = [], []
    for i, v in enumerate(vals):
        x = i * (bw + 6); y = PADT + (hi - v) / (hi - lo) * (H - PADT - PADB)
        out.append(f'<rect class="fx-bar" x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{H - PADB - y:.1f}"/>')
        pts.append([round(x + bw / 2, 1), round(y, 1)])
    return ''.join(out), pts

# ---------- data ----------
a = json.load(open('/home/user/observational-hydrology-extremes/docs/data/a.json'))['vh']['monthly']
s1 = [((r['year'] - 2018) * 12 + r['month'] - 1, r['flood_floodplain_km2']) for r in a]
s1_lab = [f"{r['year']}-{r['month']:02d}" for r in a]

og = list(csv.DictReader(open('/home/user/portfolio-work/sig/ogun_monthly.csv')))
s2 = [(i, float(r['rain_mm'])) for i, r in enumerate(og)]
s2_lab = [r['year_month'] for r in og]

bal = [r for r in csv.DictReader(open('/home/user/oueme-ogun-groundwater-recharge/docs/data/annual_balance.csv')) if r['basin_id'] == 'upper_oueme']
s3 = [float(r['surplus_chirps2_mm']) for r in bal]
s3_lab = [r['year'] for r in bal]

gr = json.load(open('/home/user/portfolio-work/sig/grav_storage.json'))['rows']
gr = [r for r in gr if r['tws_mm_anom'] is not None]
s4 = [(months('2002-04', r['month']), r['tws_mm_anom']) for r in gr]
s4_lab = [r['month'] for r in gr]

def fmt_month(s):
    y, m = s.split('-'); return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][int(m) - 1] + ' ' + y

def figure(n, kind, series, labels, unit, cap, ends, aria, zero=False, dec=0):
    if kind == 'line':
        body, pts = line_fig(series, zero=zero); vals = [v for _, v in series]
        labs = [fmt_month(l) for l in labels]
    else:
        body, pts = bar_fig(series); vals = series; labs = labels
    data = html.escape(json.dumps({'p': pts, 'v': [round(v, dec) for v in vals], 'l': labs, 'u': unit}))
    return f'''<figure class="fx fx-{n}">
            <div class="fx-plot"><svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label="{html.escape(aria)}" data-fx="{data}">{body}<line class="fx-cross" x1="0" x2="0" y1="0" y2="{H - PADB}"/><circle class="fx-dot" r="3" cx="-9" cy="-9"/></svg><output class="fx-tip" aria-hidden="true"></output></div>
            <figcaption class="meta"><span>{ends[0]}</span><span class="fx-cap">{cap}</span><span>{ends[1]}</span></figcaption>
          </figure>'''

FIG = {
    '01': figure('01', 'line', s1, s1_lab, 'km²', 'Floodplain water seen by Sentinel-1 radar, km², monthly', ('2018', '2023'),
                 f'Line chart of floodplain water on the Lower Niger–Benue reach from Sentinel-1, monthly 2018–2023, ranging from {min(v for _, v in s1):.0f} to {max(v for _, v in s1):.0f} km² with a peak each wet season.'),
    '02': figure('02', 'line', s2, s2_lab, 'mm', 'Catchment rainfall (CHIRPS), mm per month', ('2019', '2024'),
                 'Line chart of monthly rainfall over the Ogun catchment, 2019–2024, rising each wet season and near zero in the dry season.'),
    '03': figure('03', 'bar', s3, s3_lab, 'mm', 'Rainfall minus evapotranspiration, Upper Ouémé, mm per year', ('2018', '2024'),
                 'Bar chart of yearly rainfall minus evapotranspiration over the Upper Ouémé, 2018–2024: ' + ', '.join(f'{y} {v:.0f} mm' for y, v in zip(s3_lab, s3)) + '.'),
    '04': figure('04', 'line', s4, s4_lab, 'mm', 'Water storage anomaly from GRACE and GRACE-FO, mm', ('2002', '2026'),
                 f'Line chart of the Lake Chad basin total water storage anomaly, 2002–2026, from {min(v for _, v in s4):.0f} to {max(v for _, v in s4):.0f} mm, with a gap between the two missions.', zero=True, dec=1),
}
# Lagos: the audited headline, drawn as a range on a °C axis (0–2 °C)
sx = lambda c: 1 + c / 2.0 * (W - 2)
FIG['05'] = f'''<figure class="fx fx-05">
            <div class="fx-plot"><svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label="Range of the heat gap between built-up residents beyond and within 300 metres of vegetation: 1.4 degrees Celsius in the main comparison, 0.4 to 1.7 across the checks.">
              <line class="fx-axis" x1="0" x2="{W}" y1="30" y2="30"/>
              {''.join(f'<line class="fx-tick" x1="{sx(c):.1f}" x2="{sx(c):.1f}" y1="26" y2="34"/>' for c in (0, 0.5, 1, 1.5, 2))}
              <rect class="fx-range" x="{sx(0.4):.1f}" y="24" width="{sx(1.7) - sx(0.4):.1f}" height="12"/>
              <line class="fx-mark" x1="{sx(1.4):.1f}" x2="{sx(1.4):.1f}" y1="16" y2="44"/>
            </svg></div>
            <figcaption class="meta"><span>0 °C</span><span class="fx-cap">Extra surface heat beyond 300 m of vegetation: <b>1.4 °C</b> (0.4–1.7)</span><span>2 °C</span></figcaption>
          </figure>'''

S = [
    ('01', 'hydrology', 'Observational-Hydrology-Extremes', 'Hydrological extremes where the gauges are missing',
     'Floods, drought and future extreme rainfall in two Nigerian basins with few rain gauges, mapped from satellite radar, rainfall records and climate models, and each result checked against independent data.',
     [('Place', 'Sokoto–Rima basin and Lower Niger–Benue, Nigeria'), ('Data', 'Sentinel-1, Sentinel-2, CHIRPS, MODIS, NEX-GDDP CMIP6'), ('Themes', 'Floods · Drought · Climate change'), ('Period', '1985–2070')],
     'Map of Nigeria and its neighbours showing the two study areas: the Sokoto–Rima basin in the north-west and the Lower Niger–Benue reach near Lokoja, each divided into 0.25 degree grid cells.'),
    ('02', 'ogun', 'Ogun-Catchment-Coast-Observatory', 'Ogun Catchment-to-Coast Observatory',
     'Follows water from the headwaters of the Ogun River to the Lagos Lagoon: rainfall, soil moisture, radar-mapped flooding and estuary turbidity for each sub-basin, month by month.',
     [('Place', 'Ogun River catchment, Nigeria'), ('Data', 'Sentinel-1, Sentinel-2, CHIRPS, ERA5-Land, JRC Global Surface Water'), ('Themes', 'Catchment monitoring · Floods · Water quality'), ('Period', '2019–2024')],
     'Map of the Ogun River catchment from the Shaki area to Lagos, divided into its sub-basins, with the lagoon estuary zone at the coast and the towns of Shaki, Oyo, Ibadan, Abeokuta and Lagos marked.'),
    ('03', 'oueme', 'Oueme-Ogun-Groundwater-Recharge', 'Testing a satellite water balance for groundwater recharge',
     'Can satellite rainfall and evapotranspiration estimate groundwater recharge where wells are scarce? A water balance for two basins in Benin and Nigeria, tested against river flow and published recharge.',
     [('Place', 'Upper Ouémé, Benin · Upper Ogun, Nigeria'), ('Data', 'CHIRPS v2 and v3, TAMSAT, WaPOR v3, gauge at Bétérou'), ('Themes', 'Groundwater · Water balance · Uncertainty'), ('Period', '2018–2024')],
     'Map of the Upper Ouémé catchment in Benin and the Upper Ogun catchment in Nigeria, each divided into 5 km rainfall grid cells, with the Bétérou river gauge marked.'),
    ('04', 'gravimetry', 'Groundwater-Storage-Gravimetry', 'Water storage in the Lake Chad basin from GRACE and GRACE-FO',
     'How much water the Lake Chad basin has gained or lost since 2002, measured from changes in Earth’s gravity, and how much of that change is groundwater once soil water is removed.',
     [('Place', 'Lake Chad basin, Central Africa'), ('Data', 'GRACE, GRACE-FO, GLDAS'), ('Themes', 'Groundwater · Drought · Transboundary water'), ('Period', '2002–2026')],
     'Map of the Lake Chad basin across Niger, Nigeria, Chad, Cameroon and the Central African Republic, overlaid with the one-degree GRACE grid cells used in the study.'),
    ('05', 'lagos', 'Lagos-Urban-Heat-Analytics', 'Urban heat island and distance to vegetation in Lagos State',
     'Do residents who live far from vegetation face more surface heat? Land surface temperature from Landsat, set against where people live across Lagos State.',
     [('Place', 'Lagos State, Nigeria'), ('Data', 'Landsat, WorldPop'), ('Themes', 'Urban climate · Heat · Exposure'), ('Period', '2020–2024')],
     'Map of Lagos State divided into its 20 local government areas, with Badagry, Ikeja, Ikorodu, Lagos Island, Lekki and Epe marked.'),
]

rows = []
for n, img, repo, title, desc, meta, alt in S:
    dl = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in meta)
    rows.append(f'''      <article class="inset reveal" data-n="{n}" aria-labelledby="t{n}">
        <div class="inset-text">
          <p class="inset-n meta"><span class="sw-dot" aria-hidden="true"></span>Inset {n}</p>
          <h3 id="t{n}"><a class="inset-link" href="{B}{repo}/" rel="noopener">{title}</a></h3>
          <p class="inset-desc">{desc}</p>
          <dl class="inset-meta">{dl}</dl>
          {FIG[n]}
          <p class="inset-actions"><span class="open" aria-hidden="true">Open the study <span class="arrow">↗</span></span><a class="source" href="{G}{repo}" rel="noopener" aria-label="Source code for {title} on GitHub">Source <span aria-hidden="true">↗</span></a></p>
        </div>
        <div class="inset-media"><img src="assets/projects/{img}-1200.webp" srcset="{"assets/projects/" + img + "-1600.webp 1600w, " if img != "hydrology" else ""}assets/projects/{img}-1200.webp 1200w, assets/projects/{img}-720.webp 720w" sizes="(min-width: 960px) 58vw, 92vw" width="1200" height="900" loading="lazy" decoding="async" alt="{alt}"></div>
      </article>''')

section = f'''<section class="insets" aria-labelledby="insets-title"><div class="wrap">
    <div class="insets-head"><h2 id="insets-title">Insets</h2><p class="meta">Five studies · each opens as a live application, with its code on GitHub</p></div>
    <div class="inset-list">
{chr(10).join(rows)}
    </div>
  </div></section>'''

s = open(P).read()
s = re.sub(r'<section class="insets".*?</section>', lambda m: section, s, count=1, flags=re.S)
# footprint outlines can draw themselves
s = re.sub(r'<path class="fp-line" d=', '<path class="fp-line" pathLength="1" d=', s)
open(P, 'w').write(s)
print('ok', len(s) // 1024, 'KB')
