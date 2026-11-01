const BASE = 'https://api.mapbox.com';

const request = async (path, params, signal) => {
  const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('Mapbox is not configured. Add the access token and restart the app.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 20000);
  try {
    const response = await fetch(`${BASE}${path}?${new URLSearchParams({ ...params, access_token: token })}`, { signal: controller.signal });
    if (!response.ok) {
      if ([401, 403].includes(response.status)) throw new Error('Mapbox could not authorize this request. Check the access token permissions.');
      if (response.status === 429) throw new Error('Too many map searches. Please wait a moment and try again.');
      throw new Error('The map service is unavailable. Please try again.');
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error.name === 'AbortError') throw new Error('The map search timed out. Check your connection and try again.');
    if (error instanceof TypeError) throw new Error('Unable to reach Mapbox. Check your internet connection.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
};

export const searchPlaces = async (query, signal) => {
  if (query.trim().length < 2) return [];
  const data = await request('/search/geocode/v6/forward', {
    q: query.trim(), country: 'in', proximity: '92.8,25.9', limit: '5',
    autocomplete: 'true', language: 'en', types: 'place,locality,neighborhood,address,street',
  }, signal);
  return (data.features || []).filter((feature) => feature.geometry?.coordinates?.length === 2).map((feature) => ({
    id: feature.properties.mapbox_id || feature.id,
    name: feature.properties.name,
    label: feature.properties.full_address || [feature.properties.name, feature.properties.place_formatted].filter(Boolean).join(', '),
    coordinates: feature.geometry.coordinates,
  }));
};

export const formatDuration = (seconds) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
};

export const getDirections = async (from, to, signal) => {
  if (from.coordinates.every((value, index) => Math.abs(value - to.coordinates[index]) < 0.00001)) {
    throw new Error('Choose different starting and destination locations.');
  }
  const coordinates = `${from.coordinates.join(',')};${to.coordinates.join(',')}`;
  const data = await request(`/directions/v5/mapbox/driving/${coordinates}`, {
    alternatives: 'true', geometries: 'geojson', overview: 'full', steps: 'true', language: 'en',
  }, signal);
  if (data.code === 'NoRoute' || data.code === 'NoSegment' || !data.routes?.length) {
    throw new Error('No driving route was found between these places. Try a nearby town or road.');
  }
  if (data.code !== 'Ok') throw new Error('Directions could not be calculated. Try another location.');
  return data.routes.map((route, index) => ({
    id: `mapbox-${index}`, name: index === 0 ? 'Recommended drive' : `Alternative ${index}`,
    distanceKm: Math.round(route.distance / 100) / 10,
    duration: route.duration, eta: formatDuration(route.duration),
    path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    via: route.legs.map((leg) => leg.summary).filter(Boolean).join(' · '),
    steps: route.legs.flatMap((leg) => leg.steps || []).map((step) => ({
      instruction: step.maneuver?.instruction || `Continue on ${step.name || 'the road'}`,
      distance: step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`,
    })),
  }));
};