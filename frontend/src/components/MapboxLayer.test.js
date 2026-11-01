import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { TileLayer } from 'react-leaflet';
import MapboxLayer from './MapboxLayer';

jest.mock('react-leaflet', () => ({ TileLayer: jest.fn(() => null) }));

describe('Mapbox basemap', () => {
  let container;
  let root;
  const originalToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const tileProps = () => TileLayer.mock.calls[TileLayer.mock.calls.length - 1][0];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    process.env.REACT_APP_MAPBOX_ACCESS_TOKEN = 'pk.test-token';
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.useRealTimers();
    if (originalToken === undefined) delete process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    else process.env.REACT_APP_MAPBOX_ACCESS_TOKEN = originalToken;
    delete global.IS_REACT_ACT_ENVIRONMENT;
  });

  const render = () => act(() => root.render(<MapboxLayer />));

  it('uses the configured token, dark style, tile alignment, and required attribution', () => {
    render();
    expect(tileProps().url).toContain('/mapbox/dark-v11/tiles/512/{z}/{x}/{y}@2x?access_token=pk.test-token');
    expect(tileProps().tileSize).toBe(512);
    expect(tileProps().zoomOffset).toBe(-1);
    expect(tileProps().attribution).toContain('Mapbox');
    expect(tileProps().attribution).toContain('OpenStreetMap');
    expect(tileProps().attribution).toContain('Improve this map');
    expect(container.querySelector('img').getAttribute('src')).toContain('/assets/mapbox-logo.svg');
    expect(container.textContent).toContain('Loading map');
    act(() => tileProps().eventHandlers.load());
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('keeps a tile error visible after load and lets the user retry', () => {
    render();
    act(() => {
      tileProps().eventHandlers.tileerror();
      tileProps().eventHandlers.load();
    });
    expect(container.textContent).toContain('Map tiles could not load');
    act(() => container.querySelector('button').click());
    expect(container.textContent).toContain('Loading map');
    act(() => tileProps().eventHandlers.load());
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('offers a retry when the tile request stalls', () => {
    render();
    act(() => jest.advanceTimersByTime(15000));
    expect(container.querySelector('button').textContent).toBe('Retry map');
  });

  it('does not request tiles without an access token', () => {
    delete process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    render();
    expect(TileLayer).not.toHaveBeenCalled();
    expect(container.textContent).toContain('A Mapbox access token is required');
  });
});