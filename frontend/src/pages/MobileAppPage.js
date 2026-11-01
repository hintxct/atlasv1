import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeading from '../components/SectionHeading';
import Badge from '../components/Badge';
import { Camera, CloudOff, Download, Languages, MapPin, Mic, Satellite, ShieldCheck, Smartphone } from 'lucide-react';

const features = [
  { icon: CloudOff, title: 'Offline reports', text: 'Designed to save reports without a connection and sync when signal returns.' },
  { icon: Camera, title: 'Photo evidence', text: 'Capture road damage and clearances with a location and time.' },
  { icon: Mic, title: 'Voice notes', text: 'Describe a road problem with a short voice recording.' },
  { icon: Languages, title: 'Local languages', text: 'Read alerts in English, Hindi, Assamese, and other local languages.' },
];

const MobileAppPage = () => (
  <PageShell className="pt-24 pb-14 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Mobile app preview"
        title="Road reporting, wherever you are"
        sub="A preview of the field app. The Android download is not available yet."
      />

      <div className="grid lg:grid-cols-[.85fr_1.15fr] gap-6 items-center">
        <div className="glass-deep rounded-[2rem] p-5 max-w-sm mx-auto w-full">
          <div className="rounded-[1.65rem] border border-gold-500/20 bg-obsidian-950 p-4 min-h-[640px]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-display text-xl text-ivory-100">ATLAS Field</p>
                <p className="text-xs text-ivory-600">Offline queue: 3 reports</p>
              </div>
              <Smartphone className="w-5 h-5 text-gold-400" />
            </div>
            <div className="glass rounded-2xl p-4 mb-4">
              <Badge tone="red">Emergency</Badge>
              <h3 className="font-display text-2xl text-ivory-100 mt-4">Report Blockage</h3>
              <p className="text-xs text-ivory-500 mt-2">GPS locked · 25.60, 91.90 · Shillong Bypass</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {['Landslide', 'Flooding', 'Heavy Fog', 'Accident'].map((type) => (
                  <button key={type} className="btn-ghost !text-xs !px-2">{type}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                ['Photo', Camera], ['Voice note', Mic], ['GPS pin', MapPin], ['Sync when online', Satellite],
              ].map(([label, Icon]) => (
                <div key={label} className="rounded-2xl border border-gold-500/10 bg-white/[0.03] p-3 flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gold-400" />
                  <span className="text-sm text-ivory-300">{label}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 ml-auto" />
                </div>
              ))}
            </div>
            <button disabled className="btn-gold w-full mt-5 !py-3"><Download className="w-4 h-4" /> Android app coming soon</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((item) => (
            <div key={item.title} className="glass glass-hover rounded-3xl p-6">
              <item.icon className="w-8 h-8 text-gold-400 mb-5" />
              <h3 className="font-display text-xl text-ivory-100">{item.title}</h3>
              <p className="text-sm text-ivory-500 mt-2 leading-relaxed">{item.text}</p>
            </div>
          ))}
          <div className="glass rounded-3xl p-6 sm:col-span-2">
            <h3 className="font-display text-2xl text-ivory-100">Still in development</h3>
            <p className="text-sm text-ivory-500 mt-2 leading-relaxed">
              This preview shows the planned reporting experience. Mobile downloads and phone notifications are not available yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  </PageShell>
);

export default MobileAppPage;