'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UserCheck, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAttendance } from './hooks/useAttendance';
import { StatCard } from './components/StatCard';
import styles from './attendance.module.css';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('All');
  const { attendance, userProgram, stats, loading } = useAttendance();

  if (loading) return null;

  const formatProgram = (prog: string) => {
    const names: Record<string, string> = {
      'bs-psycho': 'BS Psycho',
      'bs-devcom': 'BS DevCom',
      'bs-polsci': 'BS PolSci'
    };
    return names[prog] || prog;
  };

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className={styles.wrapper}>
        <section className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}><UserCheck size={20} /></div>
            <div>
              <h1 className={styles.pageTitle}>Attendance Tracking</h1>
              <p className={styles.pageSubtitle}>Monitor your presence and punctuality.</p>
            </div>
          </div>

          <div className={styles.tabGroup}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'All' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('All')}
            >
              All
            </button>
            {userProgram && (
              <button 
                className={`${styles.tabBtn} ${activeTab === userProgram ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(userProgram)}
              >
                {formatProgram(userProgram)}
              </button>
            )}
          </div>
        </section>

        <div className={styles.statsGrid}>
          <StatCard value={stats.present} label="Present Days" colorClass="bg_emerald" icon={<CheckCircle2 size={20} />} />
          <StatCard value={stats.late} label="Late Arrivals" colorClass="bg_amber" icon={<Clock size={20} />} />
          <StatCard value={stats.absent} label="Absent Total" colorClass="bg_rose" icon={<AlertCircle size={20} />} />
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Attendance History</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Time In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td className={styles.subjectCell}>{record.subject}</td>
                    <td>{record.time_in}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status_' + record.status.toLowerCase()]}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}