'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { sileo } from 'sileo';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying account...');

  useEffect(() => {
    const type = searchParams.get('type');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Wait for an actual sign in event
      if (event === 'SIGNED_IN' && session) {
        const createdAt = new Date(session.user.created_at).getTime();
        const lastSignIn = new Date(session.user.last_sign_in_at!).getTime();
        
        // Allow a 5 second window to account for timing differences
        const isNewUser = Math.abs(createdAt - lastSignIn) < 5000;

        if (type === 'login' && isNewUser) {
          sileo.error({
            title: "Access Denied",
            description: "This Google account is not registered. Please sign up first.",
          });
          await supabase.auth.signOut();
          subscription.unsubscribe();
          return router.push('/register');
        }

        if (isNewUser) {
          setStatus('Account created successfully!');
          await supabase.auth.signOut();
          subscription.unsubscribe();
          return router.push('/login?message=Successfully signed up with Google. Please log in to continue.');
        }

        subscription.unsubscribe();
        router.push('/dashboard');

      } else if (event === 'SIGNED_OUT') {
        subscription.unsubscribe();
        router.push('/login');
      }
    });

    // Fallback: if no auth event fires after 8 seconds, redirect to login
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.push('/login');
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: '500' }}>{status}</p>
      <div className="loader"></div>
    </div>
  );
}

export default function AuthCallbackProcessing() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f8fafc',
      color: '#1e293b',
    }}>
      <Suspense fallback={<p>Loading...</p>}>
        <AuthCallbackContent />
      </Suspense>

      <style jsx>{`
        .loader {
          border: 3px solid rgba(13, 11, 80, 0.1);
          border-radius: 50%;
          border-top: 3px solid #0D0B50;
          width: 28px;
          height: 28px;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}