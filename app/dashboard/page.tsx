'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Sidebar from '@/components/dashboard/Sidebar';
import { Users, CheckCircle, XCircle, Zap, IdCard } from 'lucide-react';
import styles from './dashboard.module.css';
import { useStudentProfile } from './hooks/useStudentProfile';
import { FlippingStatCard } from './components/FlippingStatCard';
import { StudentIdModal } from './components/StudentIdModal';
import AttendancePieChart from './components/AttendancePieChart';

export default function DashboardPage() {
  const { user, loading, updateProfile } = useStudentProfile();

  if (loading) return null;

  const stats = [
    { label: 'Total Events', val: '24', icon: <Users size={16} />, desc: 'Sum of all workshops and seminars.' },
    { label: 'Attendance', val: '88%', icon: <CheckCircle size={16} />, desc: 'Verified hours recorded.' },
    { label: 'Absences', val: '04', icon: <XCircle size={16} />, desc: 'Requires documentation.' },
    { label: 'Student ID', val: user?.studentId || '—', icon: <IdCard size={16} />, desc: 'Official Student ID.' },
  ];

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      {(!user?.studentId || !user?.program) && <StudentIdModal onSave={updateProfile} />}

      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.userGreeting}>
            <h1>Welcome, {user?.name}</h1>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
          <p className={styles.sessionInfo}>PolyTrack Analytics • 2026</p>
        </header>

        <section className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <FlippingStatCard key={i} label={stat.label} val={stat.val} icon={stat.icon} description={stat.desc} />
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