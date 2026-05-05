'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, UserPlus, Mail, GraduationCap, Circle, Loader2,
  Inbox, X, Calendar, Clock, Shield, ChevronRight, Hash,
  AlertCircle, RefreshCw
} from 'lucide-react';
import AdminTabBar from '../components/AdminTabBar';
import styles from './students.module.css';

interface Student {
  id: string;
  student_id: string;
  full_name: string | null;
  email: string;
  program: string | null;
  is_active: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_login: string | null;
}

const GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #0D0B50, #3b82f6)',
  'linear-gradient(135deg, #f7971e, #ffd200)',
];

function getAvatarGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function formatDate(d: string | null) {
  if (!d) return 'Never';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(d: string | null) {
  if (!d) return 'Never';
  return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Avatar({ student, size = 36 }: { student: Student; size?: number }) {
  const radius = size <= 36 ? 10 : 20;
  if (student.avatar_url) {
    return <img src={student.avatar_url} style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }} alt="" />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, background: getAvatarGradient(student.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: size <= 36 ? '0.6rem' : '1.3rem' }}>
        {getInitials(student.full_name)}
      </span>
    </div>
  );
}

function ProfileDrawer({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const isOpen = !!student;
  return (
    <>
      <div className={`${styles.drawerBackdrop} ${isOpen ? styles.backdropVisible : ''}`} onClick={onClose} />
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        {student && (
          <>
            <div className={styles.drawerHeader}>
              <button className={styles.drawerClose} onClick={onClose}><X size={18} /></button>
              <span className={styles.drawerLabel}>Student Profile</span>
            </div>
            <div className={styles.drawerHero}>
              <Avatar student={student} size={80} />
              <h2 className={styles.drawerName}>{student.full_name || 'Unnamed Student'}</h2>
              <p className={styles.drawerEmail}>{student.email}</p>
              <div className={`${styles.drawerStatusPill} ${student.is_active ? styles.active : styles.inactive}`}>
                <Circle size={6} fill="currentColor" />
                {student.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.drawerSection}>
                <p className={styles.drawerSectionTitle}>Academic Info</p>
                <div className={styles.drawerInfoGrid}>
                  <div className={styles.drawerInfoItem}>
                    <Hash size={14} className={styles.drawerInfoIcon} />
                    <div>
                      <span className={styles.drawerInfoLabel}>Student ID</span>
                      <span className={styles.drawerInfoValue}>{student.student_id}</span>
                    </div>
                  </div>
                  <div className={styles.drawerInfoItem}>
                    <GraduationCap size={14} className={styles.drawerInfoIcon} />
                    <div>
                      <span className={styles.drawerInfoLabel}>Program</span>
                      <span className={styles.drawerInfoValue}>{student.program || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.drawerSection}>
                <p className={styles.drawerSectionTitle}>Account Activity</p>
                <div className={styles.drawerInfoGrid}>
                  <div className={styles.drawerInfoItem}>
                    <Calendar size={14} className={styles.drawerInfoIcon} />
                    <div>
                      <span className={styles.drawerInfoLabel}>Date Enrolled</span>
                      <span className={styles.drawerInfoValue}>{formatDate(student.created_at)}</span>
                    </div>
                  </div>
                  <div className={styles.drawerInfoItem}>
                    <Clock size={14} className={styles.drawerInfoIcon} />
                    <div>
                      <span className={styles.drawerInfoLabel}>Last Login</span>
                      <span className={styles.drawerInfoValue}>{formatDateTime(student.last_login)}</span>
                    </div>
                  </div>
                  <div className={styles.drawerInfoItem}>
                    <Shield size={14} className={styles.drawerInfoIcon} />
                    <div>
                      <span className={styles.drawerInfoLabel}>Last Updated</span>
                      <span className={styles.drawerInfoValue}>{formatDate(student.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default function StudentsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const tabs = ['All', 'BSIT', 'DevCom', 'PolSci', 'Psych'];

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('students')
        .select('id, student_id, full_name, email, program, is_active, avatar_url, created_at, updated_at, last_login')
        .order('full_name', { ascending: true });

      if (activeTab !== 'All') query = query.eq('program', activeTab);

      const { data, error: sbError } = await query;

      if (sbError) {
        setError(`${sbError.message}`);
        setStudents([]);
        return;
      }
      setStudents(data ?? []);
    } catch (err: any) {
      setError(`${err?.message ?? String(err)}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Student Directory</h1>
          <p className={styles.subtitle}>Database Management Center</p>
        </div>
        <div className={styles.topActions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input type="text" placeholder="Search ID or Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </header>

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Student Records</h3>
            {!loading && !error && (
              <p className={styles.recordCount}>{filteredStudents.length} records</p>
            )}
          </div>
          <div className={styles.tabSelector}>
            {tabs.map((tab) => (
              <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <Loader2 className={styles.spinner} size={32} />
              <p>Syncing with Supabase...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={36} strokeWidth={1.5} />
              <p className={styles.errorTitle}>Could not load students</p>
              <p className={styles.errorMessage}>{error}</p>
              <button className={styles.retryBtn} onClick={fetchStudents}><RefreshCw size={14} /> Retry</button>
            </div>
          ) : filteredStudents.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Student ID</th>
                  <th>Program</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={`${styles.tableRow} ${selectedStudent?.id === student.id ? styles.rowSelected : ''}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td>
                      <div className={styles.userCell}>
                        <Avatar student={student} size={36} />
                        <div className={styles.nameContainer}>
                          <span className={styles.studentName}>{student.full_name || 'Unnamed Student'}</span>
                          <span className={styles.studentEmail}><Mail size={10} /> {student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.idBadge}>{student.student_id}</span></td>
                    <td>
                      <div className={styles.programCell}>
                        <GraduationCap size={14} /> {student.program || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <button className={styles.actionBtn}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <Inbox size={40} strokeWidth={1} />
              <p>No records found</p>
            </div>
          )}
        </div>
      </div>

      <AdminTabBar />
      <ProfileDrawer student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
}
