import React, { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polygon, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageShell from '../components/PageShell';
import Badge from '../components/Badge';
import SectionHeading from '../components/SectionHeading';
import MapboxLayer from '../components/MapboxLayer';
import JourneyPlanner from '../components/JourneyPlanner';
import JourneyMap from '../components/JourneyMap';
import JourneySummary from '../components/JourneySummary';
import {
  ALERT_FEED,
  BLOCKAGES,
  CONVOYS,
  EMERGENCY_PRIORITIES,
  LOCAL_LANGUAGE_ALERTS,
  ROUTE_OPTIONS,
  STATE_STATS,
} from '../data/mockData';
import {
  AlertTriangle,
  CloudRainWind,
  Filter,
  Languages,
  Navigation,
  Search,
  ShieldCheck,
  Siren,
  Truck,
} from 'lucide-react';

const center = [25.9, 92.8];

const neRegionPolygon = [
  [27.95, 88.00], [28.35, 91.30], [28.05, 96.10], [27.20, 97.20],
  [25.90, 97.35], [24.50, 96.20], [23.15, 94.60], [21.95, 92.40],
  [22.45, 89.90], [24.15, 88.00], [25.75, 88.15], [27.95, 88.00],
];

const makeIcon = (kind, tone, glyph) => L.divIcon({
  className: 'atlas-marker',
  html: `
    <div class="marker-hud ${kind}" style="--tone:${tone};">
      <span>${glyph}</span>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const truckIcon = makeIcon('truck', '#38bdf8', '🚛');
const blockageIcon = makeIcon('blockage', '#f87171', '⚠');
const hospitalIcon = makeIcon('hospital', '#ef4444', '✚');

const weatherRiskZones = [
  { pos: [27.15, 92.35], name: 'Landslide watch · Arunachal hills', color: '#fbbf24', radius: 32000 },
  { pos: [26.56, 93.18], name: 'Flood risk · Kaziranga belt', color: '#f87171', radius: 30000 },
  { pos: [25.58, 91.92], name: 'Dense fog · Meghalaya corridor', color: '#38bdf8', radius: 26000 },
];

const filterButtons = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'distance', label: 'Shortest' },
  { id: 'road', label: 'Best Road' },
  { id: 'weather', label: 'Avoid Weather' },
  { id: 'traffic', label: 'Low Traffic' },
  { id: 'landslide', label: 'Avoid Landslide' },
  { id: 'flood', label: 'Avoid Flood' },
  { id: 'safest', label: 'Safest' },
];

const modeCopy = {
  tourist: 'Public travel',
  delivery: 'Delivery',
  emergency: 'Emergency',
};

const sortRoutes = (routes, filter) => {
  const sorted = [...routes];
  switch (filter) {
    case 'distance': return sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    case 'road': return sorted.sort((a, b) => b.roadCondition - a.roadCondition);
    case 'weather': return sorted.sort((a, b) => a.weatherRisk - b.weatherRisk);
    case 'traffic': return sorted.sort((a, b) => a.trafficRisk - b.trafficRisk);
    case 'landslide': return sorted.sort((a, b) => a.landslideRisk - b.landslideRisk);
    case 'flood': return sorted.sort((a, b) => a.floodRisk - b.floodRisk);
    case 'safest': return sorted.sort((a, b) => a.risk - b.risk);
    default: return sorted.sort((a, b) => (a.tag === 'Recommended' ? -1 : b.tag === 'Recommended' ? 1 : a.risk - b.risk));
  }
};

const metricTone = (value, invert = false) => {
  const score = invert ? 100 - value : value;
  if (score <= 20) return 'emerald';
  if (score <= 45) return 'amber';
  return 'red';
};

const PublicMapPage = () => {
  const [layers, setLayers] = useState({ trucks: true, blockages: true, weather: true });
  const [search, setSearch] = useState('');
  const [journey, setJourney] = useState(null);
  const [plannerReset, setPlannerReset] = useState(0);
  const [mode, setMode] = useState('tourist');
  const [routeFilter, setRouteFilter] = useState('recommended');
  const [selectedRouteId, setSelectedRouteId] = useState('route-a');
  const [emergency, setEmergency] = useState(null);
  const [languageCode, setLanguageCode] = useState('en');

  const filteredConvoys = useMemo(
    () => CONVOYS.filter((c) => `${c.id} ${c.driver} ${c.from} ${c.to} ${c.cargo}`.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const filteredBlockages = useMemo(
    () => BLOCKAGES.filter((b) => `${b.type} ${b.location}`.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const routes = useMemo(() => sortRoutes(ROUTE_OPTIONS, routeFilter), [routeFilter]);
  const selectedRoute = ROUTE_OPTIONS.find((routeItem) => routeItem.id === selectedRouteId) || routes[0];
  const language = LOCAL_LANGUAGE_ALERTS.find((item) => item.code === languageCode) || LOCAL_LANGUAGE_ALERTS[0];
  const bestRoute = routes[0];

  const toggleLayer = (key) => setLayers((current) => ({ ...current, [key]: !current[key] }));

  const clearJourney = () => setJourney(null);
  const selectJourneyRoute = (id) => setJourney((current) => current ? { ...current, selectedId: id } : null);
  const showSamples = () => {
    setJourney(null);
    setPlannerReset((value) => value + 1);
  };

  const activateEmergency = (item) => {
    showSamples();
    const route = ROUTE_OPTIONS.find((routeItem) => routeItem.name === item.route) || ROUTE_OPTIONS[2];
    setEmergency(item);
    setMode('emergency');
    setRouteFilter('safest');
    setSelectedRouteId(route.id);
    toast.success(`${item.label}: ${route.name} highlighted. Alert preview ready.`);
  };

  return (
    <PageShell className="map-page">
      <div className="map-page-inner">
        <SectionHeading
          eyebrow="North-East India"
          as="h1"
          title={<>NER <span className="text-gold-gradient">route intelligence map</span></>}
          sub="Compare routes. Check road conditions. Plan your journey."
        />
        <p className="map-data-note">Search real places and driving routes with Mapbox. The regional vehicles, risk scores, and alerts are sample data—not live navigation.</p>

        <div className="map-workspace">
          <section className="journey-planner glass" aria-labelledby="journey-heading">
            <div className="planner-heading">
              <h2 id="journey-heading">Plan your journey</h2>
              <div className="choice-group" role="group" aria-label="Journey type">
                {[
                  ['tourist', 'Public travel'],
                  ['delivery', 'Delivery'],
                  ['emergency', 'Emergency'],
                ].map(([key, label]) => (
                  <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)} className="choice-button">
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <JourneyPlanner onJourney={setJourney} onClear={clearJourney} resetVersion={plannerReset} />
          </section>

          <motion.section aria-label="Interactive route map" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="map-surface glass-deep">
            <div className="map-toolbar">
              <div className="map-layer-controls">
                <span className="label-dark">Show on map</span>
                <div className="choice-group" role="group" aria-label="Map layers">
                  {[
                    ['trucks', Truck, 'Trucks'],
                    ['blockages', AlertTriangle, 'Blockages'],
                    ['weather', CloudRainWind, 'Weather'],
                  ].map(([key, Icon, label]) => (
                    <button key={key} aria-pressed={layers[key]} onClick={() => toggleLayer(key)} className="choice-button">
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="map-search">
                <label className="label-dark" htmlFor="map-search">Find a vehicle or road</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory-500" />
                  <input id="map-search" className="input-dark !pl-12" placeholder="Convoy, road, district…" aria-label="Search convoys and blockages" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="map-canvas">
              <MapContainer center={center} zoom={7} minZoom={1} maxZoom={20} className="h-full w-full z-0" scrollWheelZoom>
                <MapboxLayer />

                <Polygon
                  positions={neRegionPolygon}
                  pathOptions={{ color: '#e8c987', fillColor: '#c9a96e', fillOpacity: 0.08, weight: 2, dashArray: '7 10' }}
                />

                {journey && <JourneyMap journey={journey} onSelect={selectJourneyRoute} />}

                {!journey && ROUTE_OPTIONS.map((routeItem) => {
                  const active = routeItem.id === selectedRoute.id;
                  return (
                    <Polyline
                      key={routeItem.id}
                      positions={routeItem.path}
                      pathOptions={{
                        color: routeItem.color,
                        weight: active ? 8 : 4,
                        opacity: active ? 0.95 : 0.42,
                        dashArray: active ? null : '10 12',
                      }}
                    >
                      <Popup>
                        <strong>{routeItem.name} · {routeItem.tag}</strong><br />
                        {routeItem.via}<br />
                        {routeItem.distanceKm} km · {routeItem.eta} · Risk {routeItem.risk}%<br />
                        {routeItem.warning}
                      </Popup>
                    </Polyline>
                  );
                })}

                {layers.weather && weatherRiskZones.map((zone) => (
                  <CircleMarker
                    key={zone.name}
                    center={zone.pos}
                    radius={zone.radius / 1000}
                    pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.13, weight: 1.4 }}
                  >
                    <Popup>{zone.name}</Popup>
                  </CircleMarker>
                ))}

                {layers.trucks && filteredConvoys.map((convoy) => (
                  <Marker key={convoy.id} position={[convoy.lat, convoy.lng]} icon={truckIcon}>
                    <Popup>
                      <strong>{convoy.id}</strong> · {convoy.cargo}<br />
                      {convoy.from} → {convoy.to}<br />
                      Driver: {convoy.driver}<br />
                      ETA: {convoy.eta} · {convoy.progress}% complete
                    </Popup>
                  </Marker>
                ))}

                {layers.blockages && filteredBlockages.map((blockage) => (
                  <Marker key={blockage.id} position={[blockage.lat, blockage.lng]} icon={blockageIcon}>
                    <Popup>
                      <strong>{blockage.type}</strong><br />
                      {blockage.location}<br />
                      Reported by {blockage.reportedBy} · {blockage.time}<br />
                      Severity: {blockage.severity}
                    </Popup>
                  </Marker>
                ))}

                {emergency && (
                  <Marker position={[27.59, 91.87]} icon={hospitalIcon}>
                    <Popup>
                      <strong>{emergency.label}</strong><br />
                      {emergency.cargo}<br />
                      Priority route: {emergency.route}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className="map-selection">
              {journey ? <JourneySummary journey={journey} onSelect={selectJourneyRoute} onClear={showSamples} /> : <div className="command-card rounded-2xl p-5 sm:p-6">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Selected sample route</p>
                    <h3 className="font-display text-2xl text-ivory-100 mt-2">
                      {selectedRoute.name} · {selectedRoute.tag}
                    </h3>
                    <p className="text-xs text-ivory-500 mt-1">{selectedRoute.reason}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={selectedRoute.tone}>Risk {selectedRoute.risk}%</Badge>
                    {emergency && <Badge tone="red">Emergency preview</Badge>}
                  </div>
                </div>
              </div>}
            </div>
          </motion.section>

          <section className="route-comparison" aria-labelledby="route-options-heading">
              <div className="section-toolbar">
                <div>
                  <h2 id="route-options-heading">Sample route comparison</h2>
                  <p className="text-ivory-400 mt-2">Explore the regional risk demo. Selecting a sample replaces the driving route on the map.</p>
                </div>
                <Badge tone="gold">{modeCopy[mode]}</Badge>
              </div>
              <div className="route-filters" role="group" aria-label="Sort routes">
                {filterButtons.map((filter) => (
                  <button key={filter.id} aria-pressed={routeFilter === filter.id} onClick={() => setRouteFilter(filter.id)} className={routeFilter === filter.id ? 'route-chip active' : 'route-chip'}>
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="route-options-grid">
                {routes.map((routeItem, index) => (
                  <button
                    key={routeItem.id}
                    aria-pressed={!journey && selectedRoute.id === routeItem.id}
                    onClick={() => { showSamples(); setSelectedRouteId(routeItem.id); }}
                    className={`route-result-card ${!journey && selectedRoute.id === routeItem.id ? 'active' : ''}`}
                  >
                    <div className="route-card-heading">
                      <div>
                        <p className="text-xl text-ivory-100 font-semibold">{index + 1}. {routeItem.name}</p>
                        <p className="text-gold-300 mt-1">{routeItem.tag}</p>
                        <p className="text-xs text-ivory-500 mt-1">{routeItem.via}</p>
                      </div>
                      <Badge tone={routeItem.tone}>Risk {routeItem.risk}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-left">
                      <MiniMetric label="Distance" value={`${routeItem.distanceKm} km`} />
                      <MiniMetric label="ETA" value={routeItem.eta} />
                      <MiniMetric label="Delay" value={routeItem.delay} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <RiskPill label="Road" value={routeItem.roadCondition} tone={metricTone(routeItem.roadCondition, true)} suffix="% good" />
                      <RiskPill label="Weather" value={routeItem.weatherRisk} tone={metricTone(routeItem.weatherRisk)} />
                      <RiskPill label="Traffic" value={routeItem.trafficRisk} tone={metricTone(routeItem.trafficRisk)} />
                      <RiskPill label="Landslide" value={routeItem.landslideRisk} tone={metricTone(routeItem.landslideRisk)} />
                      <RiskPill label="Flood" value={routeItem.floodRisk} tone={metricTone(routeItem.floodRisk)} />
                      <RiskPill label="Safety" value={100 - routeItem.risk} tone={routeItem.risk < 20 ? 'emerald' : 'amber'} suffix="%" />
                    </div>
                    <p className="text-xs text-ivory-500 mt-3 leading-relaxed">{routeItem.warning}</p>
                  </button>
                ))}
              </div>
          </section>

          <section className="map-support" aria-label="Alerts and regional information">
            <div className="map-support-card glass-deep">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-300">
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <p className="eyebrow">Emergency priority</p>
                  <h2 className="font-display text-2xl text-ivory-100">Essential supplies</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_PRIORITIES.map((item) => (
                    <button key={item.id} aria-pressed={emergency?.id === item.id} onClick={() => activateEmergency(item)} className="emergency-tile">
                    <Siren className="w-4 h-4 text-red-300" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              {emergency && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-3">
                  <Badge tone="red">{emergency.priority}</Badge>
                  <p className="text-sm text-ivory-200 mt-2 font-semibold">{emergency.cargo}</p>
                  <p className="text-xs text-ivory-500 mt-1">{emergency.route} selected · {emergency.eta}</p>
                </div>
              )}
            </div>

            <div className="map-support-card glass">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-4 h-4 text-gold-400" />
                <h2 className="font-display text-2xl text-ivory-100">Local language alerts</h2>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {LOCAL_LANGUAGE_ALERTS.map((item) => (
                  <button key={item.code} aria-pressed={languageCode === item.code} onClick={() => setLanguageCode(item.code)} className={languageCode === item.code ? 'btn-gold !py-2 !px-2 text-xs' : 'btn-ghost !py-2 !px-2 text-xs'}>
                    {item.short}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ivory-500 mb-2">{language.label} notification preview</p>
              <div className="rounded-2xl border border-gold-500/15 bg-black/25 p-4 text-sm text-ivory-200 leading-relaxed">
                {selectedRoute.risk > 30 ? language.message : language.safe}
              </div>
            </div>

            <div className="map-support-card glass">
              <h2 className="font-display text-2xl text-ivory-100 mb-6">Road updates</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <MiniStat icon={ShieldCheck} label="Roads open" value="82%" tone="emerald" />
                <MiniStat icon={Truck} label="Convoys" value={CONVOYS.length} tone="sky" />
                <MiniStat icon={AlertTriangle} label="Blockages" value={BLOCKAGES.length} tone="red" />
                <MiniStat icon={Navigation} label="Best risk" value={`${bestRoute.risk}%`} tone="gold" />
              </div>
              <div className="space-y-4">
                {ALERT_FEED.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-gold-500/10 bg-black/20 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={alert.severity}>{alert.severity}</Badge>
                      <span className="text-[10px] text-ivory-600 font-mono">{alert.time}</span>
                    </div>
                    <p className="text-sm text-ivory-200 font-semibold">{alert.title}</p>
                    <p className="text-xs text-ivory-500 mt-1 leading-relaxed">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="map-support-card glass">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-gold-400" />
                <h2 className="font-display text-2xl text-ivory-100">Roads open by state</h2>
              </div>
              <div className="space-y-6">
                {STATE_STATS.map((state) => (
                  <div key={state.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ivory-300">{state.name}</span>
                      <span className="font-mono text-gold-300">{state.roadsOpen}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${state.roadsOpen}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
};

const MiniMetric = ({ label, value }) => (
  <div className="rounded-xl bg-black/20 border border-white/5 p-2">
    <p className="text-xs text-ivory-500">{label}</p>
    <p className="text-sm text-ivory-200 mt-1 font-semibold">{value}</p>
  </div>
);

const RiskPill = ({ label, value, tone, suffix = '%' }) => (
  <div className={`risk-pill risk-pill-${tone}`}>
    <span>{label}</span>
    <b>{value}{suffix}</b>
  </div>
);

const MiniStat = ({ icon: Icon, label, value, tone }) => (
  <div className={`mini-stat mini-stat-${tone}`}>
    <Icon className="w-4 h-4" />
    <div>
      <p>{label}</p>
      <b>{value}</b>
    </div>
  </div>
);

export default PublicMapPage;