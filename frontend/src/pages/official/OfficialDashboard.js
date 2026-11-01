import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { ALERT_FEED, BLOCKAGES, VERIFY_QUEUE } from '../../data/mockData';
import { AlertOctagon, Camera, CheckCircle2, ClipboardCheck, History, MapPin, Radio, Siren, UploadCloud } from 'lucide-react';

const nav = [
  { id: 'overview', label: 'Field Overview', icon: MapPin },
  { id: 'verify', label: 'Verify Reports', icon: ClipboardCheck, count: VERIFY_QUEUE.length },
  { id: 'report', label: 'Report Blockage', icon: Camera },
  { id: 'emergency', label: 'Emergency Escalation', icon: Siren },
  { id: 'history', label: 'My Reports', icon: History },
];

const OfficialDashboard = () => {
  const [active, setActive] = useState('overview');
  const [queue, setQueue] = useState(VERIFY_QUEUE);
  const [blockages, setBlockages] = useState(BLOCKAGES);

  const verify = (item) => {
    setQueue((items) => items.filter((q) => q.id !== item.id));
    toast.success(`${item.type} verified — affected convoys notified.`);
  };

  const clearBlockage = (id) => {
    setBlockages((items) => items.map((b) => (b.id === id ? { ...b, status: 'cleared', severity: 'low' } : b)));
    toast.success('Clearance update pushed to public map.');
  };

  const report = () => {
    toast.success('Road report added to this demo.');
    setActive('overview');
  };

  return (
    <DashboardLayout roleLabel="Field Official" nav={nav} active={active} onNavigate={setActive} title={nav.find((n) => n.id === active)?.label || 'Field Official'} subtitle="Report, verify and clear disruptions from the field.">
      {active === 'overview' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={AlertOctagon} label="Active reports" value={blockages.filter((b) => b.status !== 'cleared').length} sub="In your district" accent="red" />
            <StatCard icon={ClipboardCheck} label="Verify queue" value={queue.length} sub="Driver reports" accent="amber" />
            <StatCard icon={CheckCircle2} label="Clearances" value="89" sub="Lifetime" accent="emerald" trend={21} />
            <StatCard icon={Radio} label="Network mode" value="Offline ready" sub="Demo status" accent="sky" />
          </div>

          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5">
            <div className="glass rounded-3xl p-5 overflow-x-auto">
              <h3 className="font-display text-2xl text-ivory-100 mb-5">Nearby road reports</h3>
              <table className="table-dark">
                <thead><tr><th>Location</th><th>Type</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {blockages.map((b) => (
                    <tr key={b.id}>
                      <td>{b.location}</td><td>{b.type}</td><td><Badge status={b.severity}>{b.severity}</Badge></td><td><Badge status={b.status}>{b.status}</Badge></td>
                      <td><button onClick={() => clearBlockage(b.id)} className="btn-emerald !py-1.5 !px-3 text-xs">Mark clear</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="glass rounded-3xl p-5">
              <h3 className="font-display text-2xl text-ivory-100 mb-4">District alerts</h3>
              <div className="space-y-3">{ALERT_FEED.slice(0, 5).map((a) => <div key={a.id} className="rounded-2xl bg-black/20 border border-gold-500/10 p-3"><Badge status={a.severity}>{a.severity}</Badge><p className="text-sm text-ivory-200 mt-2">{a.title}</p><p className="text-xs text-ivory-500 mt-1">{a.detail}</p></div>)}</div>
            </div>
          </div>
        </div>
      )}

      {active === 'verify' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {queue.map((item) => (
            <div key={item.id} className="glass glass-hover rounded-3xl p-5">
              <div className="flex items-start justify-between"><Badge status={item.severity}>{item.severity}</Badge><span className="font-mono text-xs text-ivory-600">{item.time}</span></div>
              <h3 className="font-display text-2xl text-ivory-100 mt-4">{item.type}</h3>
              <p className="text-sm text-ivory-500 mt-2">{item.location}</p>
              <p className="text-xs text-ivory-600 mt-2">Reported by {item.reportedBy}</p>
              <div className="grid grid-cols-2 gap-3 mt-5"><button onClick={() => verify(item)} className="btn-gold"><ClipboardCheck className="w-4 h-4" /> Verify</button><button onClick={() => toast.error('Marked as false report for demo.')} className="btn-danger">Reject</button></div>
            </div>
          ))}
          {queue.length === 0 && <div className="glass rounded-3xl p-8 text-ivory-400">All reports verified. Nice work.</div>}
        </div>
      )}

      {active === 'report' && (
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
          <div className="glass-deep rounded-3xl p-6">
            <p className="eyebrow mb-3">Road report</p>
            <h3 className="font-display text-3xl text-ivory-100 mb-5">New blockage report</h3>
            <div className="space-y-4"><select className="input-dark"><option>Landslide</option><option>Flooding</option><option>Bridge Collapse</option><option>Heavy Fog</option></select><input className="input-dark" defaultValue="NH-13 · Sela Pass approach" /><textarea className="input-dark min-h-[130px]" defaultValue="Slope failure, two-lane closure. Dozer support required." /><button onClick={report} className="btn-gold w-full !py-3"><UploadCloud className="w-4 h-4" /> Submit geo-tagged report</button></div>
          </div>
          <div className="glass rounded-3xl p-6"><h3 className="font-display text-2xl text-ivory-100 mb-4">Reporting checklist</h3>{['Check the location', 'Describe the road damage', 'Note whether vehicles can pass', 'Include any urgent support needed', 'Submit the report for review'].map((s, i) => <div key={s} className="flex gap-3 py-3 border-b border-gold-500/10 last:border-0"><span className="font-display text-gold-300">0{i + 1}</span><p className="text-sm text-ivory-400">{s}</p></div>)}</div>
        </div>
      )}

      {active === 'emergency' && (
        <div className="glass-deep rounded-3xl p-7 max-w-3xl">
          <Badge tone="red">State escalation</Badge>
          <h3 className="font-display text-3xl text-ivory-100 mt-4 mb-5">Report major emergency</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4"><select className="input-dark"><option>Bridge collapse</option><option>Major landslide</option><option>Flash flood</option><option>Earthquake/disaster</option></select><input className="input-dark" defaultValue="Tawang district" /></div>
          <textarea className="input-dark min-h-[140px] mb-5" defaultValue="Estimated 14 villages cut off. Immediate BRO/PWD support and emergency transport requested." />
          <button onClick={() => toast.success('Red alert sent to State Admin + Ministry dashboard.')} className="btn-danger !py-3"><Siren className="w-4 h-4" /> Broadcast emergency</button>
        </div>
      )}

      {active === 'history' && (
        <div className="grid md:grid-cols-2 gap-4">{blockages.map((b) => <div key={b.id} className="glass rounded-3xl p-5"><Badge status={b.status}>{b.status}</Badge><h3 className="font-display text-xl text-ivory-100 mt-3">{b.type}</h3><p className="text-sm text-ivory-500 mt-1">{b.location}</p><p className="text-xs text-gold-300 mt-3">Bonus awarded: ₹500</p></div>)}</div>
      )}
    </DashboardLayout>
  );
};

export default OfficialDashboard;