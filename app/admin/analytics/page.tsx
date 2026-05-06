'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Calendar, MapPin, Loader2, TrendingUp } from 'lucide-react';
import AdminTabBar from '../components/AdminTabBar';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [isClient, setIsClient] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [completedEvents, setCompletedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchEventData = useCallback(async () => {
    // Strictly fetching events with 'completed' status
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'completed')
      .order('event_date', { ascending: false });

    if (!error) {
      setCompletedEvents(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!isClient) return;

    const checkAdminAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@dorsu.edu.ph";

      if (!user || user.email !== adminEmail) {
        router.replace('/login');
        return;
      }
      
      await fetchEventData();
      setVerifying(false);
    };

    checkAdminAuth();
  }, [isClient, router, supabase, fetchEventData]);

  // Loading state with obsidian theme styling
  if (!isClient || verifying) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#0D0B50' 
      }}>
        <Loader2 className={styles.spinner} size={32} color="white" />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <TrendingUp size={24} className={styles.headerIcon} />
          <h1 className={styles.title}>Event Performance</h1>
        </div>
        <p className={styles.subtitle}>Detailed analytics for institutional completed activities</p>
      </header>

      <div className={styles.threeColumnGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} />
            <span>Analyzing database...</span>
          </div>
        ) : completedEvents.length === 0 ? (
          <div className={styles.emptyState}>No completed events found.</div>
        ) : (
          completedEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.cardTop}>
                <span className={styles.programBadge}>{event.program}</span>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={14} />
                    <span>{event.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartLabel}>Attendance Volume</span>
                  <span className={styles.totalCount}>{event.attendees_count}</span>
                </div>
                
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={[{ name: 'Actual', count: event.attendees_count }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" hide />
                      <YAxis axisLine={false} tickLine={false} hide />
                      <Tooltip 
                        cursor={{ fill: 'rgba(13, 11, 80, 0.05)' }}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#0D0B50" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminTabBar />
    </div>
  );
}