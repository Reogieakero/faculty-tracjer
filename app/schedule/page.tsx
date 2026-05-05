'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { useAcademicCalendar } from './hooks/useAcademicCalendar';
import { CalendarDay } from './components/CalendarDay';
import { EventRow } from './components/EventRow';
import styles from './schedule.module.css';

export default function SchedulePage() {
  const { 
    userProgram, 
    currentDate, 
    setCurrentDate, 
    events, 
    calendarDays, 
    monthName, 
    year, 
    loading 
  } = useAcademicCalendar();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  if (loading) return null;

  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  const todayDate = today.getDate();

  const selectedEvents = events.filter(e => e.day === selectedDay);

  const handleDayClick = (day: number | null, count: number) => {
    if (!day) return;
    setSelectedDay(day);
    if (count > 0) setShowModal(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className={styles.wrapper}>
        <section className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}><CalendarDays size={20} /></div>
            <div>
              <h1 className={styles.pageTitle}>Academic Calendar</h1>
              <p className={styles.pageSubtitle}>
                {userProgram ? `Viewing for ${userProgram}` : 'General Schedule'}
              </p>
            </div>
          </div>
          <span className={styles.todayBadge}>
            Today — {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </section>

        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthDisplay}>
              <span className={styles.monthName}>{monthName}</span>
              <span className={styles.yearLabel}>{year}</span>
            </div>
            <div className={styles.calendarControls}>
              <button className={styles.navBtn} onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className={styles.navBtn} onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className={styles.weekdayLabel}>{d}</div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter(e => e.day === day);
              return (
                <CalendarDay 
                  key={i} 
                  day={day} 
                  isToday={isCurrentMonth && day === todayDate} 
                  isSelected={day === selectedDay} 
                  isWeekend={i % 7 === 0 || i % 7 === 6}
                  dayEvents={dayEvents}
                  onClick={() => handleDayClick(day, dayEvents.length)}
                />
              );
            })}
          </div>

          <div className={styles.eventPanel}>
            <p className={styles.eventPanelTitle}>
              {selectedDay ? `Events — ${monthName} ${selectedDay}` : 'Select a day with events'}
            </p>
            <div className={styles.eventList}>
              {selectedEvents.length > 0 ? (
                selectedEvents.map(ev => <EventRow key={ev.id} {...ev} />)
              ) : (
                <p className={styles.noEventsText}>No events scheduled for this date.</p>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Events for {monthName} {selectedDay}</h3>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                {selectedEvents.map(ev => (
                  <EventRow key={ev.id} {...ev} showProgram />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}