import styles from './CTA.module.css';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.glow} />
          
          <span className={styles.pill}>
            <Sparkles size={14} /> Available for Liberal Arts
          </span>
          
          <h2 className={styles.title}>
            Ready to simplify your<br />attendance management?
          </h2>
          
          <p className={styles.subtitle}>
            Join the faculty and students already using PolyTrack. 
            Streamline your program today.
          </p>
          
          <div className={styles.actions}>
            <button className={styles.primaryBtn}>
              Register Account <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryBtn}>
              Read User Manual
            </button>
          </div>
          
          <p className={styles.footnote}>
            ✓ Student QR-ID System &nbsp;·&nbsp; ✓ Faculty Dashboard &nbsp;·&nbsp; ✓ Program Analytics
          </p>
        </div>
      </div>
    </section>
  );
}