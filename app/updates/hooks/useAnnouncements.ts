import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAnnouncements() {
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProgram = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('students')
          .select('program')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProgram(data?.program || null);
      } catch (error) {
        console.error("Error fetching program:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgram();
  }, []);

  const announcements = [
    {
      id: 1,
      label: "General",
      title: "New Tracking Features",
      content: "We've improved the map system. Vehicle locations now update more smoothly for everyone.",
      date: "May 05, 2026",
      program: "All"
    },
    {
      id: 2,
      label: "Department",
      title: `${userProgram} Notice`,
      content: `Specific updates for students enrolled in the ${userProgram} program.`,
      date: "May 03, 2026",
      program: userProgram 
    }
  ];

  return { announcements, userProgram, loading };
}