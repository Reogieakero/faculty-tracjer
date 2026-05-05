'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useEvents, Event } from './hooks/useEvents';
import EventGrid from './components/EventGrid/EventGrid';
import EventModal from './components/EventModal/EventModal';
import AdminTabBar from '../components/AdminTabBar';
import styles from './events.module.css';

const PROGRAMS = [
  { id: 'All', label: 'All Programs' },
  { id: 'DevCom', label: 'BS Development Communication' },
  { id: 'Psych', label: 'BS Psychology' },
  { id: 'PolSci', label: 'AB Political Science' },
];

const STATUS_FILTERS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' }
];

export default function EventsAdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    filteredEvents,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchEvents,
    deleteEvent,
  } = useEvents();

  const [activeProgram, setActiveProgram] = useState('All');
  const [activeStatus, setActiveStatus] = useState('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const openCreate = () => { setEditingEvent(null); setIsModalOpen(true); };
  const openEdit = (event: Event) => { setEditingEvent(event); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingEvent(null); };

  const handleSave = async (data: Partial<Event>) => {
    if (editingEvent) {
      await supabase.from('events').update(data).eq('id', editingEvent.id);
    } else {
      await supabase.from('events').insert([{ ...data, attendees_count: 0, status: 'upcoming' }]);
    }
    await fetchEvents();
  };

  const finalFilteredEvents = filteredEvents.filter((event: any) => {
    const matchesProgram = activeProgram === 'All' || event.program === activeProgram;
    const matchesStatus = event.status === activeStatus;
    return matchesProgram && matchesStatus;
  });

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Event Management</h1>
          <p className={styles.subtitle}>Institutional Activities & Scheduling</p>
        </div>
        <div className={styles.topActions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.addBtn} onClick={openCreate}>
            <Plus size={18} /> Create Event
          </button>
        </div>
      </header>

      <div className={styles.filterSection}>
        <div className={styles.programContainer}>
          {PROGRAMS.map((prog) => (
            <button
              key={prog.id}
              className={`${styles.programBadge} ${activeProgram === prog.id ? styles.programBadgeActive : ''}`}
              onClick={() => setActiveProgram(prog.id)}
            >
              {prog.label}
            </button>
          ))}
        </div>

        <div className={styles.statusTabGroup}>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.id}
              className={`${styles.statusTab} ${activeStatus === status.id ? styles.statusTabActive : ''}`}
              onClick={() => setActiveStatus(status.id)}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.contentCard}>
        <h3 className={styles.cardTitle}>
          {STATUS_FILTERS.find(s => s.id === activeStatus)?.label} Events
        </h3>
        <EventGrid
          events={finalFilteredEvents}
          loading={loading}
          error={error}
          onEdit={openEdit}
          onDelete={deleteEvent}
        />
      </div>

      {isModalOpen && (
        <EventModal
          editingEvent={editingEvent}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      <AdminTabBar />
    </div>
  );
}