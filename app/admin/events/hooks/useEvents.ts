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
      setEvents(data || []);
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