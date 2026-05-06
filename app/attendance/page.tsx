'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UserCheck, Clock, AlertCircle, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import { useAttendance } from './hooks/useAttendance';
import { StatCard } from './components/StatCard';
import styles from './attendance.module.css';

const PROGRAM_LABELS: Record<string, string> = {
  'bs-psycho':  'BS Psycho',
  'bs-devcom':  'BS DevCom',
  'bs-polsci':  'BS PolSci',
};

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Present' | 'Late' | 'Absent'>('All');
  const { attendance, userProgram, stats, loading } = useAttendance();

  const filtered = activeTab === 'All'
    ? attendance
    : attendance.filter(r => r.status === activeTab);

  const formatProgram = (prog: string) => PROGRAM_LABELS[prog] || prog;

  const statusColor = (status: string) => {
    if (status === 'Present') return styles.status_present;
    if (status === 'Late')    return styles.status_late;
    return styles.status_absent;
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<Sidebar />}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading attendance...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className={styles.wrapper}>
        <section className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}><UserCheck size={20} /></div>
            <div>
              <h1 className={styles.pageTitle}>Attendance Tracking</h1>
              <p className={styles.pageSubtitle}>
                {userProgram ? `${formatProgram(userProgram)} • ` : ''}
                {stats.total} records • {stats.attendanceRate}% attendance rate
              </p>
            </div>
          </div>

          <div className={styles.tabGroup}>
            {(['All', 'Present', 'Late', 'Absent'] as const).map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab !== 'All' && (
                  <span className={styles.tabCount}>
                    {tab === 'Present' ? stats.present : tab === 'Late' ? stats.late : stats.absent}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.statsGrid}>
          <StatCard
            value={stats.present}
            label="Present"
            colorClass="bg_emerald"
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            value={stats.late}
            label="Late Arrivals"
            colorClass="bg_amber"
            icon={<Clock size={20} />}
          />
          <StatCard
            value={stats.absent}
            label="Absent"
            colorClass="bg_rose"
            icon={<AlertCircle size={20} />}
          />
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              {activeTab === 'All' ? 'Full Attendance History' : `${activeTab} Records`}
            </h3>
            <span className={styles.recordCount}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <div className={styles.tableWrapper}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                {activeTab === 'All'
                  ? 'No attendance records yet. Scan into an event to get started.'
                  : `No ${activeTab.toLowerCase()} records found.`}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Date</th>
                    <th>Event</th>
                    <th><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Location</th>
                    <th><Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Time In</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{record.date}</td>
                      <td className={styles.subjectCell}>{record.subject}</td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {record.location ?? 'TBD'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{record.time_in}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}