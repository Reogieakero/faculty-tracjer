'use client';
import { useEffect, useState, Suspense } from 'react'; // 1. Added Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { sileo } from 'sileo';

// 2. Move your logic into a sub-component
function AuthCallbackContent() {
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

          if (type === 'login' && isNewUser) {
            sileo.error({
              title: "Access Denied",
              description: "This Google account is not registered. Please sign up first.",
            });
            await supabase.auth.signOut();
            return router.push('/register');
          }

          if (isNewUser) {
            setStatus('Account created successfully!');
            await supabase.auth.signOut();
            return router.push('/login?message=Successfully signed up with Google. Please log in to continue.');
          }

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
    <div style={{ textAlign: 'center' }}>
      <p style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: '500' }}>{status}</p>
      <div className="loader"></div>
    </div>
  );
}

// 3. Keep this as the default export and wrap the content in Suspense
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