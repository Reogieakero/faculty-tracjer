'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Users, CalendarDays, MessageSquareQuote, Activity,
  Bell, Settings, Search, Circle, TrendingUp, MoreVertical,
  RefreshCw
} from 'lucide-react';
import AdminTabBar from '../components/AdminTabBar';
import styles from './dashboard.module.css';

interface ScanLog {
  id: string;
  scanned_at: string;
  students: {
    full_name: string | null;
    student_id: string | null;
    avatar_url: string | null;
  } | null;
  events: {
    title: string;
  } | null;
}

interface DashboardStats {
  totalStudents: number;
  totalEvents: number;
  upcomingEvents: number;
  activeSessions: number;
}

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [scansLoading, setScansLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    activeSessions: 0,
  });
  const [liveScans, setLiveScans] = useState<ScanLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [studentsRes, eventsRes, upcomingRes, sessionRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('scan_logs').select('id', { count: 'exact', head: true })
          .gte('scanned_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()),
      ]);

      setStats({
        totalStudents: studentsRes.count ?? 0,
        totalEvents: eventsRes.count ?? 0,
        upcomingEvents: upcomingRes.count ?? 0,
        activeSessions: sessionRes.count ?? 0,
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [supabase]);

  const fetchLiveScans = useCallback(async () => {
    setScansLoading(true);
    try {
      const { data, error } = await supabase
        .from('scan_logs')
        .select(`
          id,
          scanned_at,
          students ( full_name, student_id, avatar_url ),
          events ( title )
        `)
        .order('scanned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLiveScans((data as unknown as ScanLog[]) || []);
    } catch (err) {
      console.error('Scan logs fetch error:', err);
    } finally {
      setScansLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@dorsu.edu.ph';

      if (!user || user.email !== adminEmail) {
        router.replace('/login');
        return;
      }

      await Promise.all([fetchStats(), fetchLiveScans()]);
      setLoading(false);
    };

    checkAdminAccess();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router, supabase, fetchStats, fetchLiveScans]);

  useEffect(() => {
    if (loading) return;

    const channel = supabase
      .channel('scan_logs_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'scan_logs',
      }, () => {
        fetchLiveScans();
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loading, supabase, fetchLiveScans, fetchStats]);

  const filteredScans = liveScans.filter((scan) => {
    const q = searchQuery.toLowerCase();
    return (
      scan.students?.full_name?.toLowerCase().includes(q) ||
      scan.students?.student_id?.toLowerCase().includes(q) ||
      scan.events?.title?.toLowerCase().includes(q)
    );
  });

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const statCards = [
    {
      label: 'Total Registered',
      value: statsLoading ? '—' : stats.totalStudents.toLocaleString(),
      icon: <Users size={20} />,
      change: 'students enrolled',
      color: '#0D0B50',
    },
    {
      label: 'Events Listed',
      value: statsLoading ? '—' : stats.totalEvents.toLocaleString(),
      icon: <CalendarDays size={20} />,
      change: `${stats.upcomingEvents} upcoming`,
      color: '#0D0B50',
    },
    {
      label: 'Total Scan Logs',
      value: statsLoading ? '—' : liveScans.length > 0 ? `${liveScans.length}+` : '0',
      icon: <MessageSquareQuote size={20} />,
      change: 'all time check-ins',
      color: '#0D0B50',
    },
    {
      label: 'Scans (Last Hr)',
      value: statsLoading ? '—' : stats.activeSessions.toLocaleString(),
      icon: <Activity size={20} />,
      change: 'real-time activity',
      color: '#0D0B50',
    },
  ];

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0B50' }}>
        <div className="loader" />
        <style jsx>{`
          .loader { border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top: 3px solid #ffffff; width: 30px; height: 30px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Admin Command Center</h1>
          <p className={styles.subtitle}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className={styles.topActions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Student ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.iconBtn} onClick={() => { fetchStats(); fetchLiveScans(); }} title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button className={styles.iconBtn}><Bell size={20} /></button>
          <button className={styles.iconBtn}><Settings size={20} /></button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {statCards.map((stat, i) => (
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
        <div className={`${styles.contentCard} ${styles.large}`}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className={styles.cardTitle}>Live Scanner Feed</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fef2f2', padding: '4px 8px', borderRadius: '20px' }}>
                <Circle size={8} fill="#ef4444" color="#ef4444" />
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444' }}>LIVE</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
              {filteredScans.length} record{filteredScans.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className={styles.tableWrapper}>
            {scansLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Loading scan logs...
              </div>
            ) : filteredScans.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                {searchQuery ? 'No matching records found.' : 'No scan logs yet. Scans will appear here in real-time.'}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Event</th>
                    <th>Time</th>
                    <th>Ago</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((scan) => (
                    <tr key={scan.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatarSmall} style={{
                            background: '#e8e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6rem',
                            fontWeight: '800',
                            color: '#0D0B50',
                          }}>
                            {scan.students?.avatar_url ? (
                              <img src={scan.students.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                              getInitials(scan.students?.full_name)
                            )}
                          </div>
                          <span>{scan.students?.full_name ?? 'Unknown'}</span>
                        </div>
                      </td>
                      <td><span style={{ color: '#64748b', fontSize: '0.75rem' }}>{scan.students?.student_id ?? '—'}</span></td>
                      <td><span style={{ fontSize: '0.8rem' }}>{scan.events?.title ?? '—'}</span></td>
                      <td><span className={styles.actionBadge}>{formatTime(scan.scanned_at)}</span></td>
                      <td><span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{formatTimeAgo(scan.scanned_at)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Scan Momentum</h3>
            <TrendingUp size={18} color="#0D0B50" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>LAST HOUR</p>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0D0B50' }}>{stats.activeSessions} scans</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>TOTAL LOGS</p>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0D0B50' }}>{liveScans.length}</h4>
              </div>
            </div>
            <svg viewBox="0 0 200 100" style={{ width: '100%', height: '120px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(13, 11, 80, 0.2)" />
                  <stop offset="100%" stopColor="rgba(13, 11, 80, 0)" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q25,75 50,40 T100,60 T150,20 T200,50" fill="none" stroke="#0D0B50" strokeWidth="3" strokeLinecap="round" />
              <path d="M0,80 Q25,75 50,40 T100,60 T150,20 T200,50 L200,100 L0,100 Z" fill="url(#gradient)" />
              <circle cx="150" cy="20" r="4" fill="#0D0B50" stroke="white" strokeWidth="2" />
            </svg>
            <div style={{ marginTop: '12px' }}>
              {liveScans.slice(0, 3).map((scan, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
                    {scan.students?.full_name ?? 'Unknown'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{formatTimeAgo(scan.scanned_at)}</span>
                </div>
              ))}
              {liveScans.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>No recent scans</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />
    </div>
  );
}