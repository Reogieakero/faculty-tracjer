import styles from '../schedule.module.css';

interface DayProps {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  dayEvents: any[];
  onClick: () => void;
}

export function CalendarDay({ day, isToday, isSelected, isWeekend, dayEvents, onClick }: DayProps) {
  // Show up to 2 events in the cell; the rest are summarised with "+N more"
  const MAX_VISIBLE = 2;
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
  const hiddenCount = dayEvents.length - MAX_VISIBLE;

  return (
    <div
      onClick={onClick}
      className={[
        styles.dayCell,
        !day ? styles.empty : '',
        isToday ? styles.today : '',
        isSelected && !isToday ? styles.selected : '',
        isWeekend && day ? styles.weekend : '',
      ].join(' ')}
    >
      {day && (
        <>
          <span className={styles.dayNumber}>{day}</span>
          <div className={styles.cellEventList}>
            {visibleEvents.map(ev => (
              <div key={ev.id} className={`${styles.cellEventTitle} ${styles.text_blue}`}>
                {ev.title}
              </div>
            ))}
            {hiddenCount > 0 && (
              <span className={styles.cellMoreBadge}>+{hiddenCount} more</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}