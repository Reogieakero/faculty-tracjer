'use client';

import { useState } from 'react';
import { X, Type, Calendar, Clock, GraduationCap, MapPin, AlignLeft, ImageIcon, KeyRound, RefreshCw } from 'lucide-react';
import { Event } from '../../hooks/useEvents';
import DatePicker from '../DatePicker/DatePicker';
import TimePicker from '../TimePicker/TimePicker';
import ProgramSelect from '../ProgramSelect/ProgramSelect';
import ImageUpload from '../ImageUpload/ImageUpload';
import styles from './EventModal.module.css';

interface EventModalProps {
  editingEvent?: Event | null;
  onClose: () => void;
  onSave: (data: Partial<Event>) => Promise<void>;
}

function generatePassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function EventModal({ editingEvent, onClose, onSave }: EventModalProps) {
  const [form, setForm] = useState({
    title:                    editingEvent?.title                    ?? '',
    event_date:               editingEvent?.event_date               ?? '',
    start_time:               editingEvent?.start_time               ?? '',
    program:                  editingEvent?.program                  ?? 'All',
    location:                 editingEvent?.location                 ?? '',
    description:              editingEvent?.description              ?? '',
    image_url:                editingEvent?.image_url                ?? null as string | null,
    scanner_password:         editingEvent?.scanner_password         ?? generatePassword(),
    scanner_password_visible: editingEvent?.scanner_password_visible ?? false,
  });
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingEvent;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className={styles.subtitle}>
              {isEditing ? 'Update event details below.' : 'Schedule institutional activities with program targeting.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className={styles.field}>
              <label><Type size={14} /> Event Title</label>
              <div className={styles.inputWrapper}>
                <input type="text" placeholder="Enter title..." value={form.title} onChange={set('title')} required />
                <span className={styles.line} />
              </div>
            </div>

            <div className={styles.inputGrid}>
              <div className={styles.field}>
                <label><Calendar size={14} /> Date</label>
                <DatePicker
                  value={form.event_date}
                  onChange={(v) => setForm((prev) => ({ ...prev, event_date: v }))}
                />
              </div>
              <div className={styles.field}>
                <label><Clock size={14} /> Time</label>
                <TimePicker
                  value={form.start_time}
                  onChange={(v) => setForm((prev) => ({ ...prev, start_time: v }))}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label><GraduationCap size={14} /> Target Program</label>
              <ProgramSelect
                value={form.program}
                onChange={(v) => setForm((prev) => ({ ...prev, program: v }))}
              />
            </div>

            <div className={styles.field}>
              <label><KeyRound size={14} /> Scanner Password</label>
              <div className={styles.passwordRow}>
                <div className={styles.inputWrapper} style={{ flex: 1 }}>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="\d{6}"
                    placeholder="6-digit code"
                    value={form.scanner_password ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setForm((prev) => ({ ...prev, scanner_password: val }));
                    }}
                    className={styles.passwordInput}
                  />
                  <span className={styles.line} />
                </div>
                <button
                  type="button"
                  className={styles.regenBtn}
                  onClick={() => setForm((prev) => ({ ...prev, scanner_password: generatePassword() }))}
                  title="Regenerate password"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <p className={styles.passwordHint}>Used by scanner to authenticate event check-ins.</p>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.field}>
              <label><MapPin size={14} /> Location</label>
              <div className={styles.inputWrapper}>
                <input type="text" placeholder="University Campus" value={form.location} onChange={set('location')} />
                <span className={styles.line} />
              </div>
            </div>

            <div className={styles.field}>
              <label><AlignLeft size={14} /> Description</label>
              <div className={styles.inputWrapper}>
                <textarea placeholder="Event details..." rows={4} value={form.description} onChange={set('description')} />
                <span className={styles.line} />
              </div>
            </div>
          </div>

          <div className={styles.imageSection}>
            <div className={styles.field}>
              <label><ImageIcon size={14} /> Event Banner</label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Discard</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}