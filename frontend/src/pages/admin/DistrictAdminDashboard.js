import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import {
  ALERT_FEED,
  BLOCKAGES,
  CONVOYS,
  DELIVERIES,
  LOCAL_LANGUAGE_ALERTS,
  PENDING_APPROVALS,
  ROUTE_OPTIONS,
} from '../../data/mockData';
import { AlertTriangle, ClipboardList, GitBranch, Languages, Map, PackagePlus, RadioTower, ShieldCheck, Truck, Users } from 'lucide-react';

const nav = [
  { id: 'overview', label: 'District Overview', icon: Map },
  { id: 'convoys', label: 'Essential Convoys', icon: Truck, count: CONVOYS.length },
  { id: 'create', label: 'Create Delivery', icon: PackagePlus },
  { id: 'blockages', label: 'Road Problems', icon: AlertTriangle, count: BLOCKAGES.length },
  { id: 'language', label: 'Local Alerts', icon: Languages },
  { id: 'users', label: 'Manage Users', icon: Users, count: PENDING_APPROVALS.length },
];

const DistrictAdminDashboard = () => {
  const [active, setActive] = useState('overview');
  const [convoys, setConvoys] = useState(CONVOYS);
  const [approvals, setApprovals] = useState(PENDING_APPROVALS);
  const [deliveries, setDeliveries] = useState(DELIVERIES);
  const [language, setLanguage] = useState(LOCAL_LANGUAGE_ALERTS[2]);

  const reroute = (id) => {
    setConvoys((items) => items.map((c) => (c.id === id ? { ...c, status: 'in_progress', eta: 'Rerouted +45m', progress: Math.max(c.progress, 45) } : c)));
    toast.success(`${id} rerouted to safest available road. Driver notified in ${language.label}.`);
  };

  const createDelivery = () => {
    const next = {
      id: `DL-${8800 + deliveries.length + 1}`,
      cargo: 'Medicine',
      from: 'Guwahati Medical Depot',
      to: 'Tawang District Hospital',
      distance: '325 km',
      payout: 24000,
      priority: 'emergency',
      status: 'pending',
      vehicle: '10-ton Truck',
    };
    setDeliveries((items) => [next, ...items]);
    toast.success('Emergency medicine delivery created. Route C/Safest route suggested and drivers notified.');
    setActive('convoys');
  };

  const approve = (id) => {
    setApprovals((items) => items.filter((u) => u.id !== id));
    toast.success(`${id} approved and added to district operations.`);
  };

  return (
    <DashboardLayout
      roleLabel="District Admin"
      nav={nav}
      active={active}
      onNavigate={setActive}
      title={nav.find((n) => n.id === active)?.label || 'District Admin'}
      subtitle="Monitor road accessibility, create essential deliveries, verify blockages and reroute vehicles inside the district."
    >
      {active === 'overview' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Truck} label="Essential convoys" value={convoys.length} sub="Medicine / food / fuel" accent="sky" trend={9} />
            <StatCard icon={AlertTriangle} label="Road problems" value={BLOCKAGES.length} sub="Landslide, flood, traffic" accent="red" />
            <StatCard icon={GitBranch} label="Roads open" value="85%" sub="District network" accent="emerald" trend={6} />
            <StatCard icon={RadioTower} label="Avg delay" value="45m" sub="After rerouting" accent="amber" trend={-23} />
          </div>

          <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
            <div className="glass rounded-3xl p-5 overflow-x-auto">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h3 className="font-display text-2xl text-ivory-100">Live essential convoy table</h3>
                <Badge tone="emerald">GPS-ready</Badge>
              </div>
              <ConvoyTable convoys={convoys} onReroute={reroute} />
            </div>
            <div className="glass rounded-3xl p-5">
              <h3 className="font-display text-2xl text-ivory-100 mb-4">District updates</h3>
              <div className="space-y-3">
                {ALERT_FEED.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-black/20 border border-gold-500/10 p-3">
                    <Badge status={a.severity}>{a.severity}</Badge>
                    <p className="text-sm text-ivory-200 mt-2 font-semibold">{a.title}</p>
                    <p className="text-xs text-ivory-500 mt-1">{a.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'convoys' && (
        <div className="glass rounded-3xl p-5 overflow-x-auto">
          <ConvoyTable convoys={convoys} onReroute={reroute} />
        </div>
      )}

      {active === 'create' && (
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
          <div className="glass-deep rounded-3xl p-6">
            <p className="eyebrow mb-3">Essential delivery</p>
            <h3 className="font-display text-3xl text-ivory-100 mb-5">Create medicine / food / fuel mission</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <select className="input-dark"><option>Medicine</option><option>Hospital Supply</option><option>Food Grain</option><option>Fuel</option><option>Construction Material</option><option>Agriculture Goods</option></select>
              <select className="input-dark"><option>Emergency</option><option>High</option><option>Medium</option><option>Low</option></select>
              <input className="input-dark" defaultValue="Guwahati Medical Depot" />
              <input className="input-dark" defaultValue="Tawang District Hospital" />
              <input className="input-dark" defaultValue="5 tons" />
              <input className="input-dark" defaultValue="ASAP" />
            </div>
            <textarea className="input-dark min-h-[110px] mb-5" defaultValue="Temperature controlled, emergency medicine consignment. Avoid landslide and flood corridors." />
            <button onClick={createDelivery} className="btn-gold !py-3">
              <ClipboardList className="w-4 h-4" /> Create Delivery
            </button>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-2xl text-ivory-100 mb-4">Route options before assignment</h3>
            {ROUTE_OPTIONS.map((route) => (
              <div key={route.id} className="rounded-2xl bg-black/20 border border-gold-500/10 p-4 mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-ivory-100 font-semibold">{route.name} · {route.tag}</p>
                  <p className="text-xs text-ivory-500 mt-1">{route.distanceKm} km · {route.eta} · {route.via}</p>
                </div>
                <Badge tone={route.tone}>Risk {route.risk}%</Badge>
              </div>
            ))}
            <div className="gold-rule my-5" />
            <h4 className="font-display text-xl text-ivory-100 mb-3">Suggested drivers</h4>
            {['Rajesh Kumar · 5 km from pickup · truck ready', 'Bikash Deka · 12 km from pickup · food/fuel certified'].map((d) => <div key={d} className="text-sm text-ivory-400 py-2 border-b border-gold-500/10 last:border-0">{d}</div>)}
          </div>
        </div>
      )}

      {active === 'blockages' && (
        <div className="glass rounded-3xl p-5 overflow-x-auto">
          <table className="table-dark">
            <thead><tr><th>Location</th><th>Type</th><th>Reported By</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {BLOCKAGES.map((b) => (
                <tr key={b.id}>
                  <td>{b.location}</td><td>{b.type}</td><td>{b.reportedBy}</td><td>{b.time}</td><td><Badge status={b.status}>{b.status}</Badge></td>
                  <td><button onClick={() => toast.success(`${b.id} verified. Map red/yellow layer updated and affected routes recalculated.`)} className="btn-gold !py-1.5 !px-3 text-xs"><ShieldCheck className="w-3 h-3" /> Verify</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active === 'language' && (
        <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-5">
          <div className="glass rounded-3xl p-6">
            <Badge tone="gold">Local language</Badge>
            <h3 className="font-display text-3xl text-ivory-100 mt-4 mb-4">Choose alert language</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {LOCAL_LANGUAGE_ALERTS.map((item) => (
                <button key={item.code} onClick={() => setLanguage(item)} className={language.code === item.code ? 'btn-gold justify-start' : 'btn-ghost justify-start'}>
                  <Languages className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-deep rounded-3xl p-6">
            <p className="eyebrow">Driver / tourist alert preview</p>
            <div className="rounded-3xl border border-gold-500/15 bg-black/25 p-5 text-lg text-ivory-100 leading-relaxed mt-4">
              {language.message}
            </div>
            <button onClick={() => toast.success(`${language.label} alert queued for affected drivers and public map.`)} className="btn-gold mt-5">
              <RadioTower className="w-4 h-4" /> Send alert
            </button>
          </div>
        </div>
      )}

      {active === 'users' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {approvals.map((u) => (
            <div key={u.id} className="glass glass-hover rounded-3xl p-5">
              <Badge status="pending">Pending</Badge>
              <h3 className="font-display text-xl text-ivory-100 mt-3">{u.name}</h3>
              <p className="text-sm text-ivory-500 mt-1">{u.role} · {u.district}</p>
              <p className="font-mono text-xs text-ivory-600 mt-2">{u.phone} · {u.applied}</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button onClick={() => approve(u.id)} className="btn-gold">Approve</button>
                <button onClick={() => setApprovals((items) => items.filter((x) => x.id !== u.id))} className="btn-danger">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

const ConvoyTable = ({ convoys, onReroute }) => (
  <table className="table-dark">
    <thead><tr><th>Convoy</th><th>Cargo</th><th>Route</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>
      {convoys.map((c) => (
        <tr key={c.id}>
          <td>{c.id}<br /><span className="text-xs text-ivory-600">{c.driver}</span></td>
          <td>{c.cargo}<br /><Badge status={c.priority}>{c.priority}</Badge></td>
          <td>{c.from} → {c.to}</td>
          <td><div className="min-w-[120px]"><div className="progress-track"><div className="progress-fill" style={{ width: `${c.progress}%` }} /></div><span className="text-xs text-ivory-600">{c.progress}% · {c.eta}</span></div></td>
          <td><Badge status={c.status}>{c.status}</Badge></td>
          <td><button onClick={() => onReroute(c.id)} className="btn-ghost !py-1.5 !px-3 text-xs"><GitBranch className="w-3 h-3" /> Reroute</button></td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DistrictAdminDashboard;