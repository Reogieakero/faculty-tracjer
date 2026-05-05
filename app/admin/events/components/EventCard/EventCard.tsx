'use client';

import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Edit3, Trash2, ImageOff, Clock, ExternalLink } from 'lucide-react';
import { Event } from '../../hooks/useEvents';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const router = useRouter();

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  const handleReadMore = () => {
    router.push(`/admin/events/${event.id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.banner}>
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className={styles.bannerImg} />
        ) : (
          <div className={styles.bannerEmpty}>
            <ImageOff size={24} />
          </div>
        )}
        <div className={`${styles.statusPill} ${styles[event.status]}`}>
          {event.status}
        </div>
      </div>

      <div className={styles.body}>
        <h4 className={styles.title}>{event.title}</h4>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <div className={styles.iconWrapper}>
              <Calendar size={14} />
            </div>
            <span>{formattedDate}</span>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.iconWrapper}>
              <Clock size={14} />
            </div>
            <span>{event.start_time || '--:--'}</span>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.iconWrapper}>
              <Users size={14} />
            </div>
            <span>{event.attendees_count}</span>
          </div>

          <div className={`${styles.infoRow} ${styles.fullWidth}`}>
            <div className={styles.iconWrapper}>
              <MapPin size={14} />
            </div>
            <span className={styles.locationText}>
              {event.location || 'Remote / TBD'}
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.readMoreBtn} onClick={handleReadMore}>
            <ExternalLink size={16} /> Read More
          </button>
          <button className={styles.editBtn} onClick={() => onEdit(event)}>
            <Edit3 size={16} />
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(event.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}