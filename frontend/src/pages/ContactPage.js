import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeading from '../components/SectionHeading';
import Badge from '../components/Badge';
import { Headphones, Mail, MapPin, Phone, RadioTower, Send } from 'lucide-react';

const ContactPage = () => (
  <PageShell className="pt-24 pb-14 px-4 sm:px-6">
    <div className="max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="Contact"
        title="Logistics support"
        sub="Support page preview. The contact details below are examples, not active emergency services."
      />
      <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
        <div className="space-y-4">
          {[
            { icon: Phone, label: '24×7 Helpline', value: '1800-NE-ATLAS' },
            { icon: Mail, label: 'Email', value: 'support@ne-logistics.gov.in' },
            { icon: MapPin, label: 'Regional office', value: 'Shillong / Guwahati' },
            { icon: RadioTower, label: 'Emergency radio', value: 'Not connected' },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-5 flex items-start gap-4">
              <item.icon className="w-6 h-6 text-gold-400 mt-1" />
              <div>
                <p className="text-xs text-ivory-600 uppercase tracking-[.2em] font-mono">{item.label}</p>
                <p className="text-ivory-100 mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="glass-deep rounded-3xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl text-ivory-100">Send a message</h3>
            </div>
            <Badge tone="gold">Preview</Badge>
          </div>
          <div className="space-y-4">
            <input className="input-dark" aria-label="Your name" placeholder="Your name" />
            <input className="input-dark" aria-label="Phone or email" placeholder="Phone / email" />
            <select className="input-dark" aria-label="Issue type"><option>Road blockage</option><option>Delivery delay</option><option>Driver support</option><option>Admin access</option></select>
            <textarea className="input-dark min-h-[130px]" aria-label="Describe the issue" placeholder="Describe the issue..." />
            <button disabled className="btn-gold w-full !py-3"><Send className="w-4 h-4" /> Messaging coming soon</button>
          </div>
          <div className="mt-6 rounded-2xl border border-gold-500/10 bg-black/20 p-4 flex gap-3">
            <Headphones className="w-5 h-5 text-gold-400 shrink-0" />
            <p className="text-xs text-ivory-500 leading-relaxed">Messages cannot be sent from this preview. For urgent help, contact your local emergency services.</p>
          </div>
        </div>
      </div>
    </div>
  </PageShell>
);

export default ContactPage;