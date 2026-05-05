'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useEvents, Event } from './hooks/useEvents';
import EventGrid from './components/EventGrid/EventGrid';
import EventModal from './components/EventModal/EventModal';
import AdminTabBar from '../components/AdminTabBar';
import styles from './events.module.css';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const openCreate = () => { setEditingEvent(null); setIsModalOpen(true); };
  const openEdit   = (event: Event) => { setEditingEvent(event); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingEvent(null); };

  const handleSave = async (data: Partial<Event>) => {
    if (editingEvent) {
      await supabase.from('events').update(data).eq('id', editingEvent.id);
    } else {
      await supabase.from('events').insert([{ ...data, attendees_count: 0, status: 'upcoming' }]);
    }
    await fetchEvents();
  };

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

      <div className={styles.contentCard}>
        <h3 className={styles.cardTitle}>Scheduled Events</h3>
        <EventGrid
          events={filteredEvents}
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