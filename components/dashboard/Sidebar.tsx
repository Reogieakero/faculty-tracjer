'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  UserCheck,
  ChevronRight,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Megaphone size={20} />, label: 'Announcement', href: '/updates' },
    { icon: <Calendar size={20} />, label: 'Schedule', href: '/schedule' },
    { icon: <UserCheck size={20} />, label: 'Attendance', href: '/attendance' },
  ];

  const handleToggle = () => {
    if (!isMobile) setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside
        className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}
        onClick={handleToggle}
      >
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <LayoutDashboard size={18} color="white" />
            </div>
            {isExpanded && <span className={styles.brandName}>PolyTrack</span>}
          </div>

          <nav className={styles.nav}>
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(item.href);
                }}
              >
                <div className={styles.iconWrapper}>{item.icon}</div>
                {(isExpanded || isMobile) && <span className={styles.label}>{item.label}</span>}
                {isExpanded && isActive(item.href) && <div className={styles.activePip} />}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottomSection}>
          <div
            className={`${styles.navItem} ${isActive('/settings') ? styles.navItemActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push('/settings');
            }}
          >
            <div className={styles.iconWrapper}><Settings size={20} /></div>
            {(isExpanded || isMobile) && <span className={styles.label}>Settings</span>}
            {isExpanded && isActive('/settings') && <div className={styles.activePip} />}
          </div>

          <div
            className={styles.navItem}
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
          >
            <div className={styles.iconWrapper}><LogOut size={20} /></div>
            {(isExpanded || isMobile) && <span className={styles.label}>Logout</span>}
          </div>

          {!isMobile && (
            <div className={styles.toggleHint}>
              <ChevronRight
                size={14}
                className={`${styles.chevron} ${isExpanded ? styles.rotate : ''}`}
              />
            </div>
          )}
        </div>
      </aside>

      {isMobile && (
        <div className={styles.mobileMenuWrapper} ref={menuRef}>
          <button
            className={`${styles.hamburgerBtn} ${menuOpen ? styles.hamburgerActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(prev => !prev);
            }}
            aria-label="More options"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className={`${styles.mobilePopup} ${menuOpen ? styles.mobilePopupOpen : ''}`}>
            <div
              className={`${styles.popupItem} ${isActive('/settings') ? styles.popupItemActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                router.push('/settings');
                setMenuOpen(false);
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </div>
            <div className={styles.popupDivider} />
            <div
              className={`${styles.popupItem} ${styles.popupItemLogout}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}