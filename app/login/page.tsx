'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sileo } from 'sileo';
import styles from './login.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      sileo.success({ title: "Welcome back!" });
      window.location.href = '/dashboard';
    } catch (error: any) {
      sileo.error({ 
        title: "Login Failed", 
        description: "Invalid credentials or account not found." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' }
      },
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftPanel}>
        <svg className={styles.constellationBg} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <path className={styles.constelLine} d="M100,200 L300,150 L250,400 Z" fill="none" />
          <path className={styles.constelLine} d="M300,150 L550,200 L480,350 L250,400 Z" fill="none" opacity="0.5"/>
          <path className={styles.constelLine} d="M550,200 L800,100 L900,300 Z" fill="none"/>
          <circle className={styles.constelNode} cx="100" cy="200" r="3" />
          <circle className={styles.constelNode} cx="300" cy="150" r="4" />
          <circle className={styles.constelNode} cx="550" cy="200" r="3" />
        </svg>

        <div className={styles.brand}>
          <div className={styles.brandIcon}><LayoutDashboard size={18} /></div>
          <span className={styles.brandName}>PolyTrack</span>
        </div>

        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Login your account to<br />
            <span className={styles.accent}>LIBERALIS tracker</span>
          </h2>
          <p className={styles.heroDesc}>
            Access your personalized academic dashboard to manage attendance, 
            track program progress, and stay updated with campus announcements.
          </p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Welcome Back</h1>
            <p className={styles.formSubtitle}>Sign in to your account to continue.</p>
          </div>

          <form className={styles.form} onSubmit={handleManualLogin}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input 
                  type="email" 
                  className={styles.lineInput} 
                  placeholder="name@dorsu.edu.ph" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <span className={styles.inputLine}></span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
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
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
            
            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="18" height="18" />
              Sign in with Google
            </button>
          </form>

          <p className={styles.footerText}>
            Don't have an account? <Link href="/register" className={styles.createLink}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}