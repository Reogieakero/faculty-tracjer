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
  Bell,
  Clock
} from 'lucide-react';
import styles from './dashboard.module.css';

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

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || ''
        });
      }
    };
    getUserData();
  }, []);

  const stats = [
    { 
      label: 'Total Events', 
      val: '24', 
      icon: <Users size={16} />, 
      desc: 'Sum of all workshops, seminars, and laboratory sessions recorded this term.' 
    },
    { 
      label: 'Attendance', 
      val: '88%', 
      icon: <CheckCircle size={16} />, 
      desc: 'Real-time percentage of scheduled hours verified by the system.' 
    },
    { 
      label: 'Absences', 
      val: '04', 
      icon: <XCircle size={16} />, 
      desc: 'Count of missed sessions currently requiring faculty excuse documentation.' 
    },
    { 
      label: 'Upcoming', 
      val: '07', 
      icon: <Clock size={16} />, 
      desc: 'Events and requirements scheduled within the next seven calendar days.' 
    },
  ];

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className={styles.wrapper}>
        
        <header className={styles.header}>
          <div className={styles.userGreeting}>
            <h1>Welcome, {user?.name}</h1>
            <p className={styles.userEmail}>{user?.email}</p>
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
                <div className={`${styles.iconBox} ${styles.blueBox}`}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.itemInfo}>
                  <h4>Verified Physics Seminar</h4>
                  <p>Today at 10:30 AM • Auditorium A</p>
                </div>
              </div>
              <div className={styles.listItem}>
                <div className={`${styles.iconBox} ${styles.redBox}`}>
                  <XCircle size={20} />
                </div>
                <div className={styles.itemInfo}>
                  <h4>Unattended Lab Session</h4>
                  <p>Yesterday at 2:00 PM • Chemistry Lab B</p>
                </div>
              </div>
              <div className={styles.listItem}>
                <div className={`${styles.iconBox} ${styles.yellowBox}`}>
                  <Clock size={20} />
                </div>
                <div className={styles.itemInfo}>
                  <h4>Pending Evaluation</h4>
                  <p>2 days ago • Portal Submission</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.announcementCard}>
            <div className={styles.cardHeader}>
              <Bell size={20} color="#2563eb" />
              <h2>Notice Board</h2>
            </div>
            <div className={styles.announcementStack}>
              <div className={styles.announcement}>
                <h4>Schedule Update</h4>
                <p>Morning sessions for Engineering blocks have moved to Room 201.</p>
              </div>
              <div className={styles.announcement}>
                <h4>Attendance Policy</h4>
                <p>Ensure your digital ID is scanned within 15 minutes of session start.</p>
              </div>
              <div className={styles.announcement}>
                <h4>Holiday Notice</h4>
                <p>Institutional services will be suspended for the upcoming long weekend.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}