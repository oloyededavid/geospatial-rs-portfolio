"""Write the same cross-site navigation into every study site.

Each study page gets, between marker comments:
  <!-- study-bar:start --> ... <!-- study-bar:end -->   a slim bar at the top: back to the portfolio, study n of N, previous and next
  <!-- study-nav:start --> ... <!-- study-nav:end -->   at the end of the page: a card for the next study and links to the others
  <!-- study-others:start --> ... <!-- study-others:end -->   the "Other studies" line in the footer, where the page has the markers
Explorer pages get the bar only. Static HTML and scoped CSS (.sn-), so it works without scripts and cannot clash.
Run from anywhere:  python tools/sync_nav.py
"""
import re, pathlib

HOME = 'https://oloyededavid.github.io/geospatial-rs-portfolio/'
B = 'https://oloyededavid.github.io/'
ROOT = pathlib.Path('/home/user')
S = [  # number, local clone, repo, title, one line, cover, tags
    ('01', 'observational-hydrology-extremes', 'Observational-Hydrology-Extremes', 'Hydrological extremes where the gauges are missing: floods, droughts and design rainfall in Nigeria, 1950–2070',
     'Floods, drought and future extreme rainfall in two Nigerian basins with few rain gauges.', 'hydrology', ['Floods and drought', 'Satellite hydrology', 'Climate change', 'Earth observation']),
    ('02', 'ogun-catchment-coast-observatory', 'Ogun-Catchment-Coast-Observatory', 'Surface water from headwaters to lagoon: rainfall, soil moisture and flooding, 2019–2024',
     'Rainfall, soil moisture, flooding and estuary turbidity along the Ogun River.', 'ogun', ['Earth observation', 'Integrated water management', 'Turbidity', 'Geovisualisation']),
    ('03', 'oueme-ogun-groundwater-recharge', 'Oueme-Ogun-Groundwater-Recharge', 'Testing a satellite water balance for groundwater recharge in tropical basement catchments, 2018–2024',
     'Can satellite rainfall and evapotranspiration estimate groundwater recharge where wells are scarce?', 'oueme', ['Groundwater', 'Recharge testing', 'Water balance', 'Satellite hydrology']),
    ('04', 'groundwater-storage-gravimetry', 'Groundwater-Storage-Gravimetry', 'Water storage in the Lake Chad basin from GRACE and GRACE-FO, 2002–2026',
     'How much water the Lake Chad basin has gained or lost since 2002, estimated from changes in Earth’s gravity.', 'gravimetry', ['Water storage', 'Global change', 'Earth observation', 'Transboundary water']),
    ('05', 'lagos-urban-heat-analytics', 'Lagos-Urban-Heat-Analytics', 'Urban heat island and distance to vegetation in Lagos State, Nigeria, 2020–2024',
     'Do residents who live far from vegetation face more surface heat?', 'lagos', ['Earth observation', 'Urban heat', 'Geodata science', 'Heat exposure']),
    ('06', 'coastal-hydrogeology-modeling', 'Coastal-Hydrogeology-Modeling', 'Urban sealing and the shallow water table of the Lekki–Epe barrier, Lagos, 1986–2024',
     'How much of the barrier has been sealed since the 1980s, and what that could do to the water table beneath it.', 'coastal', ['Groundwater', 'Urban change', 'Coastal aquifer', 'Scenario modelling']),
    ('07', 'mau-forest-land-cover', 'Mau-Forest-Land-Cover', 'Mapping land cover in the Mau Forest Complex, Kenya, with Sentinel-2, 2025',
     'A Sentinel-2 land-cover map tested with spatially blocked cross-validation; accuracy awaits a labelled reference sample.', 'mau', ['Land cover', 'Machine learning', 'Sentinel-2', 'Spatial validation']),
    ('08', 'mozambique-health-access', 'Mozambique-Health-Access', 'Travel time to health facilities in Mozambique',
     'How district access estimates change with the facility list, mode of travel and facility functionality.', 'mozambique', ['Accessibility', 'Health access', 'Sensitivity analysis', 'Population weighting']),
    ('09', 'open-geodata-catalogue', 'Open-Geodata-Catalogue', 'Serving open research outputs as a STAC catalogue and through OGC API Features',
     'The spatial layers behind the studies in one catalogue, with checksums and an API you can run locally.', 'catalogue', ['Open data', 'STAC', 'OGC API Features', 'PostGIS']),
]
N = len(S)
# the name each study site shows in its own header, used for the "Other studies" line in every footer
SHORT = {'01': 'Nigeria floods, drought and design rainfall', '02': 'Ogun surface water', '03': 'Ouémé–Ogun recharge',
         '04': 'Lake Chad water storage', '05': 'Lagos urban heat', '06': 'Lekki–Epe groundwater',
         '07': 'Mau Forest land cover', '08': 'Mozambique health access', '09': 'Open geodata catalogue'}

CSS = '''<style>
.sn-bar{font:400 14px/1.4 'Range Dash','Satoshi',system-ui,-apple-system,'Segoe UI',sans-serif;background:#fff;border-bottom:1px solid #e5e5e1;color:#141412;position:relative;z-index:1000}
.sn-bar .sn-in{max-width:1240px;margin:0 auto;padding:4px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.sn-bar a{color:#141412;text-decoration:none;display:inline-flex;align-items:center;min-height:32px}.sn-bar a:hover{text-decoration:underline;text-underline-offset:4px}
.sn-home{font-weight:700}.sn-pos{color:#6a6963;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;letter-spacing:.04em}
.sn-pn{display:flex;gap:18px}.sn-pn a{color:#55544e}
.sn-next{font:400 16px/1.5 'Range Dash','Satoshi',system-ui,-apple-system,'Segoe UI',sans-serif;color:#141412;background:#fff;border-top:1px solid #ececea;margin-top:64px}
.sn-next .sn-in{max-width:1080px;margin:0 auto;padding:40px 24px 48px}
.sn-k{font-size:15px;color:#6a6963;margin:0 0 14px}
.sn-card{display:flex;align-items:center;gap:20px;text-decoration:none;color:inherit;background:#fafafa;border:1px solid #ececea;border-radius:22px;padding:14px 18px 14px 14px;transition:border-color .25s,background .25s}
.sn-card:hover{border-color:#d5d5d1;background:#f6f6f5}
.sn-media{flex:none;width:112px;height:84px;border-radius:14px;overflow:hidden;background:#eee}
.sn-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.sn-card:hover .sn-media img{transform:scale(1.05)}
.sn-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.sn-t b{font-weight:500;font-size:clamp(17px,1.8vw,21px);line-height:1.25;letter-spacing:-.005em}
.sn-t span{font-size:15px;color:#62625d}
.sn-arrow{flex:none;width:46px;height:46px;border-radius:50%;border:1px solid #e4e4e0;background:#fff;display:grid;place-items:center;font-size:20px;color:#3a3a37;transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.sn-card:hover .sn-arrow{transform:translateX(3px)}
.sn-back{display:flex;justify-content:center;gap:10px;margin-top:28px;font-size:15px;color:#62625d;text-decoration:none}
.sn-back:hover{color:#141412}
@media (max-width:620px){.sn-media{width:72px;height:72px}.sn-t span{display:none}.sn-pos{display:none}}
@media (prefers-reduced-motion:reduce){.sn-media img,.sn-arrow{transition:none}}
</style>'''

def bar(i):
    p, n = S[(i - 1) % N], S[(i + 1) % N]
    return (f'<!-- study-bar:start -->{CSS}<nav class="sn-bar" aria-label="Portfolio"><div class="sn-in">'
            f'<a class="sn-home" href="{HOME}">← David Oloyede</a><span class="sn-pos">Study {S[i][0]} of {N:02d}</span>'
            f'<span class="sn-pn"><a href="{B}{p[2]}/" title="{p[3]}">Previous</a><a href="{B}{n[2]}/" title="{n[3]}">Next study →</a></span>'
            f'</div></nav><!-- study-bar:end -->')

def nav(i):
    n = S[(i + 1) % N]
    short = re.split(r', (?:19|20)\d\d', n[3].split(':')[0])[0]
    return (f'<!-- study-nav:start --><section class="sn-next" aria-label="Next study"><div class="sn-in">'
            f'<p class="sn-k">Next study</p>'
            f'<a class="sn-card" href="{B}{n[2]}/"><span class="sn-media"><img src="assets/next-study.webp" width="720" height="540" loading="lazy" decoding="async" alt=""></span>'
            f'<span class="sn-t"><b>{short}</b><span>{n[4]}</span></span><span class="sn-arrow" aria-hidden="true">→</span></a>'
            f'<a class="sn-back" href="{HOME}#studies"><span aria-hidden="true">←</span> Back to all studies</a>'
            f'</div></section><!-- study-nav:end -->')

def others(i):
    links = ' · '.join(f'<a href="{B}{s[2]}/">{SHORT[s[0]]}</a>' for j, s in enumerate(S) if j != i)
    return f'<!-- study-others:start --><p class="others">Other studies: {links}</p><!-- study-others:end -->'

def put(html, key, block, where):
    pat = re.compile(rf'<!-- {key}:start -->.*?<!-- {key}:end -->', re.S)
    if pat.search(html): return pat.sub(lambda m: block, html, count=1)
    if where == 'marker':  # only where the page has the markers
        return html
    if where == 'top':
        return re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + '\n' + block, html, count=1)
    return html.replace('</body>', block + '\n</body>', 1)

for i, s in enumerate(S):
    docs = ROOT / s[1] / 'docs'
    for page in sorted(docs.glob('*.html')):
        h = page.read_text(encoding='utf-8')
        if page.name == 'index.html':
            h = put(h, 'study-bar', bar(i), 'top')
            h = put(h, 'study-nav', nav(i), 'end')
            h = put(h, 'study-others', others(i), 'marker')
            # copies the study's own page generator re-inserts after a rebuild
            import shutil
            shutil.copyfile(pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'projects' / f'{S[(i + 1) % N][5]}-720.webp', docs / 'assets' / 'next-study.webp')
            (docs / 'assets' / 'study-bar.html').write_text(bar(i) + '\n', encoding='utf-8')
            (docs / 'assets' / 'study-nav.html').write_text(nav(i) + '\n', encoding='utf-8')
            (docs / 'assets' / 'study-others.html').write_text(others(i) + '\n', encoding='utf-8')
        elif page.name in ('explore.html', 'explorer.html'):
            h = put(h, 'study-bar', bar(i), 'top')
        else:
            continue
        page.write_text(h, encoding='utf-8')
        print('updated', page)
