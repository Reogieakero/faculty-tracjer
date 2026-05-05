import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useStudentProfile() {
  const [user, setUser] = useState<{ name: string; email: string; studentId: string; program: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: studentData } = await supabase
        .from('students')
        .select('student_id, full_name, program')
        .eq('id', authUser.id)
        .single();

      const existingId = studentData?.student_id || authUser.user_metadata?.student_id || '';
      const existingProgram = studentData?.program || authUser.user_metadata?.program || '';

      setUser({
        name: studentData?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        studentId: existingId,
        program: existingProgram,
      });
    }
    setLoading(false);
  };

  const updateProfile = async (id: string, prog: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    await supabase.auth.updateUser({
      data: { student_id: id, program: prog }
    });

    const { error } = await supabase
      .from('students')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name ?? null,
        student_id: id,
        program: prog,
      }, { onConflict: 'id' });

    if (!error) {
      setUser(prev => prev ? { ...prev, studentId: id, program: prog } : null);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return { user, loading, updateProfile };
}