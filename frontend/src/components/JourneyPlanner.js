import React, { useEffect, useRef, useState } from 'react';
import { GitBranch } from 'lucide-react';
import PlaceSearch from './PlaceSearch';
import { getDirections, searchPlaces } from '../services/mapbox';

const JourneyPlanner = ({ onJourney, onClear, resetVersion }) => {
  const [from, setFrom] = useState({ text: 'Guwahati', place: null });
  const [to, setTo] = useState({ text: 'Tawang', place: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(null);

  useEffect(() => {
    request.current?.abort();
    setLoading(false);
    setError('');
    return () => request.current?.abort();
  }, [resetVersion]);

  const change = (setter, value) => {
    request.current?.abort();
    setLoading(false);
    setError('');
    setter(value);
    onClear();
  };
  const submit = async (event) => {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setError('');
    onClear();
    if (!from.text.trim() || !to.text.trim()) { setError('Enter both a starting location and a destination.'); return; }
    setLoading(true);
    try {
      const resolve = async (field, label) => {
        const place = field.place || (await searchPlaces(field.text, controller.signal))[0];
        if (!place) throw new Error(`${label} location was not found. Try a town, street, or address.`);
        return place;
      };
      const [start, end] = await Promise.all([resolve(from, 'Starting'), resolve(to, 'Destination')]);
      const routes = await getDirections(start, end, controller.signal);
      if (controller.signal.aborted) return;
      setFrom({ text: start.label, place: start });
      setTo({ text: end.label, place: end });
      onJourney({ from: start, to: end, routes, selectedId: routes[0].id });
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  return (
    <>
      <form onSubmit={submit} className="journey-fields" aria-busy={loading}>
        <PlaceSearch id="route-from" label="From" value={from.text} selected={from.place}
          onChange={(text) => change(setFrom, { text, place: null })} onSelect={(place) => change(setFrom, { text: place.label, place })} />
        <PlaceSearch id="route-to" label="To" value={to.text} selected={to.place}
          onChange={(text) => change(setTo, { text, place: null })} onSelect={(place) => change(setTo, { text: place.label, place })} />
        <button type="submit" className="btn-gold self-end" disabled={loading}>
          <GitBranch className="w-5 h-5" />{loading ? 'Finding route…' : 'Get directions'}
        </button>
      </form>
      {error && <p role="alert" className="journey-error">{error}</p>}
      {loading && <p role="status" className="text-sm text-ivory-400 mt-4">Finding your locations and calculating road directions…</p>}
    </>
  );
};

export default JourneyPlanner;