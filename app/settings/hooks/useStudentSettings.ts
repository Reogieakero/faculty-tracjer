import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useStudentSettings() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();
      setStudent(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    getProfile();
  }, []);

  const uploadAvatar = async (file: File) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setStudent((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveName = async (newName: string) => {
    setIsSaving(true);
    setShowSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('students')
        .update({ full_name: newName })
        .eq('id', user.id);

      if (error) throw error;
      
      setStudent((prev: any) => ({ ...prev, full_name: newName }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return { student, loading, saveName, uploadAvatar, isSaving, showSuccess };
}