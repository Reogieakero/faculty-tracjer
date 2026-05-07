import { useState } from 'react';
import styles from '../dashboard.module.css';

interface StatCardProps {
  label: string;
  val: string;
  icon: React.ReactNode;
  description: string;
  subLabel?: string;
  breakdown?: {
    allProgram: number;
    specificProgram: number;
    programLabel: string;
  };
}

export function FlippingStatCard({ label, val, icon, description, subLabel, breakdown }: StatCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`${styles.cardWrapper} ${isFlipped ? styles.flipped : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.statLabel}>
            {label}
            {icon}
          </div>
          <div className={styles.statValue}>{val}</div>
          {subLabel && (
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
              {subLabel}
            </div>
          )}
        </div>
        <div className={styles.cardBack}>
          <p>{description}</p>
          {breakdown && (
            <div className={styles.breakdownList}>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownDot} style={{ background: '#2563eb' }} />
                <span className={styles.breakdownText}>All Programs</span>
                <span className={styles.breakdownCount}>{breakdown.allProgram}</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownDot} style={{ background: '#0ea5e9' }} />
                <span className={styles.breakdownText}>{breakdown.programLabel}</span>
                <span className={styles.breakdownCount}>{breakdown.specificProgram}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}