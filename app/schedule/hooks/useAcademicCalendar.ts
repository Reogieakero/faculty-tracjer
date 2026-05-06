import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface AcademicEvent {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string | null;
  program: string;
  description?: string;
}

export function useAcademicCalendar() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [isClient, setIsClient] = useState(false);
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [events, setEvents] = useState<(AcademicEvent & { day: number; time: string; color: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchScheduleData = useCallback(async () => {
    if (!isClient) return;
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: studentData } = await supabase
      .from('students')
      .select('program')
      .eq('id', user.id)
      .single();

    const program = studentData?.program || 'All';
    setUserProgram(program);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).toISOString();
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data: dbEvents, error } = await supabase
      .from('events')
      .select('*')
      .or(`program.eq.All,program.eq.${program}`)
      .gte('event_date', firstDay)
      .lte('event_date', lastDay);

    if (!error && dbEvents) {
      const formattedEvents = dbEvents.map((ev: any) => {
        const dateObj = new Date(ev.event_date);
        return {
          ...ev,
          day: dateObj.getDate(),
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
  }, [currentDate, isClient, supabase]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const totalDays = useMemo(() => 
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(),
    [currentDate]
  );

  const firstDayIndex = useMemo(() => 
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(),
    [currentDate]
  );

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [totalDays, firstDayIndex]);

  return {
    userProgram,
    currentDate,
    setCurrentDate,
    events,
    calendarDays,
    loading: loading || !isClient,
    monthName: currentDate.toLocaleString('default', { month: 'long' }),
    year: currentDate.getFullYear()
  };
}