import React from 'react';

const JourneySummary = ({ journey, onSelect, onClear }) => {
  const selected = journey.routes.find((route) => route.id === journey.selectedId) || journey.routes[0];
  return (
    <div className="journey-summary" aria-live="polite">
      <div className="section-toolbar">
        <div>
          <p className="eyebrow">Mapbox driving directions</p>
          <h2 className="text-2xl text-ivory-100 mt-2">{journey.from.name} → {journey.to.name}</h2>
        </div>
        <button className="btn-ghost" onClick={onClear}>Back to sample routes</button>
      </div>
      <p className="text-sm text-ivory-400 mt-3">A · {journey.from.label}<br />B · {journey.to.label}</p>
      <div className="driving-route-options">
        {journey.routes.map((route) => (
          <button key={route.id} className="driving-route-card" aria-pressed={selected.id === route.id} onClick={() => onSelect(route.id)}>
            <strong>{route.name}</strong>
            <span className="driving-route-time">{route.eta} · {route.distanceKm} km</span>
            {route.via && <span className="text-sm text-ivory-400">Via {route.via}</span>}
          </button>
        ))}
      </div>
      <p className="text-sm text-ivory-400 mt-4">Driving estimates, not live GPS navigation. Confirm road access, permits, and vehicle restrictions. Sample hazards below do not alter these directions.</p>
      <details className="driving-steps">
        <summary>Step-by-step directions ({selected.steps.length})</summary>
        <ol>{selected.steps.map((step, index) => <li key={index}><span>{index + 1}. {step.instruction}</span><small>{step.distance}</small></li>)}</ol>
      </details>
    </div>
  );
};
export default JourneySummary;