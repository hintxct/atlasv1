import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { ACTIVITY, BLOCKAGES, DELIVERIES, LOCAL_LANGUAGE_ALERTS, WEEKLY_EARNINGS } from '../../data/mockData';
import { formatCurrency } from '../../utils/helpers';
import {
  AlertTriangle, Camera, CheckCircle2, ClipboardList, GitBranch, History, Navigation, PackageCheck,
  ShieldAlert, Truck, Wallet,
} from 'lucide-react';

const nav = [
  { id: 'overview', label: 'Current Delivery', icon: Navigation },
  { id: 'requests', label: 'New Requests', icon: PackageCheck, count: DELIVERIES.length },
  { id: 'reports', label: 'Report Blockage', icon: ShieldAlert },
  { id: 'history', label: 'My Deliveries', icon: History },
];

const DriverDashboard = () => {
  const [active, setActive] = useState('overview');
  const [requests, setRequests] = useState(DELIVERIES);
  const [language, setLanguage] = useState(LOCAL_LANGUAGE_ALERTS[0]);
  const [mission, setMission] = useState({
    id: 'DLV-2024-8472', cargo: 'Medicine', from: 'Guwahati Medical Depot', to: 'Tawang District Hospital',
    route: 'NH-37 → NH-13 → NH-229 via Bomdila', distance: '325 km', eta: '3h 40m', progress: 62,
    status: 'in_progress', risk: 18, payout: 12000,
  });
  const [reportType, setReportType] = useState('Landslide');

  const acceptDelivery = (delivery) => {
    setMission({
      id: delivery.id,
      cargo: delivery.cargo,
      from: delivery.from,
      to: delivery.to,
      route: 'Route A · safest corridor selected automatically',
      distance: delivery.distance,
      eta: '8h 30m',
      progress: 5,
      status: 'assigned',
      risk: delivery.priority === 'emergency' ? 15 : 26,
      payout: delivery.payout,
    });
    setRequests((items) => items.filter((item) => item.id !== delivery.id));
    setActive('overview');
    toast.success(`${delivery.id} accepted in this demo.`);
  };

  const startMission = () => {
    setMission((m) => ({ ...m, status: 'in_progress', progress: Math.max(m.progress, 12) }));
    toast.success('Delivery started in this demo.');
  };

  const reroute = () => {
    setMission((m) => ({ ...m, route: 'Auto-rerouted via Bomdila bypass · +45 km', eta: '4h 25m', risk: 9 }));
    toast.success('New safest route accepted. Old corridor marked red.');
  };

  const deliver = () => {
    setMission((m) => ({ ...m, status: 'delivered', progress: 100, eta: 'Completed', payout: m.payout + 1200 }));
    toast.success('Delivery marked complete in this demo.');
  };

  const reportBlockage = () => {
    toast.success(`${reportType} report queued in this demo. Bonus ₹500 added.`);
    setActive('overview');
  };

  const title = active === 'overview' ? 'Driver dashboard' : nav.find((item) => item.id === active)?.label;

  return (
    <DashboardLayout roleLabel="Truck Driver" nav={nav} active={active} onNavigate={setActive} title={title} subtitle="Accept essential deliveries, follow safest route, receive local-language alerts and report road problems.">
      {active === 'overview' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Truck} label="Mission" value={mission.status.replace(/_/g, ' ')} sub={mission.id} accent="sky" />
            <StatCard icon={GitBranch} label="Route risk" value={`${mission.risk}%`} sub="AI score" accent="emerald" trend={-22} />
            <StatCard icon={Wallet} label="Payout" value={formatCurrency(mission.payout)} sub="Including bonuses" accent="gold" trend={14} />
            <StatCard icon={AlertTriangle} label="Nearby alerts" value={BLOCKAGES.length} sub="2 on route" accent="red" />
          </div>

          <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
            <div className="glass-deep rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <Badge status={mission.status}>{mission.status}</Badge>
                  <h2 className="font-display text-3xl text-ivory-100 mt-4">{mission.cargo} · {mission.from} → {mission.to}</h2>
                  <p className="text-sm text-ivory-500 mt-2">{mission.route}</p>
                </div>
                <div className="text-right">
                  <p className="eyebrow mb-1">ETA</p>
                  <p className="font-display text-2xl text-gold-300">{mission.eta}</p>
                </div>
              </div>
              <div className="progress-track h-3 mb-3"><div className="progress-fill" style={{ width: `${mission.progress}%` }} /></div>
              <div className="flex justify-between text-xs text-ivory-500 mb-6"><span>Pickup</span><span>{mission.progress}% progress</span><span>Destination</span></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <button onClick={startMission} className="btn-gold"><Navigation className="w-4 h-4" /> Start GPS</button>
                <button onClick={reroute} className="btn-ghost"><GitBranch className="w-4 h-4" /> Accept Reroute</button>
                <button onClick={() => setActive('reports')} className="btn-ghost"><Camera className="w-4 h-4" /> Report Issue</button>
                <button onClick={deliver} className="btn-emerald"><CheckCircle2 className="w-4 h-4" /> Mark Delivered</button>
              </div>
            </div>

            <div className="glass rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-2xl text-ivory-100">Route alerts</h3>
                <Badge tone="gold">{language.label}</Badge>
              </div>
              <div className="rounded-2xl border border-gold-500/15 bg-black/25 p-3 text-sm text-ivory-200 leading-relaxed mb-4">
                {mission.risk > 25 ? language.message : language.safe}
              </div>
              <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
                {LOCAL_LANGUAGE_ALERTS.map((item) => (
                  <button key={item.code} onClick={() => setLanguage(item)} className={language.code === item.code ? 'route-chip active' : 'route-chip'}>
                    {item.short}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {BLOCKAGES.slice(0, 4).map((blockage) => (
                  <div key={blockage.id} className="rounded-2xl border border-gold-500/10 bg-black/20 p-3">
                    <div className="flex justify-between gap-3"><Badge status={blockage.severity}>{blockage.type}</Badge><span className="text-[10px] text-ivory-600">{blockage.time}</span></div>
                    <p className="text-sm text-ivory-300 mt-2">{blockage.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'requests' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {requests.map((delivery) => (
            <div key={delivery.id} className="glass glass-hover rounded-3xl p-5">
              <div className="flex justify-between items-start gap-3 mb-4"><Badge status={delivery.priority}>{delivery.priority}</Badge><span className="font-mono text-xs text-gold-300">{delivery.id}</span></div>
              <h3 className="font-display text-2xl text-ivory-100">{delivery.cargo}</h3>
              <p className="text-sm text-ivory-500 mt-2">{delivery.from} → {delivery.to}</p>
              <div className="grid grid-cols-2 gap-3 my-5 text-sm"><span className="text-ivory-500">Distance<br /><b className="text-ivory-200">{delivery.distance}</b></span><span className="text-ivory-500">Pay<br /><b className="text-gold-300">{formatCurrency(delivery.payout)}</b></span><span className="text-ivory-500">Vehicle<br /><b className="text-ivory-200">{delivery.vehicle}</b></span><span className="text-ivory-500">Route<br /><b className="text-emerald-300">Safest</b></span></div>
              <button onClick={() => acceptDelivery(delivery)} className="btn-gold w-full"><PackageCheck className="w-4 h-4" /> Accept Delivery</button>
            </div>
          ))}
        </div>
      )}

      {active === 'reports' && (
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
          <div className="glass-deep rounded-3xl p-6">
            <p className="eyebrow mb-3">Quick blockage report</p>
            <h3 className="font-display text-3xl text-ivory-100 mb-5">Capture road issue</h3>
            <label className="label-dark">Issue type</label>
            <select className="input-dark mb-4" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {['Road Blocked', 'Flooding', 'Landslide', 'Heavy Fog', 'Accident', 'Fuel Issue', 'Vehicle Breakdown'].map((type) => <option key={type}>{type}</option>)}
            </select>
            <label className="label-dark">Location</label>
            <input className="input-dark mb-4" defaultValue="Auto GPS · Near Tezpur KM 145" />
            <label className="label-dark">Notes</label>
            <textarea className="input-dark min-h-[120px] mb-5" defaultValue="Road partially blocked, one lane passable." />
              <button onClick={reportBlockage} className="btn-gold w-full !py-3"><Camera className="w-4 h-4" /> Submit report</button>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-2xl text-ivory-100 mb-4">After a report</h3>
            {['Save the location and details', 'Share the report for review', 'Highlight the affected road', 'Review alternative routes', 'Notify nearby drivers and district teams'].map((step, i) => (
              <div key={step} className="flex gap-3 py-3 border-b border-gold-500/10 last:border-0"><span className="font-display text-gold-300">0{i + 1}</span><p className="text-sm text-ivory-400">{step}</p></div>
            ))}
          </div>
        </div>
      )}

      {active === 'history' && (
        <div className="grid lg:grid-cols-[1fr_.8fr] gap-5">
          <div className="glass rounded-3xl p-5 overflow-x-auto">
            <table className="table-dark"><thead><tr><th>Delivery</th><th>Cargo</th><th>Route</th><th>Earned</th><th>Status</th></tr></thead><tbody>{DELIVERIES.slice(0, 5).map((d, i) => <tr key={d.id}><td>{d.id.replace('880', '879')}</td><td>{d.cargo}</td><td>{d.from} → {d.to}</td><td>{formatCurrency(d.payout - 2500)}</td><td><Badge status="delivered">Delivered</Badge></td></tr>)}</tbody></table>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="font-display text-2xl text-ivory-100 mb-4">Weekly earnings</h3>
            {WEEKLY_EARNINGS.map((day) => <div key={day.day} className="mb-3"><div className="flex justify-between text-xs mb-1"><span>{day.day}</span><span>{formatCurrency(day.earnings)}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${day.earnings / 80}%` }} /></div></div>)}
            <div className="gold-rule my-5" />
            {ACTIVITY.map((item) => <div key={item.text} className="flex gap-3 text-sm py-2"><ClipboardList className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" /><span className="text-ivory-400">{item.text}</span><span className="text-ivory-600 ml-auto whitespace-nowrap">{item.time}</span></div>)}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DriverDashboard;