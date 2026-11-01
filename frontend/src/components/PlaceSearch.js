import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { searchPlaces } from '../services/mapbox';

const PlaceSearch = ({ id, label, value, selected, onChange, onSelect, disabled }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('');
  const input = useRef(null);

  useEffect(() => {
    setItems([]);
    setActive(-1);
    setStatus('');
    if (!open || selected || value.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('Searching places…');
      try {
        const places = await searchPlaces(value, controller.signal);
        if (controller.signal.aborted) return;
        setItems(places);
        setStatus(places.length ? '' : 'No places found. Try a town, street, or address.');
      } catch (error) {
        if (!controller.signal.aborted) setStatus(error.message);
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value, selected, open]);

  const select = (place) => {
    onSelect(place);
    setOpen(false);
    input.current?.focus();
  };
  const keyDown = (event) => {
    if (event.key === 'Escape') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (items.length) setActive((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
    }
    if (event.key === 'Enter' && open && active >= 0 && items[active]) {
      event.preventDefault();
      select(items[active]);
    }
  };
  const expanded = open && !selected && (items.length > 0 || !!status);
  return (
    <div className="place-search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <label className="label-dark" htmlFor={id}>{label}</label>
      <input ref={input} id={id} className="input-dark" role="combobox" autoComplete="off" aria-autocomplete="list"
        aria-expanded={!!expanded} aria-controls={`${id}-options`} aria-activedescendant={expanded && active >= 0 ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-hint`} value={value} disabled={disabled} required placeholder="Town, street, or address"
        onFocus={() => setOpen(true)} onKeyDown={keyDown} onChange={(event) => { onChange(event.target.value); setOpen(true); }} />
      <span id={`${id}-hint`} className="sr-only">Search locations in India. Use arrow keys to choose a suggestion, then Enter.</span>
      {expanded && (
        <div className="place-suggestions">
          <ul id={`${id}-options`} role="listbox" aria-label={`${label} suggestions`}>
            {items.map((place, index) => (
              <li key={place.id} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
                onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => select(place)}>
                <MapPin className="w-4 h-4 shrink-0" /><span>{place.label}</span>
              </li>
            ))}
          </ul>
          {status && <p role="status" className="p-4 text-sm text-ivory-400">{status}</p>}
          <p className="place-attribution">Search by Mapbox</p>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;