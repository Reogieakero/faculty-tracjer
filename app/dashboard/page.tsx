'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Sidebar from '@/components/dashboard/Sidebar';
import { supabase } from '@/lib/supabase';
import {
  Users,
  CheckCircle,
  XCircle,
  Zap,
  IdCard,
} from 'lucide-react';
import styles from './dashboard.module.css';

const PROGRAMS = [
  { id: 'bs-devcom', label: 'BS DevCom' },
  { id: 'bs-polsci', label: 'BS PolSci' },
  { id: 'bs-psycho', label: 'BS Psycho' },
];

function FlippingStatCard({ label, val, icon, description }: any) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`${styles.cardWrapper} ${isFlipped ? styles.flipped : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.statLabel}>
            {label}
            {icon}
          </div>
          <div className={styles.statValue}>{val}</div>
        </div>
        <div className={styles.cardBack}>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

function AttendancePieChart({ totalEvents, attendancePercent }: { totalEvents: number; attendancePercent: number }) {
  const attended = Math.round((attendancePercent / 100) * totalEvents);
  const missed = totalEvents - attended;

  const cx = 80;
  const cy = 80;
  const r = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * r;
  const attendedOffset = circumference * (1 - attendancePercent / 100);
  const missedPercent = 100 - attendancePercent;

  return (
    <div className={styles.pieChartContainer}>
      <div className={styles.pieChartHeader}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#2563eb" strokeWidth="1.5" />
          <path d="M8 4v4l2.5 2.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h2>Attendance Overview</h2>
      </div>

      <div className={styles.pieChartBody}>
        <div className={styles.svgWrapper}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eff6ff" strokeWidth={strokeWidth} />
            <circle
              cx={cx} cy={cy} r={r} fill="none"
              stroke="#2563eb" strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={attendedOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            {missedPercent > 0 && (
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke="#fca5a5" strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * missedPercent / 100} ${circumference}`}
                strokeDashoffset={-(circumference * attendancePercent / 100)}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            )}
            <text x={cx} y={cy - 8} textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="700" fontFamily="'Unbounded', sans-serif">
              {attendancePercent}%
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="'Kulim Park', sans-serif" letterSpacing="0.05em">
              ATTENDANCE
            </text>
          </svg>
        </div>

        <div className={styles.pieLegend}>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: '#2563eb' }} />
            <div className={styles.legendInfo}>
              <span className={styles.legendLabel}>Attended</span>
              <span className={styles.legendVal}>{attended} / {totalEvents}</span>
            </div>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: '#fca5a5' }} />
            <div className={styles.legendInfo}>
              <span className={styles.legendLabel}>Missed</span>
              <span className={styles.legendVal}>{missed} / {totalEvents}</span>
            </div>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: '#eff6ff' }} />
            <div className={styles.legendInfo}>
              <span className={styles.legendLabel}>Total Events</span>
              <span className={styles.legendVal}>{totalEvents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string; studentId: string; program: string } | null>(null);
  const [showIdOverlay, setShowIdOverlay] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: studentData } = await supabase
          .from('students')
          .select('student_id, full_name, program')
          .eq('id', user.id)
          .single();

        const existingId = studentData?.student_id || user.user_metadata?.student_id || '';
        const existingProgram = studentData?.program || user.user_metadata?.program || '';

        setUser({
          name: studentData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          studentId: existingId,
          program: existingProgram,
        });

        if (!existingId || !existingProgram) {
          setShowIdOverlay(true);
        }
      }
    };
    getUserData();
  }, []);

  const handleIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4) {
      val = val.slice(0, 4) + '-' + val.slice(4, 8);
    }
    setStudentId(val);
  };

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idRegex = /^202\d-\d{4}$/;
    if (!idRegex.test(studentId) || !selectedProgram) return;

    setIsSubmitting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not logged in');

      const { error: authError } = await supabase.auth.updateUser({
        data: { student_id: studentId, program: selectedProgram }
      });
      if (authError) throw authError;

      const { error: dbError } = await supabase
        .from('students')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name ?? null,
          student_id: studentId,
          program: selectedProgram,
        }, { onConflict: 'id' });

      if (dbError) throw dbError;

      setUser(prev => prev ? { ...prev, studentId, program: selectedProgram } : null);
      setIsSubmitted(true);
      setTimeout(() => setShowIdOverlay(false), 2500);
    } catch (error: any) {
      console.error('Could not save your Student ID:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = studentId.length === 9 && selectedProgram !== '';

  const stats = [
    { label: 'Total Events', val: '24', icon: <Users size={16} />, desc: 'Sum of all workshops, seminars, and laboratory sessions recorded this term.' },
    { label: 'Attendance', val: '88%', icon: <CheckCircle size={16} />, desc: 'Real-time percentage of scheduled hours verified by the system.' },
    { label: 'Absences', val: '04', icon: <XCircle size={16} />, desc: 'Count of missed sessions currently requiring faculty excuse documentation.' },
    { label: 'Student ID', val: user?.studentId || '—', icon: <IdCard size={16} />, desc: 'Your official school-issued Student ID linked to your attendance records.' },
  ];

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      {showIdOverlay && (
        <div className={styles.overlay}>
          <div className={styles.idModal}>
            {isSubmitted ? (
              <div className={styles.successState}>
                <div className={styles.successCircle}>
                  <CheckCircle size={32} />
                </div>
                <h2>You're all set!</h2>
                <p style={{ color: '#16a34a', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Your Student ID <strong>{studentId}</strong> under <strong>{PROGRAMS.find(p => p.id === selectedProgram)?.label}</strong> has been saved.
                  Taking you to your dashboard…
                </p>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.iconCircle}><IdCard size={24} /></div>
                  <h2>One Quick Step Before You Start</h2>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: '1.5' }}>
                    Enter your Student ID and select your program so we can link your attendance records correctly. You'll only need to do this once.
                  </p>
                </div>

                <form onSubmit={handleIdSubmit}>
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
                    inputMode="numeric"
                    placeholder="20xx-xxxx"
                    value={studentId}
                    onChange={handleIdInputChange}
                    className={styles.idInput}
                    maxLength={9}
                    required
                  />

                  <button
                    type="submit"
                    className={styles.idSubmitBtn}
                    disabled={isSubmitting || !isFormValid}
                  >
                    {isSubmitting ? 'Saving…' : 'Continue to Dashboard'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.userGreeting}>
            <h1>Welcome, {user?.name}</h1>
            <p className={styles.userEmail}>{user?.email}</p>
            {user?.program && (
              <span className={styles.studentIdBadge}>
                {PROGRAMS.find(p => p.id === user.program)?.label ?? user.program}
              </span>
            )}
          </div>
          <p className={styles.sessionInfo}>PolyTrack Analytics • Academic Session 2026</p>
        </header>

        <section className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <FlippingStatCard
              key={i}
              label={stat.label}
              val={stat.val}
              icon={stat.icon}
              description={stat.desc}
            />
          ))}
        </section>

        <div className={styles.mainGrid}>
          <section className={styles.activityCard}>
            <div className={styles.cardHeader}>
              <Zap size={20} color="#2563eb" />
              <h2>Recent Engagement</h2>
            </div>
            <div className={styles.list}>
              <div className={styles.listItem}>
                <div className={`${styles.iconBox} ${styles.blueBox}`}><CheckCircle size={20} /></div>
                <div className={styles.itemInfo}>
                  <h4>Verified Physics Seminar</h4>
                  <p>Today at 10:30 AM • Auditorium A</p>
                </div>
              </div>
              <div className={styles.listItem}>
                <div className={`${styles.iconBox} ${styles.redBox}`}><XCircle size={20} /></div>
                <div className={styles.itemInfo}>
                  <h4>Unattended Lab Session</h4>
                  <p>Yesterday at 2:00 PM • Chemistry Lab B</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.announcementCard}>
            <AttendancePieChart totalEvents={24} attendancePercent={88} />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}