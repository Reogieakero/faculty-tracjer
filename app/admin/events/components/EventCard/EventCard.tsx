'use client';

import { Calendar, MapPin, Users, Edit3, Trash2, ImageOff } from 'lucide-react';
import { Event } from '../../hooks/useEvents';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  return (
    <div className={styles.card}>
      {/* Banner */}
      <div className={styles.banner}>
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className={styles.bannerImg} />
        ) : (
          <div className={styles.bannerEmpty}>
            <ImageOff size={22} />
          </div>
        )}
        <span className={`${styles.statusPill} ${styles[event.status]}`}>
          {event.status}
        </span>
      </div>

      <div className={styles.body}>
        <h4 className={styles.title}>{event.title}</h4>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <Calendar size={14} />
            <span>{new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          {event.start_time && (
            <div className={styles.infoRow}>
              <span className={styles.timeChip}>{event.start_time}</span>
            </div>
          )}
          <div className={styles.infoRow}>
            <MapPin size={14} />
            <span>{event.location || 'No location set'}</span>
          </div>
          <div className={styles.infoRow}>
            <Users size={14} />
            <span>{event.attendees_count} Registered</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.editBtn} onClick={() => onEdit(event)}>
            <Edit3 size={14} /> Edit
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(event.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}