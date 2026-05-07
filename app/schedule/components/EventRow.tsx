import styles from '../schedule.module.css';

export function EventRow({ title, time, program, showProgram }: any) {
  return (
    <div className={`${styles.eventRow} ${styles.eventRow_blue}`}>
      <div className={`${styles.eventAccent} ${styles.accent_blue}`} />
      <div className={styles.eventRowContent}>
        <span className={styles.eventRowTitle}>{title}</span>
        <span className={styles.eventRowTime}>{time}</span>
        {showProgram && program && (
          <div className={styles.eventRowProgram}>Program: {program}</div>
        )}
      </div>
    </div>
  );
}