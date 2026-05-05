'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { LayoutGrid, List } from 'lucide-react';
import { useAnnouncements } from './hooks/useAnnouncements';
import { UpdateCard } from './components/UpdateCard';
import styles from './updates.module.css';

export default function UpdatesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState('All');
  const { announcements, userProgram, loading } = useAnnouncements();

  if (loading) return null;

  const filteredUpdates = announcements.filter(item => 
    activeTab === 'All' || item.program === activeTab
  );

  const formatProgramLabel = (prog: string) => {
    const labels: Record<string, string> = {
      'bs-psycho': 'BS Psycho',
      'bs-devcom': 'BS DevCom',
      'bs-polsci': 'BS PolSci'
    };
    return labels[prog] || prog;
  };

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
                  {formatProgramLabel(userProgram)}
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
            <UpdateCard key={item.id} {...item} />
          ))}
        </div>
      </main>
    </div>
  );
}