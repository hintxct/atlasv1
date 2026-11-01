import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import PublicMapPage from './PublicMapPage';
import { EMERGENCY_PRIORITIES, LOCAL_LANGUAGE_ALERTS, ROUTE_OPTIONS, STATE_STATS } from '../data/mockData';
import { getDirections, searchPlaces } from '../services/mapbox';

jest.mock('../components/PageShell', () => ({ children }) => <div>{children}</div>);
jest.mock('../components/MapboxLayer', () => () => null);
jest.mock('../components/JourneyMap', () => () => <div data-testid="journey-map" />);
jest.mock('../services/mapbox', () => ({ searchPlaces: jest.fn(), getDirections: jest.fn() }));
jest.mock('react-hot-toast', () => ({ success: jest.fn() }));
jest.mock('react-leaflet', () => {
  const Wrapper = ({ children }) => <div>{children}</div>;
  return { MapContainer: Wrapper, CircleMarker: Wrapper, Marker: Wrapper, Polygon: Wrapper, Polyline: Wrapper, Popup: Wrapper };
});

describe('Public map controls', () => {
  let container;
  let root;
  const click = (element) => act(() => element.click());
  const button = (text) => [...container.querySelectorAll('button')].find((element) => element.textContent === text);

  beforeEach(() => {
    jest.clearAllMocks();
    searchPlaces.mockImplementation(async (query) => [{ id: query, name: query, label: `${query}, India`, coordinates: query === 'Guwahati' ? [91.75, 26.17] : [91.86, 27.58] }]);
    getDirections.mockResolvedValue([{ id: 'mapbox-0', name: 'Recommended drive', distanceKm: 400, eta: '10 hr', path: [[26.17, 91.75], [27.58, 91.86]], steps: [{ instruction: 'Head north', distance: '1 km' }] }]);
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<PublicMapPage />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete global.IS_REACT_ACT_ENVIRONMENT;
  });

  it('retains all route options and clearly labels sample data', () => {
    expect(container.querySelector('h1').textContent).toBe('NER route intelligence map');
    expect(container.textContent).not.toMatch(/sexy/i);
    expect(container.querySelectorAll('.route-result-card')).toHaveLength(ROUTE_OPTIONS.length);
    expect(container.textContent).toContain('sample data—not live navigation');
    expect(container.querySelector('#route-from').value).toBe('Guwahati');
    expect(container.querySelector('#route-to').value).toBe('Tawang');
  });

  it('shows the requested heading and separates planning, map, routes, and alerts', () => {
    expect(container.querySelector('h1').textContent).toBe('NER route intelligence map');
    expect(container.textContent).not.toMatch(/sexy/i);
    expect([...container.querySelector('.map-workspace').children].map((element) => element.tagName)).toEqual(['SECTION', 'SECTION', 'SECTION', 'SECTION']);
    expect(container.querySelector('.map-toolbar input').getAttribute('aria-label')).toBe('Search convoys and blockages');
    expect(container.querySelectorAll('.route-filters button')).toHaveLength(8);
    expect(container.querySelectorAll('.emergency-tile')).toHaveLength(EMERGENCY_PRIORITIES.length);
    STATE_STATS.forEach((state) => expect(container.querySelector('.map-support').textContent).toContain(state.name));
  });

  it('finds directions from the entered locations and preserves the alert language controls', async () => {
    click(button('Delivery'));
    await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(searchPlaces).toHaveBeenCalledWith('Guwahati', expect.any(AbortSignal));
    expect(searchPlaces).toHaveBeenCalledWith('Tawang', expect.any(AbortSignal));
    expect(getDirections).toHaveBeenCalled();
    expect(container.querySelector('.journey-summary').textContent).toContain('400 km');
    expect(container.querySelector('[data-testid="journey-map"]')).not.toBeNull();
    const language = LOCAL_LANGUAGE_ALERTS[1];
    click(button(language.short));
    expect(button(language.short).getAttribute('aria-pressed')).toBe('true');
    expect(container.textContent).toContain(`${language.label} notification preview`);
  });

  it('separates planning, map layers, route comparison, and supporting information', () => {
    expect(container.querySelector('.journey-planner #route-from')).not.toBeNull();
    expect(container.querySelector('.map-surface [aria-label="Map layers"]')).not.toBeNull();
    expect(container.querySelector('.map-surface [aria-label="Search convoys and blockages"]')).not.toBeNull();
    expect(container.querySelector('.route-comparison [aria-label="Sort routes"]')).not.toBeNull();
    expect(container.querySelectorAll('.route-options-grid .route-result-card')).toHaveLength(ROUTE_OPTIONS.length);
    expect(container.querySelector('.map-support .emergency-tile')).not.toBeNull();
  });

  it('shows search failures and allows a retry without pretending a sample is the requested route', async () => {
    getDirections.mockRejectedValueOnce(new Error('No driving route was found.'));
    const submit = () => container.querySelector('.journey-fields').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await act(async () => submit());
    expect(container.querySelector('[role="alert"]').textContent).toContain('No driving route');
    expect(container.querySelector('.journey-summary')).toBeNull();
    await act(async () => submit());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    click(container.querySelector('.route-result-card'));
    expect(container.querySelector('.journey-summary')).toBeNull();
    expect(container.querySelector('.command-card')).not.toBeNull();
  });

  it('sorts by distance and selects a route without losing other options', () => {
    click(button('Shortest'));
    const shortest = [...ROUTE_OPTIONS].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    expect(container.querySelector('.route-result-card').textContent).toContain(shortest.name);
    click(container.querySelector('.route-result-card'));
    expect(container.querySelector('.command-card').textContent).toContain(shortest.name);
    expect(button('Shortest').getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps map layers independently toggleable', () => {
    const trucks = button(' Trucks');
    expect(trucks.getAttribute('aria-pressed')).toBe('true');
    click(trucks);
    expect(trucks.getAttribute('aria-pressed')).toBe('false');
    expect(button(' Weather').getAttribute('aria-pressed')).toBe('true');
    click(trucks);
    expect(trucks.getAttribute('aria-pressed')).toBe('true');
  });

  it('preserves emergency selection and the safest-route filter', () => {
    click(container.querySelector('.emergency-tile'));
    expect(button('Emergency').getAttribute('aria-pressed')).toBe('true');
    expect(button('Safest').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.command-card').textContent).toContain('Emergency preview');
  });
});