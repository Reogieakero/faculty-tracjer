'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import styles from './schedule.module.css';

const EVENT_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose'] as const;
type EventColor = typeof EVENT_COLORS[number];

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  day: number;
  program: string | null;
  color: EventColor;
}

export default function SchedulePage() {
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(5);
  const [showModal, setShowModal] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('students')
          .select('program')
          .eq('id', user.id)
          .single();

        const program = data?.program || null;
        setUserProgram(program);

        const mockEvents: CalendarEvent[] = [
          { id: 1, title: 'Physics Seminar', time: '10:30 AM', day: 5, program: 'All', color: 'blue' },
          { id: 2, title: 'Dept Meeting', time: '1:00 PM', day: 7, program: program, color: 'blue' },
          { id: 3, title: 'Lab Session', time: '2:00 PM', day: 12, program: 'All', color: 'blue' },
          { id: 4, title: 'Thesis Review', time: '9:00 AM', day: 19, program: program, color: 'blue' },
          { id: 5, title: 'Defense Prep', time: '3:30 PM', day: 22, program: 'All', color: 'blue' },
          { id: 6, title: 'Faculty Sync', time: '11:00 AM', day: 26, program: 'All', color: 'blue' },
        ];
        setEvents(mockEvents);
      }
    };
    fetchUserData();
  }, []);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayIndex = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const goToPrevMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectedEvents = events.filter(e => e.day === selectedDay);

  const handleDayClick = (day: number | null, dayEvents: CalendarEvent[]) => {
    if (!day) return;
    setSelectedDay(day);
    if (dayEvents.length > 0) {
      setShowModal(true);
    }
  };

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className={styles.wrapper}>
        <section className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}>
              <CalendarDays size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Academic Calendar</h1>
              <p className={styles.pageSubtitle}>
                {userProgram
                  ? `Viewing schedule for ${userProgram.toUpperCase()}`
                  : 'Loading program…'}
              </p>
            </div>
          </div>
          <div className={styles.pageHeaderRight}>
            <span className={styles.todayBadge}>Today — May 5, 2026</span>
          </div>
        </section>

        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthDisplay}>
              <span className={styles.monthName}>{monthName}</span>
              <span className={styles.yearLabel}>{year}</span>
            </div>
            <div className={styles.calendarControls}>
              <button className={styles.navBtn} onClick={goToPrevMonth}>
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button className={styles.navBtn} onClick={goToNextMonth}>
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className={styles.weekdayRow}>
            {daysOfWeek.map(day => (
              <div key={day} className={styles.weekdayLabel}>{day}</div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const dayEvents = events.filter(e => e.day === day);
              const isToday = day === 5;
              const isSelected = day === selectedDay;
              const isWeekend = ((index % 7) === 0) || ((index % 7) === 6);

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day, dayEvents)}
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
                          <div 
                            key={ev.id} 
                            className={`${styles.cellEventTitle} ${styles.text_blue}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.eventPanel}>
            <p className={styles.eventPanelTitle}>
              {selectedDay
                ? `Events — May ${selectedDay}`
                : 'Select a day to view events'}
            </p>
            <div className={styles.eventList}>
              {selectedEvents.length > 0
                ? selectedEvents.map(ev => (
                    <div key={ev.id} className={`${styles.eventRow} ${styles.eventRow_blue}`}>
                      <div className={`${styles.eventAccent} ${styles.accent_blue}`} />
                      <div className={styles.eventRowContent}>
                        <span className={styles.eventRowTitle}>{ev.title}</span>
                        <span className={styles.eventRowTime}>{ev.time}</span>
                      </div>
                    </div>
                  ))
                : (
                  <p className={styles.noEvents}>No events scheduled.</p>
                )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Events for May {selectedDay}</h3>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                {selectedEvents.map(ev => (
                  <div key={ev.id} className={`${styles.eventRow} ${styles.eventRow_blue}`}>
                    <div className={`${styles.eventAccent} ${styles.accent_blue}`} />
                    <div className={styles.eventRowContent}>
                      <span className={styles.eventRowTitle}>{ev.title}</span>
                      <span className={styles.eventRowTime}>{ev.time}</span>
                      <div className={styles.eventRowProgram}>Program: {ev.program}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}