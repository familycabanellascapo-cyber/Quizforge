import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const phone   = searchParams.get('phone');
  const channel = searchParams.get('channel');

  let query = supabase
    .from('dental_conversations')
    .select('id, phone_number, channel, session_id, conversation_history, appointment_id, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (phone)   query = query.eq('phone_number', phone);
  if (channel) query = query.eq('channel', channel);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}
