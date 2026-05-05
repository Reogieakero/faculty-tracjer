'use client';

import { useState, useRef, useEffect } from 'react';
import { GraduationCap, ChevronDown, Check } from 'lucide-react';
import styles from './ProgramSelect.module.css';

export const PROGRAMS = [
  { id: 'All',     label: 'All Programs',                 abbr: 'ALL' },
  { id: 'DevCom', label: 'BS Development Communication',  abbr: 'DevCom' },
  { id: 'Psych',  label: 'BS Psychology',                 abbr: 'Psych' },
  { id: 'PolSci', label: 'AB Political Science',          abbr: 'PolSci' },
];

interface ProgramSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProgramSelect({ value, onChange }: ProgramSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = PROGRAMS.find((p) => p.id === value) ?? PROGRAMS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.triggerLeft}>
          <span className={styles.abbr}>{selected.abbr}</span>
          <span className={styles.label}>{selected.label}</span>
        </span>
        <ChevronDown
          size={15}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        />
      </button>

      {open && (
        <div className={styles.popover}>
          {PROGRAMS.map((p) => {
            const isActive = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                onClick={() => handleSelect(p.id)}
              >
                <span className={styles.optionLeft}>
                  <span className={`${styles.optionAbbr} ${isActive ? styles.optionAbbrActive : ''}`}>
                    {p.abbr}
                  </span>
                  <span className={styles.optionLabel}>{p.label}</span>
                </span>
                {isActive && <Check size={14} className={styles.checkIcon} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}