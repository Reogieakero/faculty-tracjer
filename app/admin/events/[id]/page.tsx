'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, 
  Share2, ShieldCheck, Info,
  LayoutDashboard, Settings, X, Search, CheckCircle2, Loader2
} from 'lucide-react';
import styles from './eventDetails.module.css';

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [isClient, setIsClient] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAdminAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@dorsu.edu.ph';

      if (!user || user.email !== adminEmail) {
        router.replace('/login');
        return;
      }
      setVerifying(false);
    };

    checkAdminAuth();
  }, [isClient, router, supabase]);

  useEffect(() => {
    if (!isClient || verifying) return;

    const fetchEventData = async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      const { data: scanData, error: scanError } = await supabase
        .from('scan_logs')
        .select(`
          id,
          scanned_at,
          students (
            id,
            full_name,
            student_id,
            program
          )
        `)
        .eq('event_id', id)
        .order('scanned_at', { ascending: false });

      if (eventError) console.error('Event fetch error:', eventError);
      if (scanError) console.error('Scan logs fetch error:', scanError);

      if (eventData) setEvent(eventData);
      if (scanData) setAttendees(scanData);
      setLoading(false);
    };

    fetchEventData();
  }, [id, supabase, isClient, verifying]);

  const filteredAttendees = attendees.filter(item =>
    item.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient || verifying) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0B50' }}>
        <Loader2 className={styles.spinner} size={32} color="white" />
      </div>
    );
  }

  if (loading) return <div className={styles.loaderWrapper}><div className={styles.spinner} /></div>;
  if (!event) return <div className={styles.errorState}>Event not found.</div>;

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.topNav}>
        <button className={styles.backLink} onClick={() => router.back()}>
          <ArrowLeft size={18} />
          <span>Events Overview</span>
        </button>
        <div className={styles.navActions}>
          <button className={styles.iconBtn}><Share2 size={18} /></button>
          <button className={styles.iconBtn}><Settings size={18} /></button>
        </div>
      </nav>

      <div className={styles.layout}>
        <main className={styles.content}>
          <header className={styles.heroSection}>
            <div className={styles.badgeContainer}>
              <span className={styles.programLabel}>{event.program}</span>
              <span className={`${styles.statusIndicator} ${styles[event.status]}`}>
                {event.status}
              </span>
            </div>
            <h1 className={styles.eventTitle}>{event.title}</h1>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
            </div>
          </header>

          <div className={styles.imageGallery}>
            {event.image_url ? (
              <img src={event.image_url} alt="Cover" className={styles.mainBanner} />
            ) : (
              <div className={styles.placeholderBanner}>No Cover Image Uploaded</div>
            )}
          </div>

          <section className={styles.descriptionSection}>
            <div className={styles.sectionHeader}>
              <Info size={20} />
              <h2>About this Event</h2>
            </div>
            <div className={styles.descriptionContent}>
              <p>{event.description || 'No detailed description provided for this institutional activity.'}</p>
            </div>
          </section>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.stickyWrapper}>
            <div className={styles.statsCard}>
              <div className={styles.statGroup}>
                <span className={styles.statLabel}>Total Scanned</span>
                <div className={styles.statValue}>
                  <Users size={24} />
                  <span>{attendees.length}</span>
                </div>
              </div>
              <button className={styles.primaryAction} onClick={() => setShowAttendanceModal(true)}>
                <LayoutDashboard size={18} />
                View Attendance
              </button>
            </div>

            <div className={styles.detailsCard}>
              <h3 className={styles.cardTitle}>Event Schedule</h3>
              <div className={styles.timelineItem}>
                <Clock size={16} />
                <div>
                  <p className={styles.timeVal}>{event.start_time} — {event.end_time || 'Finish'}</p>
                  <p className={styles.timeLabel}>Local Time</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <ShieldCheck size={16} />
                <div>
                  <p className={styles.timeVal}>Smart Scanning</p>
                  <p className={styles.timeLabel}>Active Protection</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showAttendanceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Event Attendance</h2>
                <p>{event.title}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowAttendanceModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalSearch}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.tableContainer}>
              {filteredAttendees.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users size={32} />
                  <p>{searchTerm ? 'No results found.' : 'No attendance records yet.'}</p>
                </div>
              ) : (
                <table className={styles.attendanceTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Program</th>
                      <th>Scan Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((record, index) => (
                      <tr key={record.id}>
                        <td className={styles.rowIndex}>{index + 1}</td>
                        <td className={styles.studentName}>{record.students?.full_name ?? '—'}</td>
                        <td>{record.students?.student_id ?? '—'}</td>
                        <td>{record.students?.program ?? '—'}</td>
                        <td>
                          {new Date(record.scanned_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          <span className={styles.presentBadge}>
                            <CheckCircle2 size={12} /> Present
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
      )}
    </div>
  );
}