import styles from '../attendance.module.css';

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
}

export function StatCard({ value, label, icon, colorClass }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[colorClass]}`}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}