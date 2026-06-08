import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const date   = searchParams.get('date');
  const status = searchParams.get('status');
  const from   = searchParams.get('from') || new Date().toISOString().split('T')[0];

  let query = supabase
    .from('dental_appointments')
    .select('*')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (date)   query = query.eq('appointment_date', date);
  if (!date)  query = query.gte('appointment_date', from);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointments: data });
}

export async function POST(request) {
  const supabase = getSupabase();
  const body = await request.json();
  const { patient_name, patient_phone, appointment_date, appointment_time, service, notes, channel } = body;

  if (!patient_name || !patient_phone || !appointment_date || !appointment_time || !service) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
  }

  // Check slot availability
  const { data: existing } = await supabase
    .from('dental_appointments')
    .select('id')
    .eq('appointment_date', appointment_date)
    .eq('appointment_time', appointment_time)
    .in('status', ['confirmed', 'pending']);

  if (existing?.length > 0) {
    return NextResponse.json({ error: 'El horario ya está ocupado.' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('dental_appointments')
    .insert({ patient_name, patient_phone, appointment_date, appointment_time, service, notes: notes || '', channel: channel || 'manual', status: 'confirmed' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointment: data }, { status: 201 });
}

export async function PATCH(request) {
  const supabase = getSupabase();
  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });

  const { data, error } = await supabase
    .from('dental_appointments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointment: data });
}

export async function DELETE(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });

  const { error } = await supabase
    .from('dental_appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
