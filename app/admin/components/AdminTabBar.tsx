'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  History, 
  ShieldCheck 
} from 'lucide-react';
import styles from './tabbar.module.css';

const tabs = [
  { name: 'Home', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
  { name: 'Students', icon: <Users size={20} />, path: '/admin/students' },
  { name: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
  { name: 'Logs', icon: <History size={20} />, path: '/admin/logs' },
  { name: 'Security', icon: <ShieldCheck size={20} />, path: '/admin/security' },
];

export default function AdminTabBar() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  return (
    <div className={styles.wrapper}>
      <nav 
        className={`${styles.container} ${isHovered ? styles.expanded : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.trigger}>
          <Menu size={22} />
        </div>

        <div className={styles.navItems}>
          {tabs.map((tab, idx) => {
            const isActive = pathname === tab.path;
            return (
              <Link 
                key={tab.path} 
                href={tab.path}
                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                style={{ transitionDelay: isHovered ? `${idx * 30}ms` : '0ms' }}
              >
                <div className={styles.iconBox}>{tab.icon}</div>
                <span className={styles.label}>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}