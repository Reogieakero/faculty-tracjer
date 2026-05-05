import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);
  try {
    const { email, password } = await req.json();

    // ── 1. Check against server-side env vars (never exposed to browser) ──
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    // ── 2. Sign into Supabase and get a real session ───────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // ── 3. Return the session to the client so it can be set ──────────────
    return NextResponse.json({ session: data.session }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json(
      { error: 'Server error: ' + (err?.message ?? 'Unknown') },
      { status: 500 }
    );
  }
}