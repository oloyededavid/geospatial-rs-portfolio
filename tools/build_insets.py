"""Build the Insets section: one study per row. Tags, title, one line, one call to action with the years, and the cover."""
import re
P = '/home/user/oloyededavid/geospatial-rs-portfolio/index.html'
B = 'https://oloyededavid.github.io/'

# Tags use the wording of the Erasmus Mundus programmes in water and Earth observation
# WAVES, GroundwatCH, Copernicus Master in Digital Earth, Flood Risk Management, GEM, Applied Ecohydrology.
S = [
    ('01', 'hydrology', 'Observational-Hydrology-Extremes', 'Hydrological extremes where the gauges are missing: floods, droughts and design rainfall in Nigeria, 1985–2070',
     'Where rain gauges are scarce, satellite radar, long rainfall records and climate models fill the gap, and each result is checked against independent data.',
     '1985–2070', ['Flood risk', 'Satellite hydrology', 'Climate change', 'Earth observation'],
     'Map of Nigeria and its neighbours showing the two study areas: the Sokoto–Rima basin in the north-west and the Lower Niger–Benue reach near Lokoja, each divided into 0.25 degree grid cells.'),
    ('02', 'ogun', 'Ogun-Catchment-Coast-Observatory', 'Surface water from headwaters to lagoon: rainfall, soil moisture and flooding, 2019–2024',
     'How rain turns into soil moisture, flooding and murky water along one river, followed month by month with radar and optical satellites.',
     '2019–2024', ['Earth observation', 'Integrated water management', 'Water quality', 'Geovisualisation'],
     'Map of the Ogun River catchment from the Shaki area to Lagos, divided into its sub-basins, with the lagoon estuary zone at the coast and the towns of Shaki, Oyo, Ibadan, Abeokuta and Lagos marked.'),
    ('03', 'oueme', 'Oueme-Ogun-Groundwater-Recharge', 'Testing a satellite water balance for groundwater recharge in tropical basement catchments, 2018–2024',
     'Can satellite rainfall and evapotranspiration estimate groundwater recharge where wells are scarce? Tested on two basins in Benin and Nigeria.',
     '2018–2024', ['Groundwater', 'Hydrological modelling', 'Water balance', 'Satellite hydrology'],
     'Map of the Upper Ouémé catchment in Benin and the Upper Ogun catchment in Nigeria, each divided into 5 km rainfall grid cells, with the Bétérou river gauge marked.'),
    ('04', 'gravimetry', 'Groundwater-Storage-Gravimetry', 'Water storage in the Lake Chad basin from GRACE and GRACE-FO, 2002–2026',
     'How much water the Lake Chad basin has gained or lost since 2002, measured from changes in Earth’s gravity, and how much of it is groundwater.',
     '2002–2026', ['Groundwater', 'Global change', 'Earth observation', 'Transboundary water'],
     'Map of the Lake Chad basin across Niger, Nigeria, Chad, Cameroon and the Central African Republic, overlaid with the one-degree GRACE grid cells used in the study.'),
    ('05', 'lagos', 'Lagos-Urban-Heat-Analytics', 'Urban heat island and distance to vegetation in Lagos State, Nigeria, 2020–2024',
     'Do residents who live far from vegetation face more surface heat? Landsat land surface temperature set against where people live.',
     '2020–2024', ['Earth observation', 'Urban heat', 'Geodata science', 'Vulnerability'],
     'Map of Lagos State divided into its 20 local government areas, with Badagry, Ikeja, Ikorodu, Lagos Island, Lekki and Epe marked.'),
]

REEL = {
    '01': ['Study areas', 'Sentinel-1 radar: low flow and flood pulse, 2022', 'Sokoto–Rima drainage and terrain'],
    '02': ['Sub-basins', 'Mean annual rainfall, 2019–2024', 'Riparian vegetation (NDVI)'],
    '03': ['Basins on the 5 km rainfall grid', 'Rainfall minus evapotranspiration, 2018–2024'],
    '04': ['Basin and GRACE cells', 'Storage trend, 2002–2026'],
    '05': ['Twenty local government areas', 'Land cover', 'Population density'],
}
import json, html as _h
rows = []
for n, img, repo, title, desc, years, tags, alt in S:
    tg = ''.join(f'<li style="--k:{i}">{t}</li>' for i, t in enumerate(tags))
    srcset = (f'assets/projects/{img}-1600.webp 1600w, ' if img != 'hydrology' else '') + f'assets/projects/{img}-1200.webp 1200w, assets/projects/{img}-720.webp 720w'
    text = f'''<div class="inset-text">
          <ul class="tags" aria-label="Topics">{tg}</ul>
          <h3 id="t{n}"><a class="inset-link" href="{B}{repo}/" rel="noopener">{title}</a></h3>
          <p class="inset-desc">{desc}</p>
          <p class="inset-actions"><span class="cta" aria-hidden="true">Open the study <span class="arrow">↗</span></span></p>
        </div>'''
    if n == '05':
        text = text.replace('<span class="cta" aria-hidden="true">Open the study <span class="arrow">↗</span></span>', f'<a class="cta" href="{B}{repo}/" rel="noopener" aria-label="Open the study: {title}">Open the study <span class="arrow" aria-hidden="true">↗</span></a>')
        rows.append(f'''      <article class="inset inset--wide reveal" id="study-{n}" data-n="{n}" aria-labelledby="t{n}">
        {text}
        <figure class="lx" aria-label="A short recorded tour of the Lagos explorer: switching between temperature, hot and cold spots, heat and population, vegetation and population, and opening individual local government areas">
          <div class="lx-stage" aria-hidden="true">
            <div class="lx-map"></div>
            <div class="lx-tabs"></div>
            <div class="lx-legend"><p class="lx-lt"></p><span class="lx-ramp"></span><p class="lx-lr"><span class="lx-lo"></span><span class="lx-mid"></span><span class="lx-hi"></span></p></div>
          </div>
          <aside class="lx-panel" aria-hidden="true">
            <p class="lx-k">Local government area</p>
            <p class="lx-sel"></p>
            <h4 class="lx-name"></h4><p class="lx-sub"></p>
            <div class="lx-cards"></div>
          </aside>
          <div class="lx-cursor" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.6L10 19z"/></svg></div>
          <a class="lx-cover" href="{B}{repo}/" rel="noopener"><span>Explore it yourself <span aria-hidden="true">↗</span></span></a>
        </figure>
      </article>''')
        continue
    rows.append(f'''      <article class="inset reveal" id="study-{n}" data-n="{n}" aria-labelledby="t{n}">
        {text}
        <div class="inset-media reel" data-frames="{_h.escape(json.dumps([f'assets/reels/{n}-{k}.webp' for k in range(1, len(REEL[n]))]))}" data-caps="{_h.escape(json.dumps(REEL[n]))}"><img class="frame on" src="assets/projects/{img}-1200.webp" srcset="{srcset}" sizes="(min-width: 960px) 56vw, 92vw" width="1200" height="900" loading="lazy" decoding="async" alt="{alt}"><p class="reel-cap" aria-hidden="true">{REEL[n][0]}</p><div class="reel-bar" aria-hidden="true">{''.join('<i></i>' for _ in REEL[n])}</div></div>
      </article>''')

section = f'''<section class="insets" id="studies" aria-labelledby="insets-title"><div class="wrap">
    <div class="sec-head"><h2 id="insets-title">Studies</h2></div>
    <div class="inset-list">
{chr(10).join(rows)}
    </div>
  </div></section>'''

s = open(P).read()
s = re.sub(r'<section class="insets".*?</section>', lambda m: section, s, count=1, flags=re.S)
s = re.sub(r'<path class="fp-line" d=', '<path class="fp-line" pathLength="1" d=', s)
open(P, 'w').write(s)
print('ok', len(s) // 1024, 'KB')
