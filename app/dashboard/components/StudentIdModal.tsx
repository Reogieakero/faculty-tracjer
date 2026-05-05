import { useState } from 'react';
import { IdCard, CheckCircle } from 'lucide-react';
import styles from '../dashboard.module.css';

const PROGRAMS = [
  { id: 'bs-devcom', label: 'BS DevCom' },
  { id: 'bs-polsci', label: 'BS PolSci' },
  { id: 'bs-psycho', label: 'BS Psycho' },
];

export function StudentIdModal({ onSave }: { onSave: (id: string, prog: string) => Promise<void> }) {
  const [studentId, setStudentId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4, 8);
    setStudentId(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.length !== 9 || !selectedProgram) return;
    setIsSubmitting(true);
    try {
      await onSave(studentId, selectedProgram);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.idModal}>
        {isSubmitted ? (
          <div className={styles.successState}>
            <div className={styles.successCircle}><CheckCircle size={32} /></div>
            <h2>You're all set!</h2>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.iconCircle}><IdCard size={24} /></div>
              <h2>One Quick Step</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.programTabs}>
                {PROGRAMS.map((prog) => (
                  <button
                    key={prog.id}
                    type="button"
                    className={`${styles.programTab} ${selectedProgram === prog.id ? styles.programTabActive : ''}`}
                    onClick={() => setSelectedProgram(prog.id)}
                  >
                    {prog.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="20xx-xxxx"
                value={studentId}
                onChange={handleIdInputChange}
                className={styles.idInput}
                maxLength={9}
                required
              />
              <button type="submit" className={styles.idSubmitBtn} disabled={isSubmitting || studentId.length !== 9 || !selectedProgram}>
                {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}