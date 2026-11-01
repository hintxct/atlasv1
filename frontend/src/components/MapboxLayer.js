import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TileLayer } from 'react-leaflet';

const attribution = '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener noreferrer">Improve this map</a>';

const MapboxLayer = () => {
  const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const [status, setStatus] = useState(token ? 'loading' : 'missing');
  const [attempt, setAttempt] = useState(0);
  const tileFailed = useRef(false);

  useEffect(() => {
    if (status !== 'loading') return undefined;
    const timeout = setTimeout(() => setStatus('error'), 15000);
    return () => clearTimeout(timeout);
  }, [status, attempt]);

  const eventHandlers = useMemo(() => ({
    loading: () => {
      tileFailed.current = false;
      setStatus('loading');
    },
    tileerror: () => {
      tileFailed.current = true;
      setStatus('error');
    },
    load: () => setStatus(tileFailed.current ? 'error' : 'ready'),
  }), []);

  const retry = () => {
    tileFailed.current = false;
    setStatus('loading');
    setAttempt((current) => current + 1);
  };

  return (
    <>
      {token && (
        <TileLayer
          key={attempt}
          url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/512/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(token)}`}
          attribution={attribution}
          tileSize={512}
          zoomOffset={-1}
          minZoom={1}
          maxZoom={20}
          eventHandlers={eventHandlers}
        />
      )}
      <a className="mapbox-logo" href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" aria-label="Mapbox" onClick={(event) => event.stopPropagation()}>
        <img src={`${process.env.PUBLIC_URL}/assets/mapbox-logo.svg`} alt="Mapbox" width="100" height="25" />
      </a>
      {status !== 'ready' && (
        <div className="map-status glass-deep" role="status" aria-live="polite" onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
          <span>
            {status === 'loading' ? 'Loading map…' : status === 'missing' ? 'Map unavailable. A Mapbox access token is required.' : 'Map tiles could not load. Check your connection and try again.'}
          </span>
          {status === 'error' && <button type="button" onClick={retry} className="btn-ghost">Retry map</button>}
        </div>
      )}
    </>
  );
};

export default MapboxLayer;