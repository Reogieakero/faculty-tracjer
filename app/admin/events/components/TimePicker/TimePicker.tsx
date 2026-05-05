'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import styles from './TimePicker.module.css';

interface TimePickerProps {
  value: string; // 'HH:MM' 24-hr
  onChange: (value: string) => void;
  placeholder?: string;
}

function parse(value: string) {
  if (!value) return { hour: 12, minute: 0, period: 'AM' as 'AM' | 'PM' };
  const [h, m] = value.split(':').map(Number);
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { hour, minute: m, period };
}

function to24(hour: number, minute: number, period: 'AM' | 'PM') {
  let h = hour % 12;
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatDisplay(value: string) {
  if (!value) return '';
  const { hour, minute, period } = parse(value);
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

const HOURS   = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function ScrollColumn<T extends number | string>({
  items,
  selected,
  onSelect,
  format,
}: {
  items: T[];
  selected: T;
  onSelect: (v: T) => void;
  format?: (v: T) => string;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (listRef.current && idx >= 0) {
      const item = listRef.current.children[idx] as HTMLElement;
      item?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [selected, items]);

  return (
    <ul className={styles.column} ref={listRef}>
      {items.map((item) => (
        <li
          key={String(item)}
          className={`${styles.item} ${item === selected ? styles.itemActive : ''}`}
          onClick={() => onSelect(item)}
        >
          {format ? format(item) : String(item)}
        </li>
      ))}
    </ul>
  );
}

export default function TimePicker({ value, onChange, placeholder = 'Pick a time' }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const { hour: initH, minute: initM, period: initP } = parse(value);
  const [hour,   setHour]   = useState(initH);
  const [minute, setMinute] = useState(initM);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initP);
  const ref = useRef<HTMLDivElement>(null);

  // Sync internal state when value prop changes
  useEffect(() => {
    const { hour: h, minute: m, period: p } = parse(value);
    setHour(h); setMinute(m); setPeriod(p);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const commit = (h: number, m: number, p: 'AM' | 'PM') => {
    onChange(to24(h, m, p));
  };

  const handleHour = (h: number)          => { setHour(h);   commit(h, minute, period); };
  const handleMin  = (m: number)          => { setMinute(m); commit(hour, m, period); };
  const handlePer  = (p: 'AM' | 'PM')    => { setPeriod(p); commit(hour, minute, p); };

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Clock size={15} className={styles.triggerIcon} />
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.scrollArea}>
            <ScrollColumn
              items={HOURS}
              selected={hour}
              onSelect={handleHour}
              format={(v) => String(v)}
            />
            <div className={styles.colon}>:</div>
            <ScrollColumn
              items={MINUTES}
              selected={minute}
              onSelect={handleMin}
              format={(v) => String(v).padStart(2, '0')}
            />
            <ScrollColumn
              items={['AM', 'PM'] as ('AM' | 'PM')[]}
              selected={period}
              onSelect={handlePer}
            />
          </div>
          <div className={styles.highlight} />
        </div>
      )}
    </div>
  );
}