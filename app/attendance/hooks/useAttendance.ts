import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAttendance() {
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('students')
          .select('program')
          .eq('id', user.id)
          .single();
        
        setUserProgram(data?.program || null);

        // Mock Data - In production, this would be a Supabase fetch
        setAttendance([
          { id: '1', date: '2026-05-04', subject: 'Cloud Computing', status: 'Present', time_in: '07:55 AM' },
          { id: '2', date: '2026-05-04', subject: 'HCI 2', status: 'Late', time_in: '10:15 AM' },
          { id: '3', date: '2026-05-03', subject: 'Capstone Project 1', status: 'Present', time_in: '01:50 PM' },
          { id: '4', date: '2026-05-02', subject: 'Networking 2', status: 'Absent', time_in: '--' },
          { id: '5', date: '2026-05-01', subject: 'Integrative Programming', status: 'Present', time_in: '08:02 AM' },
        ]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    present: attendance.filter(r => r.status === 'Present').length,
    late: attendance.filter(r => r.status === 'Late').length,
    absent: attendance.filter(r => r.status === 'Absent').length,
  };

  return { attendance, userProgram, stats, loading };
}