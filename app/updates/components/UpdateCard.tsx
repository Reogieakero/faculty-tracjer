import { Calendar } from 'lucide-react';
import styles from '../updates.module.css';

interface UpdateCardProps {
  label: string;
  date: string;
  title: string;
  content: string;
}

export function UpdateCard({ label, date, title, content }: UpdateCardProps) {
  return (
    <div className={styles.updateCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={styles.categoryLabel}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
          <Calendar size={12} />
          <span style={{ fontSize: '11px' }}>{date}</span>
        </div>
      </div>
      <h3 className={styles.updateTitle}>{title}</h3>
      <p className={styles.content}>{content}</p>
    </div>
  );
}