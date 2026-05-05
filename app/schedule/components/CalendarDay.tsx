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
            {dayEvents.map(ev => (
              <div key={ev.id} className={`${styles.cellEventTitle} ${styles.text_blue}`}>
                {ev.title}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}