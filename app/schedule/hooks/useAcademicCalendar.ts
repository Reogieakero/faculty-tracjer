import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAcademicCalendar() {
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Get User Program
      const { data: studentData } = await supabase
        .from('students')
        .select('program')
        .eq('id', user.id)
        .single();

      const program = studentData?.program || 'All';
      setUserProgram(program);

      // 2. Calculate Month Range for Filtering
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      // 3. Fetch Real Events from Supabase
      const { data: dbEvents, error } = await supabase
        .from('events')
        .select('*')
        .or(`program.eq.All,program.eq.${program}`)
        .gte('event_date', firstDay)
        .lte('event_date', lastDay);

      if (!error && dbEvents) {
        const formattedEvents = dbEvents.map(ev => {
          const dateObj = new Date(ev.event_date);
          return {
            ...ev,
            day: dateObj.getDate(),
            // Format time from 24h (HH:mm:ss) to 12h (hh:mm AM/PM)
            time: ev.start_time ? new Date(`1970-01-01T${ev.start_time}`).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'TBA',
            color: 'blue'
          };
        });
        setEvents(formattedEvents);
      }
      
      setLoading(false);
    };

    fetchScheduleData();
  }, [currentDate]); // Refetch when the user changes months

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