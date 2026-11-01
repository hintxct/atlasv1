import React from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import {
  ALERT_FEED,
  BLOCKAGES,
  CHART_TOOLTIP_STYLE,
  CONVOYS,
  EMERGENCY_PRIORITIES,
  LOCAL_LANGUAGE_ALERTS,
  ROUTE_OPTIONS,
  STATE_STATS,
  WEEKLY_FLOW,
} from '../../data/mockData';
import {
  AlertTriangle,
  Building2,
  GitBranch,
  Landmark,
  Languages,
  RadioTower,
  ShieldCheck,
  Siren,
  Truck,
} from 'lucide-react';

const nav = [
  { id: 'overview', label: 'Overview', icon: Landmark },
  { id: 'emergency', label: 'Emergency Priority', icon: Siren, count: 5 },
  { id: 'routes', label: 'Route Accessibility', icon: GitBranch, count: ROUTE_OPTIONS.length },
  { id: 'states', label: 'State Connectivity', icon: Building2 },
  { id: 'language', label: 'Language Alerts', icon: Languages },
];

const StateAdminDashboard = () => {
  const [active, setActive] = React.useState('overview');
  const [priority, setPriority] = React.useState(EMERGENCY_PRIORITIES[1]);
  const [language, setLanguage] = React.useState(LOCAL_LANGUAGE_ALERTS[0]);

  const activatePriority = (item) => {
    setPriority(item);
    toast.success(`${item.label} priority activated. ${item.route} pushed to district admins and drivers.`);
  };

  const broadcast = () => {
    toast.success(`${language.label} alert broadcast to drivers, officials and district dashboards.`);
  };

  return (
    <DashboardLayout
      roleLabel="Government Admin"
      nav={nav}
      active={active}
      onNavigate={setActive}
      title={nav.find((n) => n.id === active)?.label || 'State dashboard'}
      subtitle="Manage road access, essential deliveries, and urgent supplies across North-East India."
    >
      {active === 'overview' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Truck} label="Essential convoys" value={CONVOYS.length} sub="Medicine, food, fuel, relief" accent="sky" trend={12} />
            <StatCard icon={GitBranch} label="Roads open" value="82%" sub="All NER states" accent="emerald" trend={5} />
            <StatCard icon={AlertTriangle} label="Active disruptions" value={BLOCKAGES.length} sub="Landslide / flood / traffic" accent="red" />
            <StatCard icon={Siren} label="Emergency route" value={priority.route} sub={priority.label} accent="amber" />
          </div>

          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5">
            <div className="glass rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="font-display text-2xl text-ivory-100">NER logistics movement</h3>
                <Badge tone="gold">Sample data</Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_FLOW}>
                    <CartesianGrid stroke="rgba(201,169,110,0.08)" />
                    <XAxis dataKey="day" stroke="#9c9585" />
                    <YAxis stroke="#9c9585" />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="deliveries" fill="#c9a96e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="disruptions" fill="#f87171" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-2xl text-ivory-100">Urgent alerts</h3>
                <Badge tone="red">Action needed</Badge>
              </div>
              <div className="space-y-3">
                {ALERT_FEED.slice(0, 5).map((a) => (
                  <div key={a.id} className="rounded-2xl bg-black/20 border border-gold-500/10 p-3">
                    <Badge status={a.severity}>{a.severity}</Badge>
                    <p className="text-sm text-ivory-200 mt-2 font-semibold">{a.title}</p>
                    <p className="text-xs text-ivory-500 mt-1 leading-relaxed">{a.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'emergency' && (
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
          <div className="glass-deep rounded-3xl p-6 border border-red-500/20">
            <Badge tone="red">Emergency button</Badge>
            <h3 className="font-display text-3xl text-ivory-100 mt-4 mb-3">Prioritise lifesaving movement</h3>
            <p className="text-sm text-ivory-500 leading-relaxed mb-5">
              Select what must move first. ATLAS highlights the safest available route, alerts district admins, and notifies drivers/field officials.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {EMERGENCY_PRIORITIES.map((item) => (
                <button key={item.id} onClick={() => activatePriority(item)} className="emergency-tile">
                  <Siren className="w-4 h-4 text-red-300" />
                  <span>{item.label}</span>
                  <small className="text-ivory-500 font-normal">{item.route} · {item.eta}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow">Active priority</p>
                <h3 className="font-display text-3xl text-ivory-100 mt-2">{priority.label}</h3>
                <p className="text-sm text-ivory-500 mt-2">{priority.cargo}</p>
              </div>
              <Badge tone="red">{priority.priority}</Badge>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <MiniBox label="Selected route" value={priority.route} />
              <MiniBox label="Risk mode" value="Safest" />
              <MiniBox label="Alert reach" value="7 languages" />
            </div>
            <div className="rounded-3xl border border-red-500/15 bg-red-500/5 p-5">
              <h4 className="font-display text-xl text-ivory-100 mb-3">System action</h4>
              {[
                'Non-essential convoy movement paused on risky corridor',
                'Hospital/medicine/food/fuel route moved to top priority',
                'District admin, field official and assigned driver notified',
                'Alternate route shown on public map with emergency badge',
              ].map((step, i) => (
                <div key={step} className="flex gap-3 py-2 border-b border-red-500/10 last:border-0">
                  <span className="font-display text-red-300">0{i + 1}</span>
                  <p className="text-sm text-ivory-400">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active === 'routes' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {ROUTE_OPTIONS.map((route) => (
            <div key={route.id} className="glass glass-hover rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{route.from} → {route.to}</p>
                  <h3 className="font-display text-2xl text-ivory-100 mt-2">{route.name} · {route.tag}</h3>
                  <p className="text-sm text-ivory-500 mt-2">{route.via}</p>
                </div>
                <Badge tone={route.tone}>Risk {route.risk}%</Badge>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                <MiniBox label="Distance" value={`${route.distanceKm} km`} />
                <MiniBox label="ETA" value={route.eta} />
                <MiniBox label="Delay" value={route.delay} />
              </div>
              <div className="gold-rule my-4" />
              <p className="text-sm text-ivory-400 leading-relaxed">{route.reason}</p>
              <button onClick={() => toast.success(`${route.name} pushed as alternate route suggestion.`)} className="btn-ghost mt-5">
                <RadioTower className="w-4 h-4" /> Push reroute
              </button>
            </div>
          ))}
        </div>
      )}

      {active === 'states' && (
        <div className="glass rounded-3xl p-5 overflow-x-auto">
          <table className="table-dark">
            <thead><tr><th>State</th><th>Convoys</th><th>Roads open</th><th>Alerts</th><th>Status</th><th>Govt action</th></tr></thead>
            <tbody>
              {STATE_STATS.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>{s.convoys}</td>
                  <td><div className="min-w-[120px]"><div className="progress-track"><div className="progress-fill" style={{ width: `${s.roadsOpen}%` }} /></div><span className="text-xs text-ivory-600">{s.roadsOpen}% reachable</span></div></td>
                  <td>{s.alerts}</td>
                  <td><Badge status={s.status}>{s.status}</Badge></td>
                  <td><button onClick={() => toast.success(`${s.name}: district accessibility room opened.`)} className="btn-ghost !py-1.5 !px-3 text-xs"><ShieldCheck className="w-3 h-3" /> Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'language' && (
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
          <div className="glass rounded-3xl p-6">
            <Badge tone="gold">NER languages</Badge>
            <h3 className="font-display text-3xl text-ivory-100 mt-4 mb-3">Multilingual route alerts</h3>
            <p className="text-sm text-ivory-500 leading-relaxed mb-5">
              Keep it simple: same road-risk alert can be sent in English, Hindi and local North-East languages for drivers, tourists and field officials.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {LOCAL_LANGUAGE_ALERTS.map((item) => (
                <button key={item.code} onClick={() => setLanguage(item)} className={language.code === item.code ? 'btn-gold justify-start' : 'btn-ghost justify-start'}>
                  <Languages className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-deep rounded-3xl p-6">
            <p className="eyebrow">Preview</p>
            <h3 className="font-display text-2xl text-ivory-100 mt-2 mb-4">{language.label} alert</h3>
            <div className="rounded-3xl border border-gold-500/15 bg-black/25 p-5 text-lg text-ivory-100 leading-relaxed">
              {language.message}
            </div>
            <button onClick={broadcast} className="btn-gold mt-5 !py-3">
              <RadioTower className="w-4 h-4" /> Broadcast selected language
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const MiniBox = ({ label, value }) => (
  <div className="rounded-2xl border border-gold-500/10 bg-black/20 p-4">
    <p className="font-mono text-[10px] tracking-[.18em] uppercase text-ivory-600">{label}</p>
    <p className="font-display text-xl text-ivory-100 mt-1">{value}</p>
  </div>
);

export default StateAdminDashboard;