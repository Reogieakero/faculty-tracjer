'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Sidebar from '@/components/dashboard/Sidebar';
import { Users, CheckCircle, XCircle, Zap, IdCard, FileText, Eye, X, ShieldCheck } from 'lucide-react';
import styles from './dashboard.module.css';
import { useStudentProfile } from './hooks/useStudentProfile';
import { FlippingStatCard } from './components/FlippingStatCard';
import { StudentIdModal } from './components/StudentIdModal';
import AttendancePieChart from './components/AttendancePieChart';

interface AuditDocument {
  id: string;
  title: string;
  file_path: string;
  file_size: string | null;
  created_at: string;
}

interface ScanEntry {
  id: string;
  scanned_at: string;
  events: {
    title: string;
    location: string | null;
    status: string;
  } | null;
}

interface DashboardData {
  totalEvents: number;
  attendedCount: number;
  absenceCount: number;
  auditFiles: AuditDocument[];
  recentScans: ScanEntry[];
}

export default function DashboardPage() {
  const { user, loading, updateProfile } = useStudentProfile();
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    totalEvents: 0,
    attendedCount: 0,
    absenceCount: 0,
    auditFiles: [],
    recentScans: [],
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [eventsRes, auditsRes, scansRes] = await Promise.all([
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .or(`program.eq.All${user.program ? `,program.eq.${user.program}` : ''}`),

        supabase
          .from('audit_documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3),

        supabase
          .from('scan_logs')
          .select(`
            id,
            scanned_at,
            events ( title, location, status )
          `)
          .eq('student_id', authUser.id)
          .order('scanned_at', { ascending: false })
          .limit(5),
      ]);

      const totalEvents = eventsRes.count ?? 0;
      const attendedCount = scansRes.data?.length ?? 0;
      const absenceCount = Math.max(0, totalEvents - attendedCount);
      const attendancePercent = totalEvents > 0
        ? Math.round((attendedCount / totalEvents) * 100)
        : 0;

      setData({
        totalEvents,
        attendedCount,
        absenceCount,
        auditFiles: (auditsRes.data as AuditDocument[]) || [],
        recentScans: (scansRes.data as unknown as ScanEntry[]) || [],
      });
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!loading && user) fetchDashboardData();
  }, [loading, user, fetchDashboardData]);

  const openOverlay = (filePath: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    setSelectedPdf(data.publicUrl);
  };

  const formatScanTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const attendancePercent = data.totalEvents > 0
    ? Math.round((data.attendedCount / data.totalEvents) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    {
      label: 'Total Events',
      val: dataLoading ? '—' : data.totalEvents.toString(),
      icon: <Users size={16} />,
      desc: 'Events available for your program.',
    },
    {
      label: 'Attended',
      val: dataLoading ? '—' : `${attendancePercent}%`,
      icon: <CheckCircle size={16} />,
      desc: `${data.attendedCount} events attended.`,
    },
    {
      label: 'Absences',
      val: dataLoading ? '—' : data.absenceCount.toString().padStart(2, '0'),
      icon: <XCircle size={16} />,
      desc: 'Events not attended.',
    },
    {
      label: 'Student ID',
      val: user?.studentId || '—',
      icon: <IdCard size={16} />,
      desc: 'Your official Student ID.',
    },
  ];

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      {(!user?.studentId || !user?.program) && <StudentIdModal onSave={updateProfile} />}

      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.profileContainer}>
            <div className={styles.headerAvatar}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.userGreeting}>
              <h1>Welcome, {user?.name}</h1>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <p className={styles.sessionInfo}>PolyTrack Analytics • 2026</p>
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
              {dataLoading ? (
                <div className={styles.itemInfo} style={{ padding: '1rem' }}>
                  <p>Loading activity...</p>
                </div>
              ) : data.recentScans.length === 0 ? (
                <div className={styles.itemInfo} style={{ padding: '1rem' }}>
                  <p>No scan activity yet. Attend an event to see your history here.</p>
                </div>
              ) : (
                data.recentScans.map((scan) => (
                  <div key={scan.id} className={styles.listItem}>
                    <div className={`${styles.iconBox} ${styles.blueBox}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{scan.events?.title ?? 'Unknown Event'}</h4>
                      <p>
                        {formatScanTime(scan.scanned_at)}
                        {scan.events?.location ? ` • ${scan.events.location}` : ''}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      background: scan.events?.status === 'ongoing' ? '#dcfce7' : '#f1f5f9',
                      color: scan.events?.status === 'ongoing' ? '#16a34a' : '#64748b',
                    }}>
                      {scan.events?.status ?? 'done'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.announcementCard}>
            <div className={styles.cardHeader}>
              <ShieldCheck size={20} color="#2563eb" />
              <h2>Audit Trail</h2>
            </div>
            <div className={styles.list}>
              {dataLoading ? (
                <div className={styles.itemInfo} style={{ padding: '1rem' }}>
                  <p>Loading documents...</p>
                </div>
              ) : data.auditFiles.length > 0 ? (
                data.auditFiles.map((file) => (
                  <div
                    key={file.id}
                    className={styles.listItem}
                    onClick={() => openOverlay(file.file_path)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`${styles.iconBox} ${styles.blueBox}`}>
                      <FileText size={20} />
                    </div>
                    <div className={styles.itemInfo} style={{ flex: 1 }}>
                      <h4>{file.title}</h4>
                      <p>
                        {file.file_size ?? 'Unknown size'} •{' '}
                        {new Date(file.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Eye size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                  </div>
                ))
              ) : (
                <div className={styles.itemInfo} style={{ padding: '1rem' }}>
                  <p>No audit documents found.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className={styles.announcementCard} style={{ marginTop: '1.25rem', gridColumn: 'span 12' }}>
          <AttendancePieChart
            totalEvents={data.totalEvents}
            attendancePercent={attendancePercent}
          />
        </section>
      </div>

      {selectedPdf && (
        <div className={styles.overlay} onClick={() => setSelectedPdf(null)}>
          <div
            className={styles.pdfModal}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              width: '90%',
              height: '85vh',
              maxWidth: '1000px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <h2 style={{ margin: 0, fontSize: '1rem' }}>Document Preview</h2>
              <button
                onClick={() => setSelectedPdf(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <iframe src={selectedPdf} style={{ flex: 1, width: '100%', border: 'none' }} title="Audit PDF" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}