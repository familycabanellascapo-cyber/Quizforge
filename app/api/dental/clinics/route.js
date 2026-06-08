import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from('dental_clinics')
    .select('id, name, phone, twilio_phone, webhook_token, services, schedule, active, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clinics: data });
}

export async function POST(request) {
  const body = await request.json();
  const { name, phone, twilio_phone, services, schedule } = body;

  if (!name) return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });

  const { data, error } = await getSupabase()
    .from('dental_clinics')
    .insert({ name, phone: phone || '', twilio_phone: twilio_phone || '', services, schedule })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clinic: data }, { status: 201 });
}

export async function PATCH(request) {
  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });

  const { data, error } = await getSupabase()
    .from('dental_clinics')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clinic: data });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });

  const { error } = await getSupabase()
    .from('dental_clinics')
    .update({ active: false })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
