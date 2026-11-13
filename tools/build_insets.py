"""Build the Insets section: one study per row. Tags, title, one line, one call to action with the years, and the cover."""
import re
P = '/home/user/oloyededavid/geospatial-rs-portfolio/index.html'
B = 'https://oloyededavid.github.io/'

# Tags use the wording of the Erasmus Mundus programmes in water and Earth observation
# WAVES, GroundwatCH, Copernicus Master in Digital Earth, Flood Risk Management, GEM, Applied Ecohydrology.
S = [
    ('01', 'hydrology', 'Observational-Hydrology-Extremes', 'Hydrological extremes where the gauges are missing: floods, droughts and design rainfall in Nigeria',
     'Floods, drought and future extreme rainfall in two Nigerian basins with few rain gauges, mapped from satellite radar and climate models.',
     '1985–2070', ['Flood risk', 'Satellite hydrology', 'Climate change', 'Earth observation'],
     'Map of Nigeria and its neighbours showing the two study areas: the Sokoto–Rima basin in the north-west and the Lower Niger–Benue reach near Lokoja, each divided into 0.25 degree grid cells.'),
    ('02', 'ogun', 'Ogun-Catchment-Coast-Observatory', 'Surface water from headwaters to lagoon: rainfall, soil moisture and flooding',
     'Rainfall, soil moisture, flooding and estuary turbidity along the Ogun River, from its headwaters to the Lagos Lagoon.',
     '2019–2024', ['Earth observation', 'Integrated water management', 'Water quality', 'Geovisualisation'],
     'Map of the Ogun River catchment from the Shaki area to Lagos, divided into its sub-basins, with the lagoon estuary zone at the coast and the towns of Shaki, Oyo, Ibadan, Abeokuta and Lagos marked.'),
    ('03', 'oueme', 'Oueme-Ogun-Groundwater-Recharge', 'Testing a satellite water balance for groundwater recharge in tropical basement catchments',
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
    '01': ['Study areas', 'Sentinel-1 radar: low flow and flood pulse, 2022', 'Sokoto–Rima drainage and terrain', 'Explorer: future extreme rainfall'],
    '02': ['Sub-basins', 'Explorer: floodplain inundation', 'Monthly rainfall, soil moisture, radar and turbidity', 'Rain and inundation, tested month by month'],
    '03': ['Basins on the 5 km rainfall grid', 'Rainfall minus evapotranspiration, 2018–2024', 'Explorer: the water balance by basin'],
    '04': ['Basin and GRACE cells', 'Storage trend, 2002–2026', 'Monthly storage anomaly', 'Annual storage anomaly'],
    '05': ['Twenty local government areas', 'Land cover', 'Population density'],
}
import json, html as _h
rows = []
for n, img, repo, title, desc, years, tags, alt in S:
    tg = ''.join(f'<li>{t}</li>' for t in tags)
    srcset = (f'assets/projects/{img}-1600.webp 1600w, ' if img != 'hydrology' else '') + f'assets/projects/{img}-1200.webp 1200w, assets/projects/{img}-720.webp 720w'
    rows.append(f'''      <article class="inset reveal" id="study-{n}" data-n="{n}" aria-labelledby="t{n}">
        <div class="inset-text">
          <ul class="tags" aria-label="Topics">{tg}</ul>
          <h3 id="t{n}"><a class="inset-link" href="{B}{repo}/" rel="noopener">{title}</a></h3>
          <p class="inset-desc">{desc}</p>
          <p class="inset-actions"><span class="cta" aria-hidden="true">Open the study <span class="arrow">↗</span></span><span class="years">{years}</span></p>
        </div>
        <div class="inset-media reel" data-frames="{_h.escape(json.dumps([f'assets/reels/{n}-{k}.webp' for k in range(1, len(REEL[n]))]))}" data-caps="{_h.escape(json.dumps(REEL[n]))}"><img class="frame on" src="assets/projects/{img}-1200.webp" srcset="{srcset}" sizes="(min-width: 960px) 56vw, 92vw" width="1200" height="900" loading="lazy" decoding="async" alt="{alt}"><p class="reel-cap" aria-hidden="true">{REEL[n][0]}</p><div class="reel-bar" aria-hidden="true">{''.join('<i></i>' for _ in REEL[n])}</div></div>
      </article>''')

section = f'''<section class="insets" aria-labelledby="insets-title"><div class="wrap">
    <div class="insets-head"><h2 id="insets-title">Insets</h2><p class="meta">Five studies · each opens as a live application</p></div>
    <div class="inset-list">
{chr(10).join(rows)}
    </div>
  </div></section>'''

s = open(P).read()
s = re.sub(r'<section class="insets".*?</section>', lambda m: section, s, count=1, flags=re.S)
s = re.sub(r'<path class="fp-line" d=', '<path class="fp-line" pathLength="1" d=', s)
open(P, 'w').write(s)
print('ok', len(s) // 1024, 'KB')
