'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function DatePicker({ value, onChange, placeholder = 'Pick a date' }: DatePickerProps) {
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState({
    month: parsed ? parsed.getMonth() : today.getMonth(),
    year:  parsed ? parsed.getFullYear() : today.getFullYear(),
  });
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstDow    = new Date(cursor.year, cursor.month, 1).getDay();

  const prevMonth = () => setCursor(c => {
    const m = c.month === 0 ? 11 : c.month - 1;
    const y = c.month === 0 ? c.year - 1 : c.year;
    return { month: m, year: y };
  });

  const nextMonth = () => setCursor(c => {
    const m = c.month === 11 ? 0 : c.month + 1;
    const y = c.month === 11 ? c.year + 1 : c.year;
    return { month: m, year: y };
  });

  const selectDay = (day: number) => {
    const mm = String(cursor.month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${cursor.year}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const isSelected = (day: number) => {
    if (!parsed) return false;
    return parsed.getFullYear() === cursor.year &&
           parsed.getMonth()    === cursor.month &&
           parsed.getDate()     === day;
  };

  const isToday = (day: number) =>
    today.getFullYear() === cursor.year &&
    today.getMonth()    === cursor.month &&
    today.getDate()     === day;

  // Build grid cells: blanks + days
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={displayValue ? styles.triggerValue : styles.triggerPlaceholder}>
          {displayValue || placeholder}
        </span>
        <Calendar size={15} className={styles.triggerIcon} />
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.nav}>
            <button type="button" className={styles.navBtn} onClick={prevMonth}>
              <ChevronLeft size={15} />
            </button>
            <span className={styles.navLabel}>
              {MONTHS[cursor.month]} {cursor.year}
            </span>
            <button type="button" className={styles.navBtn} onClick={nextMonth}>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className={styles.grid}>
            {DAYS.map(d => (
              <span key={d} className={styles.dayName}>{d}</span>
            ))}
            {cells.map((day, i) =>
              day === null ? (
                <span key={`blank-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  className={`${styles.dayBtn}
                    ${isSelected(day) ? styles.selected : ''}
                    ${isToday(day) && !isSelected(day) ? styles.today : ''}
                  `}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}