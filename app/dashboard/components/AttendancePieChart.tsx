import styles from '../dashboard.module.css';

export default function AttendancePieChart({ totalEvents, attendancePercent }: { totalEvents: number; attendancePercent: number }) {
  const attended = Math.round((attendancePercent / 100) * totalEvents);
  const missed = totalEvents - attended;
  const cx = 80;
  const cy = 80;
  const r = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * r;
  const attendedOffset = circumference * (1 - attendancePercent / 100);
  const missedPercent = 100 - attendancePercent;

  return (
    <div className={styles.pieChartContainer}>
      <div className={styles.pieChartHeader}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#2563eb" strokeWidth="1.5" />
          <path d="M8 4v4l2.5 2.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h2>Attendance Overview</h2>
      </div>
      <div className={styles.pieChartBody}>
        <div className={styles.svgWrapper}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eff6ff" strokeWidth={strokeWidth} />
            <circle
              cx={cx} cy={cy} r={r} fill="none"
              stroke="#2563eb" strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={attendedOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            {missedPercent > 0 && (
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke="#fca5a5" strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * missedPercent / 100} ${circumference}`}
                strokeDashoffset={-(circumference * attendancePercent / 100)}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            )}
            <text x={cx} y={cy - 8} textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="700" fontFamily="'Unbounded', sans-serif">
              {attendancePercent}%
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="'Kulim Park', sans-serif" letterSpacing="0.05em">
              ATTENDANCE
            </text>
          </svg>
        </div>
        <div className={styles.pieLegend}>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: '#2563eb' }} />
            <div className={styles.legendInfo}>
              <span className={styles.legendLabel}>Attended</span>
              <span className={styles.legendVal}>{attended} / {totalEvents}</span>
            </div>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: '#fca5a5' }} />
            <div className={styles.legendInfo}>
              <span className={styles.legendLabel}>Missed</span>
              <span className={styles.legendVal}>{missed} / {totalEvents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}