'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import { sileo } from 'sileo';
import { supabase } from '@/lib/supabase';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lastValidationId, setLastValidationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { requirements, allRequirementsMet } = useMemo(() => {
    const reqs = [
      { label: '8+ Characters', met: password.length >= 8 },
      { label: 'Uppercase', met: /[A-Z]/.test(password) },
      { label: 'Number', met: /[0-9]/.test(password) },
      { label: 'Special Char', met: /[^A-Za-z0-9]/.test(password) },
    ];
    return {
      requirements: reqs,
      allRequirementsMet: reqs.every(r => r.met)
    };
  }, [password]);

  useEffect(() => {
    if (password.length > 0 && !isFlipped) {
      if (lastValidationId) sileo.dismiss(lastValidationId);
      
      if (allRequirementsMet) {
        setLastValidationId(sileo.success({ title: 'Secure Password', duration: 2000 }));
      } else {
        const unmet = requirements.filter(r => !r.met).map(r => r.label).join(', ');
        setLastValidationId(sileo.warning({ title: 'Missing:', description: unmet, duration: null }));
      }
    }
    
    return () => {
      if (lastValidationId) sileo.dismiss(lastValidationId);
    };
  }, [allRequirementsMet, isFlipped]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      sileo.error({ title: "Google Auth Error", description: error.message });
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      sileo.error({ title: "Passwords don't match" });
      return;
    }
    if (!allRequirementsMet) {
      sileo.error({ title: "Weak Password" });
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        sileo.warning({ 
          title: "Account Exists", 
          description: "This email is already registered. Try logging in." 
        });
        return;
      }

      setIsFlipped(true);
      sileo.success({ title: "Email Sent", description: "Verify your account." });
    } catch (error: any) {
      sileo.error({ title: "Registration Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6) {
      sileo.error({ title: "Incomplete Code" });
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: token,
        type: 'signup',
      });
      if (error) throw error;
      sileo.success({ title: "Account Verified" });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      sileo.error({ title: "Verification Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
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
          <h2 className={styles.heroTitle}>Join the<br /><span className={styles.accent}>LIBERALIS tracker</span></h2>
          <p className={styles.heroDesc}>Create your account to manage your academic profile and stay updated with campus announcements.</p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={`${styles.flipContainer} ${isFlipped ? styles.isFlipped : ''}`}>
          <div className={styles.flipFront}>
            <div className={styles.formSection}>
              <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>Get Started</h1>
                <p className={styles.formSubtitle}>Create your account with your school email.</p>
              </div>

              <form className={styles.form} onSubmit={handleManualSignUp}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>School Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} size={18} />
                    <input 
                      type="email" 
                      className={styles.lineInput} 
                      placeholder="name@dorsu.edu.ph" 
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
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

                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Create Account'}
                </button>
                <div className={styles.divider}><span>or sign up with</span></div>

                <button type="button" className={styles.googleBtn} onClick={handleGoogleSignUp}>
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="18" height="18" />
                  Sign up with Google
                </button>
              </form>

              <p className={styles.footerText}>
                Already have an account? <Link href="/login" className={styles.loginLink}>Sign In</Link>
              </p>
            </div>
          </div>

          <div className={styles.flipBack}>
            <div className={styles.formSection} style={{ textAlign: 'center' }}>
              <div className={styles.iconCircle}>
                <ShieldCheck size={40} className={styles.accentIcon} />
              </div>
              <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>Verify email</h1>
                <p className={styles.formSubtitle}>6-digit code sent to <br /><strong>{userEmail}</strong></p>
              </div>
              <div className={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { if (el) inputRefs.current[index] = el; }}                   
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={styles.otpInput}
                  />
                ))}
              </div>
              <button 
                className={styles.submitBtn} 
                onClick={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Account'}
              </button>
              <button onClick={() => setIsFlipped(false)} className={styles.backBtn}>
                <ChevronLeft size={16} />
                Edit Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}