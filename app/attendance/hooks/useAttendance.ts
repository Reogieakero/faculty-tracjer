import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  location: string | null;
  status: 'Present' | 'Late' | 'Absent';
  time_in: string;
  scanned_at: string;
  event_start_time: string | null;
}

export interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

const LATE_THRESHOLD_MINUTES = 15;

function formatTimeIn(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function resolveStatus(scannedAt: string, eventStartTime: string | null, eventDate: string): 'Present' | 'Late' {
  if (!eventStartTime) return 'Present';

  const scanTime = new Date(scannedAt);
  const [hours, minutes] = eventStartTime.split(':').map(Number);
  const eventStart = new Date(eventDate);
  eventStart.setHours(hours, minutes, 0, 0);

  const diffMinutes = (scanTime.getTime() - eventStart.getTime()) / 60000;
  return diffMinutes > LATE_THRESHOLD_MINUTES ? 'Late' : 'Present';
}

export function useAttendance() {
  const [userProgram, setUserProgram] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [missedEvents, setMissedEvents] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: studentData } = await supabase
          .from('students')
          .select('program')
          .eq('id', user.id)
          .single();

        const program = studentData?.program || null;
        setUserProgram(program);

        const [scansRes, eventsRes] = await Promise.all([
          supabase
            .from('scan_logs')
            .select(`
              id,
              scanned_at,
              events (
                id,
                title,
                location,
                event_date,
                start_time
              )
            `)
            .eq('student_id', user.id)
            .order('scanned_at', { ascending: false }),

          program
            ? supabase
                .from('events')
                .select('id, title, location, event_date, start_time')
                .or(`program.eq.All,program.eq.${program}`)
                .lte('event_date', new Date().toISOString().split('T')[0])
                .order('event_date', { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);

        const scannedEventIds = new Set(
          (scansRes.data || []).map((s: any) => s.events?.id).filter(Boolean)
        );

        const attended: AttendanceRecord[] = (scansRes.data || []).map((scan: any) => ({
          id: scan.id,
          date: formatDate(scan.events?.event_date || scan.scanned_at),
          subject: scan.events?.title ?? 'Unknown Event',
          location: scan.events?.location ?? null,
          status: resolveStatus(scan.scanned_at, scan.events?.start_time, scan.events?.event_date || scan.scanned_at),
          time_in: formatTimeIn(scan.scanned_at),
          scanned_at: scan.scanned_at,
          event_start_time: scan.events?.start_time ?? null,
        }));

        const missed: AttendanceRecord[] = (eventsRes.data || [])
          .filter((event: any) => !scannedEventIds.has(event.id))
          .map((event: any) => ({
            id: `absent-${event.id}`,
            date: formatDate(event.event_date),
            subject: event.title,
            location: event.location ?? null,
            status: 'Absent' as const,
            time_in: '--',
            scanned_at: event.event_date,
            event_start_time: event.start_time ?? null,
          }));

        const all = [...attended, ...missed].sort(
          (a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()
        );

        setAttendance(all);
        setMissedEvents(missed);
      } catch (err) {
        console.error('Attendance fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats: AttendanceStats = {
    present: attendance.filter(r => r.status === 'Present').length,
    late: attendance.filter(r => r.status === 'Late').length,
    absent: attendance.filter(r => r.status === 'Absent').length,
    total: attendance.length,
    attendanceRate: attendance.length > 0
      ? Math.round((attendance.filter(r => r.status !== 'Absent').length / attendance.length) * 100)
      : 0,
  };

  return { attendance, missedEvents, userProgram, stats, loading };
}