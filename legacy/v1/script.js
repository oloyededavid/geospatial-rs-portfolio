const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const loader = $(".loader");
window.addEventListener("load", () => {
  window.setTimeout(() => loader?.classList.add("done"), 850);
});

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

const header = $("#siteHeader");
const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile navigation: the header stays fixed while the menu opens beneath it.
const menuToggle = $(".menu-toggle");
const mobileNav = $("#mobileNav");
const mobileNavLinks = $$("#mobileNav a");
const setMobileNav = (open) => {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  mobileNav.setAttribute("aria-hidden", String(!open));
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
};
menuToggle?.addEventListener("click", () => setMobileNav(menuToggle.getAttribute("aria-expanded") !== "true"));
mobileNavLinks.forEach(link => link.addEventListener("click", () => setMobileNav(false)));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") setMobileNav(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) setMobileNav(false);
});

const root = document.documentElement;
const themeToggle = $(".theme-toggle");
const themeIcon = $(".theme-icon");
const savedTheme = localStorage.getItem("david-theme-v11");
if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;
function syncThemeControl() {
  const dark = root.dataset.theme === "dark";
  if (themeIcon) themeIcon.textContent = dark ? "☼" : "◐";
  themeToggle?.setAttribute("aria-pressed", String(dark));
}
syncThemeControl();
themeToggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("david-theme-v11", next);
  syncThemeControl();
});


// Hero spatial field: an animated, randomized network of moving points and soft orbital paths.
const heroCanvas = document.getElementById("heroCanvas");
if (heroCanvas) {
  const ctx = heroCanvas.getContext("2d");
  const visual = heroCanvas.parentElement;
  let points = [];
  let raf = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mouse = { x: 0.5, y: 0.5, active: false };
  const countFor = () => window.innerWidth < 560 ? 22 : window.innerWidth < 900 ? 32 : 46;
  const reset = () => {
    const rect = visual.getBoundingClientRect();
    heroCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    heroCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    heroCanvas.style.width = rect.width + "px";
    heroCanvas.style.height = rect.height + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    points = Array.from({length: countFor()}, (_, i) => ({
      x: rect.width * (.15 + Math.random()*.72), y: rect.height * (.12 + Math.random()*.72),
      vx: (Math.random()-.5)*.16, vy: (Math.random()-.5)*.12, r: Math.random()*2.2+1.1,
      phase: Math.random()*Math.PI*2, speed: .003 + Math.random()*.006, accent: i % 5 === 0
    }));
  };
  const draw = (t) => {
    if (reduceMotion.matches) return;
    const w = heroCanvas.clientWidth, h = heroCanvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#8ea25b";
    const text = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#11120f";
    const muted = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#4d4f4a";
    const cx = w*.62 + Math.sin(t*.00025)*20, cy = h*.49 + Math.cos(t*.00022)*18;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(-.14);
    [1,.76,.54,.33].forEach((s,idx)=>{ ctx.beginPath(); ctx.ellipse(0,0,w*.31*s,h*.29*s,0,0,Math.PI*2); ctx.strokeStyle=idx===0?accent:muted; ctx.globalAlpha=idx===0?.34:.13; ctx.lineWidth=idx===0?1.2:1; ctx.stroke(); });
    ctx.restore();
    points.forEach(p=>{ p.x += p.vx + Math.sin(t*p.speed+p.phase)*.035; p.y += p.vy + Math.cos(t*p.speed+p.phase)*.025; if(p.x<w*.08||p.x>w*.94)p.vx*=-1; if(p.y<h*.08||p.y>h*.9)p.vy*=-1; if(mouse.active){const dx=p.x-w*mouse.x,dy=p.y-h*mouse.y,d=Math.hypot(dx,dy); if(d<140){p.x+=dx*.0008;p.y+=dy*.0008;}} });
    for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++){ const a=points[i],b=points[j],d=Math.hypot(a.x-b.x,a.y-b.y); if(d<120){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=accent;ctx.globalAlpha=(1-d/120)*.12;ctx.lineWidth=1;ctx.stroke();} }
    points.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.accent?accent:text;ctx.globalAlpha=p.accent?.8:.28;ctx.fill();});
    const scan=(t*.045)%(h+80)-40; const g=ctx.createLinearGradient(0,scan-20,w,scan+20); g.addColorStop(0,"transparent");g.addColorStop(.5,accent);g.addColorStop(1,"transparent");ctx.strokeStyle=g;ctx.globalAlpha=.12;ctx.beginPath();ctx.moveTo(w*.08,scan);ctx.lineTo(w*.92,scan);ctx.stroke();ctx.globalAlpha=1;
    raf=requestAnimationFrame(draw);
  };
  const resize=()=>reset(); reset(); window.addEventListener("resize",resize,{passive:true});
  visual.addEventListener("pointermove",e=>{const r=visual.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width;mouse.y=(e.clientY-r.top)/r.height;mouse.active=true;},{passive:true});
  visual.addEventListener("pointerleave",()=>mouse.active=false,{passive:true});
  raf=requestAnimationFrame(draw);
}

// Reveal motion.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("in");
  });
}, { threshold: 0.12 });
$$([".project-card", ".fact-inner", ".credential-block", ".intro-content", ".section-heading"].join(",")).forEach(el => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});


// About reading mode: the statement gradually resolves word-by-word as the visitor scrolls through it.
// It stays quiet and editorial so the existing layout remains the focus.
const aboutSection = document.getElementById("about");
const aboutCopy = aboutSection?.querySelector(".about-wide");
if (aboutSection && aboutCopy) {
  const paragraphs = $$('p', aboutCopy);
  paragraphs.forEach((paragraph) => {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const text = node.nodeValue || "";
      if (!text.trim()) return;
      const fragment = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      parts.forEach((part) => {
        if (/\s+/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else if (part) {
          const span = document.createElement("span");
          span.className = "about-word";
          span.textContent = part;
          fragment.appendChild(span);
        }
      });
      node.parentNode?.replaceChild(fragment, node);
    });
  });

  const words = $$('.about-word', aboutCopy);
  const updateAboutReading = () => {
    if (reduceMotion.matches) {
      words.forEach(word => word.classList.add("is-read"));
      return;
    }
    const rect = aboutSection.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.max(0, Math.min(1, (vh * 0.82 - rect.top) / (vh * 0.72)));
    const eased = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const activeCount = Math.round(eased * words.length);
    words.forEach((word, index) => word.classList.toggle("is-read", index < activeCount));
  };
  let aboutTick = false;
  const requestAboutUpdate = () => {
    if (aboutTick) return;
    aboutTick = true;
    requestAnimationFrame(() => {
      aboutTick = false;
      updateAboutReading();
    });
  };
  updateAboutReading();
  window.addEventListener("scroll", requestAboutUpdate, { passive: true });
  window.addEventListener("resize", requestAboutUpdate, { passive: true });
  aboutSection.classList.add("about-reading");
}

// Active section navigation.
const navLinks = $$("[data-nav-link]");
const navTargets = navLinks.map(a => document.getElementById(a.dataset.navLink)).filter(Boolean);
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle("active", a.dataset.navLink === entry.target.id));
  });
}, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
navTargets.forEach(section => navObserver.observe(section));

// Automatically focus each study-area map as its card reaches the viewport.
const mapObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.target.classList.toggle("map-active", entry.isIntersecting && entry.intersectionRatio > 0.35);
  });
}, { threshold: [0.35, 0.55], rootMargin: "-10% 0px -10% 0px" });
$$('.project-card').forEach(card => mapObserver.observe(card));

// Subtle pointer parallax on maps.
$$('.project-card').forEach(card => {
  const map = $("iframe", card);
  card.addEventListener("mousemove", event => {
    if (reduceMotion.matches || !map) return;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 4;
    map.style.transform = `scale(1.22) translate(${x}px, ${y}px)`;
  });
  card.addEventListener("mouseleave", () => { if (map) map.style.transform = ""; });
});

// Random climate facts: intentionally no carousel arrows or automatic rotation.
const facts = [
  [
    "The ocean absorbs most of the excess heat added to Earth's climate system by human activities.",
    "https://climate.nasa.gov/vital-signs/ocean-warming/"
  ],
  [
    "Carbon dioxide is a heat-trapping gas whose atmospheric concentration has risen substantially since the industrial era.",
    "https://climate.nasa.gov/vital-signs/carbon-dioxide/"
  ],
  [
    "Global average surface temperature is a key indicator scientists use to track long-term climate change.",
    "https://climate.nasa.gov/vital-signs/global-temperature/"
  ],
  [
    "Sea level responds to both warming seawater and the addition of water from melting land ice.",
    "https://climate.nasa.gov/vital-signs/sea-level/"
  ],
  [
    "Satellite observations let scientists monitor land, oceans, ice and atmosphere across large areas repeatedly.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Landsat provides one of the longest continuous satellite records of Earth's changing land surface.",
    "https://www.usgs.gov/landsat-missions/landsat-mission"
  ],
  [
    "Urban heat islands form when built surfaces absorb and re-emit more heat than many natural surfaces.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Trees and vegetation can cool urban areas by providing shade and releasing water through evapotranspiration.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Wetlands can store water, slow flows and provide habitat, making them valuable components of resilient landscapes.",
    "https://www.epa.gov/wetlands"
  ],
  [
    "Ocean acidification is driven largely by the ocean absorbing carbon dioxide from the atmosphere.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification"
  ],
  [
    "Warmer oceans can contribute to coral bleaching and other stresses on marine ecosystems.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Climate change can alter the timing and intensity of rainfall, affecting water and flood risk in many places.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "The water cycle links evaporation, condensation, precipitation, runoff, infiltration and storage across Earth's systems.",
    "https://www.usgs.gov/special-topics/water-science-school/science/water-cycle"
  ],
  [
    "Groundwater is water stored below the land surface in soil and rock formations.",
    "https://www.usgs.gov/special-topics/water-science-school/science/groundwater"
  ],
  [
    "Remote sensing can reveal environmental change in places that are difficult or costly to survey continuously on the ground.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Vegetation indices from satellite imagery can help researchers monitor changes in plant cover and condition.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Radar satellites can collect observations through clouds and can work day or night, supporting flood monitoring.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Thermal satellite data can help map differences in land-surface temperature across cities and landscapes.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Changes in land cover can modify how much solar energy is absorbed, reflected or stored at the surface.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Forests influence climate through carbon storage, water cycling, energy exchange and ecosystem processes.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Snow and ice reflect a large share of incoming sunlight, so their loss can change how much energy Earth absorbs.",
    "https://climate.nasa.gov/vital-signs/ice-sheets/"
  ],
  [
    "Land ice loss contributes to rising sea level because it adds water to the ocean.",
    "https://climate.nasa.gov/vital-signs/ice-sheets/"
  ],
  [
    "Thermal expansion of seawater is one contributor to global sea-level rise as the ocean warms.",
    "https://climate.nasa.gov/vital-signs/sea-level/"
  ],
  [
    "Coastlines naturally move as waves, currents, sediment supply and sea level interact over time.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts"
  ],
  [
    "Mangroves can reduce coastal exposure to waves and provide habitat while storing carbon in biomass and sediments.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts"
  ],
  [
    "Coral reefs support diverse marine life and are sensitive to changes in ocean temperature and chemistry.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts"
  ],
  [
    "Drought is not only about rainfall; temperature, evaporation, soil moisture and water demand also matter.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/drought"
  ],
  [
    "Flood risk depends on both the hazard itself and the people, infrastructure and assets exposed to it.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Topography strongly influences where water accumulates and how runoff moves across a landscape.",
    "https://www.usgs.gov/special-topics/water-science-school/science/runoff-surface-water"
  ],
  [
    "Soil can store water and release it gradually to plants, streams and groundwater.",
    "https://www.usgs.gov/special-topics/water-science-school/science/soil-water"
  ],
  [
    "Impervious surfaces such as roads and roofs generally reduce infiltration and can increase rapid surface runoff.",
    "https://www.epa.gov/green-infrastructure"
  ],
  [
    "Green infrastructure can use vegetation, soil and natural processes to manage stormwater closer to where rain falls.",
    "https://www.epa.gov/green-infrastructure"
  ],
  [
    "Urban trees can reduce surface temperatures by shading pavements and buildings.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Cool roofs can reduce heat absorption by reflecting more incoming solar energy than darker roofs.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Parks and connected green spaces can create cooler local environments within otherwise built-up areas.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Night-time urban heat can remain elevated because buildings and paved surfaces release stored heat after sunset.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Heat exposure is shaped by temperature, humidity, shade, wind and the characteristics of the built environment.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Climate records become more informative when observations are compared across long time periods rather than single days.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/climate"
  ],
  [
    "Weather describes short-term atmospheric conditions, while climate describes patterns over longer periods.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/weather-vs-climate"
  ],
  [
    "Atmospheric water vapour is a greenhouse gas and also responds strongly to changes in temperature and circulation.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Clouds affect Earth's energy balance by interacting with both incoming sunlight and outgoing heat.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/clouds"
  ],
  [
    "Aerosols can influence climate by scattering or absorbing sunlight and by affecting cloud formation.",
    "https://www.noaa.gov/education/resource-collections/atmosphere/aerosols"
  ],
  [
    "Volcanic eruptions can temporarily affect climate by placing reflective particles and gases into the atmosphere.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/volcanoes"
  ],
  [
    "Oceans move heat around the planet through large-scale currents and circulation.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-currents"
  ],
  [
    "Sea-surface temperature observations help scientists study storms, marine ecosystems and ocean circulation.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts"
  ],
  [
    "El Niño and La Niña are large-scale climate patterns that can shift rainfall and temperature patterns around the world.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/el-nino"
  ],
  [
    "Climate variability can occur naturally, while the long-term warming trend is strongly influenced by human greenhouse-gas emissions.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Carbon moves among the atmosphere, oceans, vegetation, soils and rocks through the global carbon cycle.",
    "https://www.noaa.gov/education/resource-collections/climate/carbon-cycle"
  ],
  [
    "Soils contain carbon and can either store carbon or release it depending on land use and environmental conditions.",
    "https://www.noaa.gov/education/resource-collections/climate/carbon-cycle"
  ],
  [
    "Deforestation can change carbon storage, surface energy balance, water cycling and habitat at the same time.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Reforestation and ecosystem restoration can improve carbon storage while also supporting biodiversity and water regulation.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Satellite imagery can detect changes in forest extent and structure over large regions through repeated observations.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Change detection compares observations from different dates to identify where a landscape has changed.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Spatial resolution describes the ground area represented by a pixel in an image.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Spectral information helps remote-sensing systems distinguish materials by how they interact with different wavelengths.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Multispectral imagery records information in several wavelength bands, supporting land-cover and environmental analysis.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "A digital elevation model can represent terrain and support analysis of slope, drainage and watershed structure.",
    "https://www.usgs.gov/3d-elevation-program"
  ],
  [
    "Elevation data can help identify low-lying areas that may be more exposed to flooding.",
    "https://www.usgs.gov/special-topics/water-science-school/science/runoff-surface-water"
  ],
  [
    "Watersheds are areas of land where water drains toward a common outlet.",
    "https://www.usgs.gov/special-topics/water-science-school/science/watersheds"
  ],
  [
    "Healthy watersheds connect uplands, streams, wetlands and downstream receiving waters.",
    "https://www.epa.gov/watersheds"
  ],
  [
    "Wetland soils are often shaped by prolonged or seasonal saturation and support distinctive ecosystems.",
    "https://www.epa.gov/wetlands"
  ],
  [
    "Wetlands can trap sediments and nutrients before they move farther downstream.",
    "https://www.epa.gov/wetlands"
  ],
  [
    "Floodplains are natural parts of river systems where water can spread during high flows.",
    "https://www.usgs.gov/special-topics/water-science-school/science/floods"
  ],
  [
    "Mapping flood extent after an event can support damage assessment, recovery and future risk planning.",
    "https://earthdata.nasa.gov/learn/find-data/near-real-time"
  ],
  [
    "Near-real-time Earth observations can help agencies monitor hazards while events are unfolding.",
    "https://earthdata.nasa.gov/learn/find-data/near-real-time"
  ],
  [
    "Satellites can provide consistent observations across national borders, helping environmental monitoring at regional scale.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Cloud cover can limit optical satellite observations, which is one reason radar data is useful for some applications.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Radar backscatter changes with surface roughness, moisture and structure, making SAR useful for environmental mapping.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Soil moisture affects plant growth, runoff and the exchange of water between land and atmosphere.",
    "https://www.usgs.gov/special-topics/water-science-school/science/soil-water"
  ],
  [
    "Evaporation transfers water from land and water surfaces into the atmosphere.",
    "https://www.usgs.gov/special-topics/water-science-school/science/evaporation-and-water-cycle"
  ],
  [
    "Transpiration is the release of water vapour from plants and is a major part of land-atmosphere water exchange.",
    "https://www.usgs.gov/special-topics/water-science-school/science/evapotranspiration"
  ],
  [
    "Evapotranspiration links vegetation, soil moisture, atmospheric demand and surface energy.",
    "https://www.usgs.gov/special-topics/water-science-school/science/evapotranspiration"
  ],
  [
    "Rainfall intensity can influence whether water infiltrates soil or becomes rapid surface runoff.",
    "https://www.usgs.gov/special-topics/water-science-school/science/runoff-surface-water"
  ],
  [
    "Land-use change can alter drainage patterns, runoff rates and the amount of water reaching streams.",
    "https://www.usgs.gov/special-topics/water-science-school/science/runoff-surface-water"
  ],
  [
    "Urban growth can replace permeable land with surfaces that change how rainfall moves through a catchment.",
    "https://www.epa.gov/green-infrastructure"
  ],
  [
    "Remote sensing can help compare urban growth with changes in vegetation, surface temperature and water features.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Long satellite records make it possible to study gradual landscape change as well as sudden events.",
    "https://www.usgs.gov/landsat-missions/landsat-mission"
  ],
  [
    "Landsat observations support studies of agriculture, forests, water, urban growth and natural hazards.",
    "https://www.usgs.gov/landsat-missions/landsat-mission"
  ],
  [
    "Satellite data can be combined with field observations to improve interpretation and validate spatial patterns.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Ground observations provide detailed local context that satellite imagery alone cannot always capture.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Geospatial analysis turns observations tied to location into maps, measurements and spatial relationships.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "A map is more useful for decision-making when its scale, resolution and uncertainty match the question being asked.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Environmental patterns often vary across space, so location is a core part of interpreting Earth-system data.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Climate impacts are not distributed evenly; local exposure and vulnerability can differ sharply within the same region.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Two places with similar hazards can face different consequences because their infrastructure and populations differ.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Climate adaptation often works best when physical hazards are considered alongside social and spatial conditions.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Urban form influences wind, shade, surface temperature and how people experience heat at street level.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Buildings, roads and other infrastructure can amplify heat exposure where vegetation and shade are limited.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Street trees can provide shade that reduces the amount of solar radiation reaching pavement and people.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Vegetated roofs can help moderate roof temperatures and reduce heat transfer into buildings.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Water bodies can create localized cooling through their thermal and evaporative properties.",
    "https://www.epa.gov/heatislands"
  ],
  [
    "Coastal flooding can be influenced by tides, storm surge, waves, rainfall, river discharge and sea level.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts"
  ],
  [
    "Storm surge is a temporary rise in coastal water level driven mainly by a storm's winds and pressure.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/storm-surge"
  ],
  [
    "Early warning systems become more useful when hazard observations are converted into clear, location-specific information.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Climate observations help distinguish long-term trends from short-lived weather events.",
    "https://www.noaa.gov/education/resource-collections/weather-atmosphere/climate"
  ],
  [
    "The atmosphere and ocean are tightly connected through exchanges of heat, moisture and momentum.",
    "https://www.noaa.gov/education/resource-collections/ocean-coasts"
  ],
  [
    "Ocean warming can contribute to changes in marine habitat, species ranges and ecosystem conditions.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Melting glaciers and ice sheets are monitored with a combination of satellites, aircraft and ground observations.",
    "https://climate.nasa.gov/vital-signs/ice-sheets/"
  ],
  [
    "Sea-level measurements combine satellite observations with long-running measurements from tide gauges.",
    "https://climate.nasa.gov/vital-signs/sea-level/"
  ],
  [
    "Climate science relies on many observing systems because no single measurement can describe the whole Earth system.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Satellite missions can revisit the same locations repeatedly, making them powerful for monitoring change through time.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Earth observation data can support planning before a hazard, response during an event and assessment afterward.",
    "https://earthdata.nasa.gov/learn/find-data/near-real-time"
  ],
  [
    "Aerial and satellite imagery can reveal patterns that are difficult to see from ground level alone.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Maps can turn complex environmental datasets into spatial evidence that planners and communities can act on.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Climate adaptation can include changes to infrastructure, ecosystems, planning and emergency preparedness.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Restoring natural systems can sometimes provide both environmental benefits and protection from climate-related hazards.",
    "https://www.epa.gov/wetlands"
  ],
  [
    "Healthy wetlands can reduce flood peaks by storing water and slowing its movement through a landscape.",
    "https://www.epa.gov/wetlands"
  ],
  [
    "Flood risk mapping is stronger when terrain, water flow, land cover and exposed assets are considered together.",
    "https://www.usgs.gov/special-topics/water-science-school/science/floods"
  ],
  [
    "Environmental monitoring becomes more powerful when observations are repeated using consistent methods and locations.",
    "https://www.usgs.gov/landsat-missions/landsat-mission"
  ],
  [
    "Open Earth-observation archives make it possible to investigate environmental change across decades rather than isolated snapshots.",
    "https://www.usgs.gov/landsat-missions/landsat-mission"
  ],
  [
    "The same landscape can look different across visible, infrared and radar wavelengths because surfaces interact differently with energy.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Healthy environmental decisions often depend on seeing where change is happening, not only how much change is occurring.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Spatial context can reveal clusters, corridors and hotspots that are hidden when environmental data is viewed only as a table.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Remote sensing is most useful when the sensor, spatial scale and timing are matched to the environmental question.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ],
  [
    "Climate-related decisions benefit from combining observations, models and local knowledge rather than relying on one source alone.",
    "https://www.noaa.gov/education/resource-collections/climate/climate-change-impacts"
  ],
  [
    "Earth observation is fundamentally about measuring the planet's changing conditions from a distance and interpreting those measurements in context.",
    "https://earthdata.nasa.gov/learn/backgrounders/remote-sensing"
  ]
];
const factText = $("#climateFact");
const factSource = $("#climateSource");
const randomFact = $(".random-fact");
const copyFact = $(".copy-fact");
const copyLabel = $(".copy-label");

function resetCopyState() {
  copyFact?.classList.remove("is-copied");
  if (copyLabel) copyLabel.textContent = "Copy";
  copyFact?.setAttribute("aria-label", "Copy the current climate fact");
}

function animateFactChange() {
  factText?.closest(".fact-line")?.classList.remove("is-changing");
  randomFact?.classList.remove("is-generating");
  // Force a fresh animation cycle without affecting layout.
  void factText?.offsetWidth;
  factText?.closest(".fact-line")?.classList.add("is-changing");
  randomFact?.classList.add("is-generating");
  window.setTimeout(() => {
    factText?.closest(".fact-line")?.classList.remove("is-changing");
    randomFact?.classList.remove("is-generating");
  }, 720);
}

function fitMobileFact() {
  if (!factText || !factText.closest(".fact-line")) return;
  const line = factText.closest(".fact-line");
  if (window.innerWidth > 560) {
    line.style.removeProperty("--fact-mobile-size");
    return;
  }
  let size = 20;
  line.style.setProperty("--fact-mobile-size", `${size}px`);
  const lineHeight = parseFloat(getComputedStyle(line).lineHeight) || size * 1.18;
  while (line.scrollHeight > lineHeight * 2.05 && size > 15) {
    size -= .5;
    line.style.setProperty("--fact-mobile-size", `${size}px`);
  }
}

function randomiseFact() {
  if (!facts.length) return;
  let next = Math.floor(Math.random() * facts.length);
  const current = factText?.textContent;
  if (facts.length > 1 && facts[next][0] === current) next = (next + 1) % facts.length;
  if (factText) factText.textContent = facts[next][0];
  if (factSource) {
    factSource.href = facts[next][1];
    factSource.textContent = "Source ↗";
  }
  resetCopyState();
  requestAnimationFrame(fitMobileFact);
  animateFactChange();
}
randomiseFact();
window.addEventListener("resize", fitMobileFact, { passive: true });
randomFact?.addEventListener("click", randomiseFact);

// Copy the current fact and keep the CTA in a clear Copied state until a new fact is generated.
copyFact?.addEventListener("click", async () => {
  const text = factText?.textContent?.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyFact.classList.add("is-copied");
    if (copyLabel) copyLabel.textContent = "Copied";
    copyFact.setAttribute("aria-label", "Climate fact copied");
  } catch {
    if (copyLabel) copyLabel.textContent = "Try again";
    window.setTimeout(resetCopyState, 1600);
  }
});
