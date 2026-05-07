'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  start_time: string | null;
  attendees_count: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  program: string;
  image_url: string | null;
  scanner_password: string | null;
  scanner_password_visible: boolean;
}

export function useEvents() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const staleIds: string[] = [];
      const ongoingIds: string[] = [];

      (data || []).forEach((e) => {
        if (e.status === 'completed') return;

        const eventDate = new Date(e.event_date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          staleIds.push(e.id);
          return;
        }

        if (eventDate.getTime() === today.getTime() && e.start_time) {
          const [hours, minutes] = e.start_time.split(':').map(Number);
          const eventStart = new Date();
          eventStart.setHours(hours, minutes, 0, 0);

          if (now >= eventStart && e.status === 'upcoming') {
            ongoingIds.push(e.id);
          }
        }
      });

      if (staleIds.length > 0) {
        await supabase
          .from('events')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .in('id', staleIds);
      }

      if (ongoingIds.length > 0) {
        await supabase
          .from('events')
          .update({ status: 'ongoing', updated_at: new Date().toISOString() })
          .in('id', ongoingIds);
      }

      const patched = (data || []).map((e) => {
        if (staleIds.includes(e.id)) return { ...e, status: 'completed' as const };
        if (ongoingIds.includes(e.id)) return { ...e, status: 'ongoing' as const };
        return e;
      });

      setEvents(patched);
    } catch (err) {
      console.error(err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    events,
    filteredEvents,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchEvents,
    deleteEvent,
  };
}