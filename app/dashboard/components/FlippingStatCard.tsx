import { useState } from 'react';
import styles from '../dashboard.module.css';

interface StatCardProps {
  label: string;
  val: string;
  icon: React.ReactNode;
  description: string;
}

export function FlippingStatCard({ label, val, icon, description }: StatCardProps) {
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
        </div>
        <div className={styles.cardBack}>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}