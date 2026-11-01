import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeading from '../components/SectionHeading';
import { BrainCircuit, CloudRainWind, DatabaseZap, GitBranch, Map, RadioTower, ShieldCheck } from 'lucide-react';

const stack = [
  { icon: Map, title: 'Interactive map', text: 'Explore North-East India with Mapbox and view routes, vehicles, and road blockages.' },
  { icon: BrainCircuit, title: 'Route comparison', text: 'Compare distance, road conditions, and weather risks before choosing a route.' },
  { icon: RadioTower, title: 'Road reports', text: 'Keep track of reported blockages, clearances, and route changes.' },
  { icon: CloudRainWind, title: 'Weather risks', text: 'Review flood, fog, and landslide risks alongside your route.' },
  { icon: GitBranch, title: 'Delivery tracking', text: 'Manage deliveries from acceptance to completion.' },
  { icon: DatabaseZap, title: 'Team workspaces', text: 'Separate dashboards for drivers, field officials, and administrators.' },
];

const AboutPage = () => (
  <PageShell className="pt-24 pb-14 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="About ATLAS"
        title="Keeping North-East India connected"
        sub="Helping teams plan deliveries and respond to road disruptions."
      />
      <div className="glass-deep rounded-[2rem] p-8 mb-5">
        <ShieldCheck className="w-10 h-10 text-gold-400 mb-5" />
        <h3 className="font-display text-3xl text-ivory-100">Our purpose</h3>
        <p className="text-ivory-400 leading-relaxed mt-4">
          Help medicines, food, fuel, and other essential supplies reach communities across the eight North-Eastern states. ATLAS brings delivery planning and road reports together so teams can coordinate around blockages and delays.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stack.map((item) => (
          <div key={item.title} className="glass glass-hover rounded-3xl p-6">
            <item.icon className="w-8 h-8 text-gold-400 mb-5" />
            <h3 className="font-display text-xl text-ivory-100">{item.title}</h3>
            <p className="text-sm text-ivory-500 mt-2 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="glass rounded-3xl p-6 mt-5">
        <p className="eyebrow mb-3">About the data</p>
        <p className="text-sm text-ivory-500 leading-relaxed">
          The map uses Mapbox. Route, vehicle, weather, and alert previews currently use sample data and should not be used for live navigation or emergency decisions.
        </p>
      </div>
    </div>
  </PageShell>
);

export default AboutPage;