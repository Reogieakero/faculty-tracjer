'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Menu, X, Moon, Sun } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    if (currentTheme) setTheme(currentTheme);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('polytrack-theme', nextTheme);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Liberalis Tracker</span>
        </Link>

        <div className={`${styles.navLinks} ${isOpen ? styles.active : ''}`}>
          <a href="#features" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#how" onClick={() => setIsOpen(false)}>How it Works</a>
          <a href="#stats" onClick={() => setIsOpen(false)}>Stats</a>
          <a href="#testimonials" onClick={() => setIsOpen(false)}>Testimonials</a>
          
          <div className={styles.mobileActions}>
            <Link href="/login" className={styles.loginBtnMobile} onClick={() => setIsOpen(false)}>
              Login
            </Link>
            <button className={styles.getStartedBtnMobile}>Get Started Free</button>
          </div>
        </div>

        <div className={styles.navActions}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )}
          </button>
          
          <Link href="/login" className={styles.loginBtn}>
            Login
          </Link>
          
          <button className={styles.getStartedBtn}>Get Started Free</button>

          <button 
            className={styles.hamburger} 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
}