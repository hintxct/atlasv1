import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import JourneyMap from './JourneyMap';
import { useMap } from 'react-leaflet';

jest.mock('react-leaflet', () => ({
  useMap: jest.fn(),
  CircleMarker: ({ center, children }) => <div data-center={JSON.stringify(center)}>{children}</div>,
  Polyline: ({ positions, children, eventHandlers }) => <button data-path={JSON.stringify(positions)} onClick={eventHandlers.click}>{children}</button>,
  Popup: ({ children }) => <span>{children}</span>,
}));

it('draws routes and endpoints and fits the selected road geometry', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  const root = createRoot(container);
  const fitBounds = jest.fn();
  useMap.mockReturnValue({ fitBounds });
  const select = jest.fn();
  const journey = {
    from: { label: 'Guwahati', coordinates: [91.75, 26.17] },
    to: { label: 'Shillong', coordinates: [91.89, 25.58] }, selectedId: 'r1',
    routes: [{ id: 'r1', name: 'Drive', path: [[26.17, 91.75], [25.58, 91.89]], distanceKm: 100, eta: '3 hr' }],
  };
  try {
    act(() => root.render(<JourneyMap journey={journey} onSelect={select} />));
    expect(fitBounds).toHaveBeenCalledWith(expect.arrayContaining(journey.routes[0].path), { padding: [36, 36], maxZoom: 14 });
    expect(container.querySelectorAll('[data-center]')).toHaveLength(2);
    expect(container.querySelector('[data-center]').getAttribute('data-center')).toBe('[26.17,91.75]');
    act(() => container.querySelector('button').click());
    expect(select).toHaveBeenCalledWith('r1');
  } finally {
    act(() => root.unmount());
    delete global.IS_REACT_ACT_ENVIRONMENT;
  }
});