'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  MessageSquareQuote, 
  Activity,
  Bell, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  Circle,
  TrendingUp
} from 'lucide-react';

import AdminTabBar from '../components/AdminTabBar';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Total Registered', value: '1,284', icon: <Users size={20} />, change: '+12% this month' },
    { label: 'Events Listed', value: '42', icon: <CalendarDays size={20} />, change: '8 upcoming events' },
    { label: 'Total Feedback', value: '156', icon: <MessageSquareQuote size={20} />, change: '98% positive rate' },
    { label: 'Active Sessions', value: '84', icon: <Activity size={20} />, change: 'Live traffic' },
  ];

  const liveScans = [
    { id: '2021-0042', name: 'Reogie Mabawad', event: 'Tech Summit 2026', time: '2:14 PM' },
    { id: '2022-1105', name: 'Joshua Serrano', event: 'Tech Summit 2026', time: '2:10 PM' },
    { id: '2021-0892', name: 'Marl Soriano', event: 'Tech Summit 2026', time: '2:05 PM' },
    { id: '2023-0421', name: 'Vera Dominguez', event: 'Tech Summit 2026', time: '1:58 PM' },
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Admin Command Center</h1>
          <p className={styles.subtitle}>
            {mounted ? (
              `${currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • ${currentTime.toLocaleTimeString()}`
            ) : (
              "Initializing system time..."
            )}
          </p>
        </div>
        
        <div className={styles.topActions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input type="text" placeholder="Search by Student ID..." />
          </div>
          <button className={styles.iconBtn}><Bell size={20} /></button>
          <button className={styles.iconBtn}><Settings size={20} /></button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.iconBox}>{stat.icon}</div>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
            <div className={styles.statBody}>
              <h2 className={styles.statValue}>{stat.value}</h2>
              <p className={styles.statChange}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainContentGrid}>
        {/* Left Section: Live Scanning Logs */}
        <div className={`${styles.contentCard} ${styles.large}`}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className={styles.cardTitle}>Live Scanner Feed</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fef2f2', padding: '4px 8px', borderRadius: '20px' }}>
                <Circle size={8} fill="#ef4444" color="#ef4444" />
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444' }}>RECORDING</span>
              </div>
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Current Event</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {liveScans.map((scan, i) => (
                  <tr key={i}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatarSmall} />
                        <span>{scan.name}</span>
                      </div>
                    </td>
                    <td><span style={{ color: '#64748b', fontSize: '0.75rem' }}>{scan.id}</span></td>
                    <td>{scan.event}</td>
                    <td><span className={styles.actionBadge}>{scan.time}</span></td>
                    <td><MoreVertical size={16} className={styles.moreIcon} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Real-time Analytics Graph */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Scan Momentum</h3>
            <TrendingUp size={18} color="#0D0B50" />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>PEAK SCAN RATE</p>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0D0B50' }}>12/min</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>AVG FLOW</p>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0D0B50' }}>8.4s</h4>
              </div>
            </div>

            {/* Custom SVG Line Graph for "Pro-Level" Look */}
            <svg viewBox="0 0 200 100" style={{ width: '100%', height: '120px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(13, 11, 80, 0.2)" />
                  <stop offset="100%" stopColor="rgba(13, 11, 80, 0)" />
                </linearGradient>
              </defs>
              <path 
                d="M0,80 Q25,75 50,40 T100,60 T150,20 T200,50" 
                fill="none" 
                stroke="#0D0B50" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              <path 
                d="M0,80 Q25,75 50,40 T100,60 T150,20 T200,50 L200,100 L0,100 Z" 
                fill="url(#gradient)" 
              />
              <circle cx="150" cy="20" r="4" fill="#0D0B50" stroke="white" strokeWidth="2" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#cbd5e1' }}>1:00 PM</span>
              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#cbd5e1' }}>1:30 PM</span>
              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#0D0B50' }}>NOW</span>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />
    </div>
  );
}