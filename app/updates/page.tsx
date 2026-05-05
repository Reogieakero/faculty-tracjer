'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Import your client
import styles from './updates.module.css';

export default function UpdatesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState('All');
  const [userProgram, setUserProgram] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProgram = async () => {
      try {
        // 1. Get the current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Fetch the program from the students table
        const { data, error } = await supabase
          .from('students')
          .select('program')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // 3. Set the program state (e.g., "bs-psycho")
        const programFromDb = data?.program || null;
        console.log("DEBUG: Database Program:", programFromDb);
        setUserProgram(programFromDb);
        
      } catch (error) {
        console.error("DEBUG: Error fetching program:", error);
      }
    };

    fetchUserProgram();
  }, []);

  // Define your announcements after fetching the program
  const announcements = [
    {
      id: 1,
      label: "General",
      title: "New Tracking Features",
      content: "We've improved the map system. Vehicle locations now update more smoothly for everyone.",
      date: "May 05, 2026",
      program: "All"
    },
    {
      id: 2,
      label: "Department",
      title: `${userProgram} Notice`,
      content: `Specific updates for students enrolled in the ${userProgram} program.`,
      date: "May 03, 2026",
      program: userProgram // This matches the ID from your database (e.g., 'bs-psycho')
    }
  ];

  const filteredUpdates = announcements.filter(item => 
    activeTab === 'All' || item.program === activeTab
  );

  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Announcements</h1>
            <p className={styles.subtitle}>Check the latest news and campus updates.</p>
          </div>

          <div className={styles.controls}>
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
                  {/* Visual label formatting for the tab */}
                  {userProgram === 'bs-psycho' ? 'BS Psycho' : 
                   userProgram === 'bs-devcom' ? 'BS DevCom' : 
                   userProgram === 'bs-polsci' ? 'BS PolSci' : userProgram}
                </button>
              )}
            </div>

            <div className={styles.tabGroup}>
              <button 
                className={`${styles.tabBtn} ${viewMode === 'list' ? styles.activeTab : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
              <button 
                className={`${styles.tabBtn} ${viewMode === 'grid' ? styles.activeTab : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className={viewMode === 'list' ? styles.listLayout : styles.gridLayout}>
          {filteredUpdates.map((item) => (
            <div key={item.id} className={styles.updateCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.categoryLabel}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                  <Calendar size={12} />
                  <span style={{ fontSize: '11px' }}>{item.date}</span>
                </div>
              </div>
              <h3 className={styles.updateTitle}>{item.title}</h3>
              <p className={styles.content}>{item.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}