'use client';

import { useEffect, useState } from 'react';
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

export default function DashboardPage() {
  const { user, loading, updateProfile } = useStudentProfile();
  const router = useRouter();
  const [auditFiles, setAuditFiles] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      const { data: audits } = await supabase
        .from('audit_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      setAuditFiles(audits || []);

      if (user?.program) {
        const { count, error } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .or(`program.eq.All,program.eq.${user.program}`);

        if (!error) setTotalEvents(count || 0);
      }
    };

    if (!loading && user) {
      fetchDashboardData();
    }
  }, [supabase, user, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const openOverlay = (filePath: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    setSelectedPdf(data.publicUrl);
  };

  const stats = [
    { label: 'Total Events', val: totalEvents.toString(), icon: <Users size={16} />, desc: 'Events for your program.' },
    { label: 'Attendance', val: '88%', icon: <CheckCircle size={16} />, desc: 'Verified hours recorded.' },
    { label: 'Absences', val: '04', icon: <XCircle size={16} />, desc: 'Requires documentation.' },
    { label: 'Student ID', val: user?.studentId || '—', icon: <IdCard size={16} />, desc: 'Official Student ID.' },
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
            <div className={styles.cardHeader}>
              <ShieldCheck size={20} color="#2563eb" />
              <h2>Audit Trail</h2>
            </div>
            <div className={styles.list}>
              {auditFiles.length > 0 ? (
                auditFiles.map((file) => (
                  <div key={file.id} className={styles.listItem} onClick={() => openOverlay(file.file_path)}>
                    <div className={`${styles.iconBox} ${styles.blueBox}`}><FileText size={20} /></div>
                    <div className={styles.itemInfo} style={{ cursor: 'pointer', flex: 1 }}>
                      <h4>{file.title}</h4>
                      <p>{file.file_size} • {new Date(file.created_at).toLocaleDateString()}</p>
                    </div>
                    <Eye size={16} style={{ color: '#94a3b8' }} />
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
          <AttendancePieChart totalEvents={totalEvents} attendancePercent={88} />
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
            <div
              className={styles.modalHeader}
              style={{
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
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