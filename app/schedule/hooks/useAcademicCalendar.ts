import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAcademicCalendar() {
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('students')
          .select('program')
          .eq('id', user.id)
          .single();

        const program = data?.program || null;
        setUserProgram(program);

        const mockEvents = [
          { id: 1, title: 'Physics Seminar', time: '10:30 AM', day: 5, program: 'All', color: 'blue' },
          { id: 2, title: 'Dept Meeting', time: '1:00 PM', day: 7, program: program, color: 'blue' },
          { id: 3, title: 'Lab Session', time: '2:00 PM', day: 12, program: 'All', color: 'blue' },
          { id: 4, title: 'Thesis Review', time: '9:00 AM', day: 19, program: program, color: 'blue' },
          { id: 5, title: 'Defense Prep', time: '3:30 PM', day: 22, program: 'All', color: 'blue' },
          { id: 6, title: 'Faculty Sync', time: '11:00 AM', day: 26, program: 'All', color: 'blue' },
        ];
        setEvents(mockEvents);
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayIndex = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  return {
    userProgram,
    currentDate,
    setCurrentDate,
    events,
    calendarDays,
    loading,
    monthName: currentDate.toLocaleString('default', { month: 'long' }),
    year: currentDate.getFullYear()
  };
}