import styles from './Footer.module.css';
import { BarChart3, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logoText}>LIBERALIS
tracker</span>
          </div>
          <p className={styles.tagline}>
            Simplifying academic program management for faculty across all disciplines.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#stats">Statistics</a>
            <a href="#">Pricing</a>
          </div>
          {/* <div className={styles.col}>
            <h4>Programs</h4>
            <a href="#">Political Science</a>
            <a href="#">Development Communication</a>
            <a href="#">Psychology</a>
            <a href="#">All Programs</a>
          </div>
          <div className={styles.col}>
            <h4>Support</h4>
            <a href="#">Documentation</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div> */}
        </div>

        <div className={styles.bottom}>
          <span>© 2026 Liberalis. All rights reserved.</span>
          <span>Built for the Liberal community.</span>
        </div>
      </div>
    </footer>
  );
}