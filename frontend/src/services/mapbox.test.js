import { formatDuration, getDirections, searchPlaces } from './mapbox';

describe('Mapbox location and direction requests', () => {
  const originalFetch = global.fetch;
  const originalToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  beforeEach(() => {
    process.env.REACT_APP_MAPBOX_ACCESS_TOKEN = 'pk.test';
    global.fetch = jest.fn();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    else process.env.REACT_APP_MAPBOX_ACCESS_TOKEN = originalToken;
  });
  it('searches India with the typed location and returns usable coordinates', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ features: [{ id: 'guwahati', properties: { name: 'Guwahati', full_address: 'Guwahati, Assam, India' }, geometry: { coordinates: [91.75, 26.17] } }] }) });
    const places = await searchPlaces('Guwahati');
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get('q')).toBe('Guwahati');
    expect(url.searchParams.get('country')).toBe('in');
    expect(places[0].coordinates).toEqual([91.75, 26.17]);
  });
  it('uses entered coordinates and converts GeoJSON longitude/latitude to Leaflet latitude/longitude', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ code: 'Ok', routes: [{ distance: 100500, duration: 3660, geometry: { coordinates: [[91.75, 26.17], [91.89, 25.58]] }, legs: [{ summary: 'NH 6', steps: [{ maneuver: { instruction: 'Turn left' }, distance: 400 }] }] }] }) });
    const result = await getDirections({ coordinates: [91.75, 26.17] }, { coordinates: [91.89, 25.58] });
    expect(fetch.mock.calls[0][0]).toContain('/91.75,26.17;91.89,25.58?');
    expect(result[0].path[0]).toEqual([26.17, 91.75]);
    expect(result[0].eta).toBe('1 hr 1 min');
    expect(result[0].distanceKm).toBe(100.5);
    expect(result[0].steps[0].instruction).toBe('Turn left');
  });
  it('rejects identical endpoints before requesting directions', async () => {
    await expect(getDirections({ coordinates: [91, 26] }, { coordinates: [91, 26] })).rejects.toThrow('different');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('reports no route and authorization failures clearly', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ code: 'NoRoute', routes: [] }) });
    await expect(getDirections({ coordinates: [91, 26] }, { coordinates: [92, 27] })).rejects.toThrow('No driving route');
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(searchPlaces('Guwahati')).rejects.toThrow('authorize');
  });
  it('formats short and long estimates without claiming live traffic', () => {
    expect(formatDuration(30)).toBe('1 min');
    expect(formatDuration(7200)).toBe('2 hr');
  });
});