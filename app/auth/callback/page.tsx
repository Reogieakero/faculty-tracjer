'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { sileo } from 'sileo';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying account...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      const type = searchParams.get('type');

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          const isNewUser = session.user.created_at === session.user.last_sign_in_at;
          
          // 1. Logic for Login attempt with an unregistered account
          if (type === 'login' && isNewUser) {
            sileo.error({ 
              title: "Access Denied", 
              description: "This Google account is not registered. Please sign up first." 
            });
            await supabase.auth.signOut();
            return router.push('/register');
          }

          // 2. Logic for a successful NEW Sign Up
          if (isNewUser) {
            setStatus('Account created successfully!');
            
            // We sign them out so they are forced to log in manually as requested
            await supabase.auth.signOut(); 
            
            // Redirect to login with the success message in the URL
            return router.push('/login?message=Successfully signed up with Google. Please log in to continue.');
          }

          // 3. Logic for existing user logging in
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };
    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', background: '#f8fafc', color: '#1e293b' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: '500' }}>{status}</p>
        <div className="loader"></div>
      </div>
      <style jsx>{`
        .loader {
          border: 3px solid rgba(13, 11, 80, 0.1);
          border-radius: 50%;
          border-top: 3px solid #0D0B50;
          width: 28px; height: 28px;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}