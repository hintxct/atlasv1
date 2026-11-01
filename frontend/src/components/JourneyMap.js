import React, { useEffect } from 'react';
import { CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';

const JourneyMap = ({ journey, onSelect }) => {
  const map = useMap();
  const selected = journey.routes.find((route) => route.id === journey.selectedId) || journey.routes[0];
  useEffect(() => {
    const points = [...selected.path, [...journey.from.coordinates].reverse(), [...journey.to.coordinates].reverse()];
    map.fitBounds(points, { padding: [36, 36], maxZoom: 14 });
  }, [map, selected, journey.from, journey.to]);
  return (
    <>
      {journey.routes.map((route) => (
        <Polyline key={route.id} positions={route.path} pathOptions={{ color: route.id === selected.id ? '#e8c987' : '#94a3b8', weight: route.id === selected.id ? 7 : 4, opacity: 0.9 }}
          eventHandlers={{ click: () => onSelect(route.id) }}>
          <Popup>{route.name}: {route.distanceKm} km · {route.eta}</Popup>
        </Polyline>
      ))}
      {[['A', journey.from, '#6ee7b7'], ['B', journey.to, '#e8c987']].map(([label, place, color]) => (
        <CircleMarker key={label} center={[place.coordinates[1], place.coordinates[0]]} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 }}>
          <Popup><strong>{label === 'A' ? 'From' : 'To'}: {place.label}</strong></Popup>
        </CircleMarker>
      ))}
    </>
  );
};
export default JourneyMap;