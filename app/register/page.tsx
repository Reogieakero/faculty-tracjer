'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { sileo } from 'sileo';
import { supabase } from '@/lib/supabase';
import styles from './register.module.css';

export default function RegisterPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lastValidationId, setLastValidationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      sileo.error({
        title: 'Registration Failed',
        description: error.message || 'Please try again',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special Char', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allRequirementsMet = requirements.every(req => req.met);

  useEffect(() => {
    if (password.length > 0) {
      if (lastValidationId) sileo.dismiss(lastValidationId);
      if (allRequirementsMet) {
        const id = sileo.success({ title: 'Secure!', description: 'All requirements met', duration: 2000 });
        setLastValidationId(id);
      } else {
        const unmet = requirements.filter(r => !r.met).map(r => r.label).join(', ');
        const id = sileo.warning({ title: 'Required:', description: unmet, duration: null });
        setLastValidationId(id);
      }
    } else if (lastValidationId) {
      sileo.dismiss(lastValidationId);
    }
  }, [password, allRequirementsMet]);

  return (
    <div className={styles.wrapper}>
      {/* ── LEFT PANEL (Exactly same as Login) ── */}
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
            Join the<br />
            <span className={styles.accent}>LIBERALIS tracker</span>
          </h2>
          <p className={styles.heroDesc}>
            Create your account to manage your academic profile, 
            track program progress, and stay updated with campus announcements.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.rightPanel}>
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Get Started</h1>
            <p className={styles.formSubtitle}>Create your account with your school email.</p>
          </div>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>School Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input type="email" className={styles.lineInput} placeholder="name@dorsu.edu.ph" required />
                <span className={styles.inputLine}></span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.lineInput}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.eyeToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <span className={styles.inputLine}></span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={styles.lineInput}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.eyeToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <span className={styles.inputLine}></span>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>Create Account</button>
            <div className={styles.divider}><span>or sign up with</span></div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogleSignUp} disabled={isLoading}>
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="18" height="18" />
              Sign up with Google
            </button>
          </form>

          <p className={styles.footerText}>
            Already have an account? <Link href="/login" className={styles.loginLink}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}