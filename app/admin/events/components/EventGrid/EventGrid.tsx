'use client';

import { Loader2, Inbox } from 'lucide-react';
import { Event } from '../../hooks/useEvents';
import EventCard from '../EventCard/EventCard';
import styles from './EventGrid.module.css';

interface EventGridProps {
  events: Event[];
  loading: boolean;
  error: string | null;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventGrid({ events, loading, error, onEdit, onDelete }: EventGridProps) {
  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Fetching events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stateContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.stateContainer}>
        <Inbox size={40} />
        <p>No events scheduled</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}