"""Write the same cross-site navigation into every study site.

Each study page gets, between marker comments:
  <!-- study-bar:start --> ... <!-- study-bar:end -->   a slim bar at the top: back to the portfolio, study n of 5, previous and next
  <!-- study-nav:start --> ... <!-- study-nav:end -->   at the end of the page: a card for the next study and links to the others
Explorer pages get the bar only. Static HTML and scoped CSS (.sn-), so it works without scripts and cannot clash.
Run from anywhere:  python tools/sync_nav.py
"""
import re, pathlib

HOME = 'https://oloyededavid.github.io/geospatial-rs-portfolio/'
B = 'https://oloyededavid.github.io/'
ROOT = pathlib.Path('/home/user')
S = [  # number, local clone, repo, title, one line, cover, tags
    ('01', 'observational-hydrology-extremes', 'Observational-Hydrology-Extremes', 'Hydrological extremes where the gauges are missing: floods, droughts and design rainfall in Nigeria, 1985–2070',
     'Floods, drought and future extreme rainfall in two Nigerian basins with few rain gauges.', 'hydrology', ['Flood risk', 'Satellite hydrology', 'Climate change']),
    ('02', 'ogun-catchment-coast-observatory', 'Ogun-Catchment-Coast-Observatory', 'Surface water from headwaters to lagoon: rainfall, soil moisture and flooding, 2019–2024',
     'Rainfall, soil moisture, flooding and estuary turbidity along the Ogun River.', 'ogun', ['Earth observation', 'Water management', 'Water quality']),
    ('03', 'oueme-ogun-groundwater-recharge', 'Oueme-Ogun-Groundwater-Recharge', 'Testing a satellite water balance for groundwater recharge in tropical basement catchments, 2018–2024',
     'Can satellite rainfall and evapotranspiration estimate groundwater recharge where wells are scarce?', 'oueme', ['Groundwater', 'Water balance', 'Satellite hydrology']),
    ('04', 'groundwater-storage-gravimetry', 'Groundwater-Storage-Gravimetry', 'Water storage in the Lake Chad basin from GRACE and GRACE-FO, 2002–2026',
     'How much water the Lake Chad basin has gained or lost since 2002, measured from Earth’s gravity.', 'gravimetry', ['Groundwater', 'Global change', 'Earth observation']),
    ('05', 'lagos-urban-heat-analytics', 'Lagos-Urban-Heat-Analytics', 'Urban heat island and distance to vegetation in Lagos State, Nigeria, 2020–2024',
     'Do residents who live far from vegetation face more surface heat?', 'lagos', ['Urban heat', 'Earth observation', 'Vulnerability']),
]
N = len(S)

CSS = '''<style>
.sn-bar{font:400 14px/1.4 'Satoshi',system-ui,-apple-system,'Segoe UI',sans-serif;background:#fff;border-bottom:1px solid #e5e5e1;color:#141412;position:relative;z-index:1000}
.sn-bar .sn-in{max-width:1240px;margin:0 auto;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.sn-bar a{color:#141412;text-decoration:none}.sn-bar a:hover{text-decoration:underline;text-underline-offset:4px}
.sn-home{font-weight:700}.sn-pos{color:#6a6963;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;letter-spacing:.04em}
.sn-pn{display:flex;gap:18px}.sn-pn a{color:#55544e}
.sn-next{font:400 16px/1.5 'Satoshi',system-ui,-apple-system,'Segoe UI',sans-serif;color:#141412;background:#fff;border-top:1px solid #ececea;margin-top:64px}
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
            f'<a class="sn-home" href="{HOME}">← Oloyede David</a><span class="sn-pos">Study {S[i][0]} of {N:02d}</span>'
            f'<span class="sn-pn"><a href="{B}{p[2]}/" title="{p[3]}">Previous</a><a href="{B}{n[2]}/" title="{n[3]}">Next study →</a></span>'
            f'</div></nav><!-- study-bar:end -->')

def nav(i):
    n = S[(i + 1) % N]
    short = n[3].split(':')[0].split(', 20')[0]
    return (f'<!-- study-nav:start --><section class="sn-next" aria-label="Next study"><div class="sn-in">'
            f'<p class="sn-k">Next study</p>'
            f'<a class="sn-card" href="{B}{n[2]}/"><span class="sn-media"><img src="assets/next-study.webp" width="720" height="540" loading="lazy" decoding="async" alt=""></span>'
            f'<span class="sn-t"><b>{short}</b><span>{n[4]}</span></span><span class="sn-arrow" aria-hidden="true">→</span></a>'
            f'<a class="sn-back" href="{HOME}#studies"><span aria-hidden="true">←</span> Back to all studies</a>'
            f'</div></section><!-- study-nav:end -->')

def put(html, key, block, where):
    pat = re.compile(rf'<!-- {key}:start -->.*?<!-- {key}:end -->', re.S)
    if pat.search(html): return pat.sub(lambda m: block, html, count=1)
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
            # copies the study's own page generator re-inserts after a rebuild
            import shutil
            shutil.copyfile(pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'projects' / f'{S[(i + 1) % N][5]}-720.webp', docs / 'assets' / 'next-study.webp')
            (docs / 'assets' / 'study-bar.html').write_text(bar(i) + '\n', encoding='utf-8')
            (docs / 'assets' / 'study-nav.html').write_text(nav(i) + '\n', encoding='utf-8')
        elif page.name in ('explore.html', 'explorer.html'):
            h = put(h, 'study-bar', bar(i), 'top')
        else:
            continue
        page.write_text(h, encoding='utf-8')
        print('updated', page)
