'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { sileo } from 'sileo';
import styles from './admin-login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ── 1. Send credentials to the server-side API route ────────────
      //    ADMIN_EMAIL and ADMIN_PASSWORD never leave the server
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        sileo.error({
          title: 'Access Denied',
          description: result.error ?? 'Invalid administrator credentials.',
        });
        setIsLoading(false);
        return;
      }

      // ── 2. Set the Supabase session on the client ────────────────────
      //    This is what makes every subsequent fetch authenticated
      const { error: sessionError } = await supabase.auth.setSession(result.session);

      if (sessionError) {
        sileo.error({
          title: 'Session Error',
          description: sessionError.message,
        });
        setIsLoading(false);
        return;
      }

      // ── 3. All good — navigate to dashboard ──────────────────────────
      sileo.success({
        title: 'Access Granted',
        description: 'Welcome to the Command Center.',
      });

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);

    } catch (err: any) {
      sileo.error({
        title: 'Network Error',
        description: err?.message ?? 'Could not reach the server.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftPanel}>
        <svg className={styles.constellationBg} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <path className={styles.constelLine} d="M100,200 L300,150 L250,400 Z" fill="none" />
          <path className={styles.constelLine} d="M300,150 L550,200 L480,350 L250,400 Z" fill="none" opacity="0.5" />
          <path className={styles.constelLine} d="M550,200 L800,100 L900,300 Z" fill="none" />
          <circle className={styles.constelNode} cx="100" cy="200" r="3" />
          <circle className={styles.constelNode} cx="300" cy="150" r="4" />
          <circle className={styles.constelNode} cx="550" cy="200" r="3" />
        </svg>

        <div className={styles.brand}>
          <div className={styles.brandIcon}><ShieldCheck size={18} /></div>
          <span className={styles.brandName}>PolyTrack Admin</span>
        </div>

        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            System Control &<br />
            <span className={styles.accent}>Management Portal</span>
          </h2>
          <p className={styles.heroDesc}>
            Authorized personnel access for CITY HIGH Integrated System.
            Manage user roles, audit logs, and system configurations.
          </p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Admin Login</h1>
            <p className={styles.formSubtitle}>Enter security credentials to continue.</p>
          </div>

          <form className={styles.form} onSubmit={handleAdminLogin}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Administrator Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className={styles.lineInput}
                  placeholder="admin@dorsu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className={styles.inputLine}></span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Security Key</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.lineInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <span className={styles.inputLine}></span>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Access Dashboard'}
            </button>

            <div className={styles.securityNotice}>
              <ShieldCheck size={14} />
              <span>Secure Encrypted Connection Active</span>
            </div>
          </form>

          <p className={styles.footerText}>
            Forgot credentials? Contact the System Architect.
          </p>
        </div>
      </div>
    </div>
  );
}