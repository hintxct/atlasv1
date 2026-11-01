import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageShell from '../components/PageShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { BLOCKAGE_MIX, CHART_TOOLTIP_STYLE, CONVOYS, STATE_STATS, WEEKLY_FLOW } from '../data/mockData';
import { Activity, AlertTriangle, Clock3, GitBranch, ShieldCheck, Truck } from 'lucide-react';

const COLORS = ['#f87171', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399'];

const StatisticsPage = () => (
  <PageShell className="pt-24 pb-14 px-4 sm:px-6">
    <div className="max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="Public statistics"
        title="North-East logistics at a glance"
        sub="View deliveries, road conditions, and alerts across eight states. Figures shown are sample data."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Truck} label="Active convoys" value={CONVOYS.length * 39} sub="Across 8 states" accent="sky" trend={12} />
        <StatCard icon={GitBranch} label="Roads open" value="82%" sub="District accessibility" accent="emerald" trend={7} />
        <StatCard icon={AlertTriangle} label="Active alerts" value="12" sub="6 verified, 6 clearing" accent="red" trend={-18} />
        <StatCard icon={Clock3} label="Avg delay" value="45m" sub="Target under 30m" accent="amber" trend={-31} />
      </div>

      <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-5 mb-5">
        <div className="glass rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="eyebrow mb-2">Weekly flow</p>
              <h3 className="font-display text-2xl text-ivory-100">Deliveries vs disruptions</h3>
            </div>
            <Badge tone="gold">Sample data</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_FLOW}>
                <CartesianGrid stroke="rgba(201,169,110,0.08)" />
                <XAxis dataKey="day" stroke="#9c9585" />
                <YAxis stroke="#9c9585" />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="deliveries" stroke="#e8c987" fill="rgba(201,169,110,0.18)" strokeWidth={3} />
                <Area type="monotone" dataKey="disruptions" stroke="#f87171" fill="rgba(248,113,113,0.16)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <p className="eyebrow mb-2">Disruption mix</p>
          <h3 className="font-display text-2xl text-ivory-100 mb-5">Why routes fail</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Pie data={BLOCKAGE_MIX} dataKey="value" nameKey="name" innerRadius={68} outerRadius={108} paddingAngle={4}>
                  {BLOCKAGE_MIX.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
        <div className="glass rounded-3xl p-5">
          <p className="eyebrow mb-2">State status</p>
          <h3 className="font-display text-2xl text-ivory-100 mb-5">Road accessibility by state</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATE_STATS} layout="vertical" margin={{ left: 18 }}>
                <CartesianGrid stroke="rgba(201,169,110,0.08)" />
                <XAxis type="number" stroke="#9c9585" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" stroke="#9c9585" width={118} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="roadsOpen" fill="#c9a96e" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="eyebrow mb-2">Regional summary</p>
              <h3 className="font-display text-2xl text-ivory-100">Eight-state overview</h3>
            </div>
            <ShieldCheck className="w-6 h-6 text-gold-400" />
          </div>
          <table className="table-dark">
            <thead>
              <tr><th>State</th><th>Convoys</th><th>Roads open</th><th>Alerts</th><th>Status</th></tr>
            </thead>
            <tbody>
              {STATE_STATS.map((state) => (
                <tr key={state.name}>
                  <td>{state.name}</td>
                  <td>{state.convoys}</td>
                  <td>{state.roadsOpen}%</td>
                  <td>{state.alerts}</td>
                  <td><Badge status={state.status}>{state.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 mt-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="eyebrow mb-2">Impact targets</p>
          <h3 className="font-display text-2xl text-ivory-100">90% delivery success · &lt;30 min delay · ₹350 Cr annual savings</h3>
          <p className="text-sm text-ivory-500 mt-2">Project goals, not measured results.</p>
        </div>
        <Activity className="w-10 h-10 text-gold-400" />
      </div>
    </div>
  </PageShell>
);

export default StatisticsPage;