import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDentalAgent, getClinicByToken } from '@/lib/dentalAgent';
import twilio from 'twilio';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function validateTwilioSignature(request, body, url) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true;
  const sig = request.headers.get('x-twilio-signature') || '';
  return twilio.validateRequest(authToken, sig, url, body);
}

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');         // clinic identifier in Twilio webhook URL

    const formData = await request.formData();
    const body     = Object.fromEntries(formData);

    const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/dental/whatsapp${token ? `?token=${token}` : ''}`;
    if (!validateTwilioSignature(request, body, webhookUrl)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const fromRaw  = body.From || '';
    const msgText  = body.Body || '';
    const phone    = fromRaw.replace('whatsapp:', '');

    if (!phone || !msgText.trim()) {
      return xmlMsg('Lo siento, no entendí tu mensaje.');
    }

    // Load clinic config from DB using the token in the webhook URL
    const clinic = token ? await getClinicByToken(token) : null;
    const clinicId = clinic?.id || null;

    // Load or create conversation (scoped to clinic)
    let convQuery = supabase.from('dental_conversations').select('*').eq('phone_number', phone).eq('channel', 'whatsapp');
    if (clinicId) convQuery = convQuery.eq('clinic_id', clinicId);
    const { data: conv } = await convQuery.order('created_at', { ascending: false }).limit(1).single();

    let history = conv?.conversation_history || [];
    history.push({ role: 'user', content: msgText });

    const { response, updatedHistory } = await runDentalAgent(history, phone, clinic);

    const convRow = { phone_number: phone, channel: 'whatsapp', conversation_history: updatedHistory, updated_at: new Date().toISOString() };
    if (clinicId) convRow.clinic_id = clinicId;

    if (conv) {
      await supabase.from('dental_conversations').update(convRow).eq('id', conv.id);
    } else {
      await supabase.from('dental_conversations').insert(convRow);
    }

    return xmlMsg(response);
  } catch (err) {
    console.error('[WhatsApp webhook]', err);
    return xmlMsg('Ocurrió un error interno. Por favor intente de nuevo.');
  }
}

function xmlMsg(text) {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${esc(text)}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  );
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
