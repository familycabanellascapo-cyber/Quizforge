import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDentalAgent } from '@/lib/dentalAgent';
import twilio from 'twilio';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Validates that the request genuinely comes from Twilio
function validateTwilioSignature(request, body) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true; // skip validation in development

  const signature  = request.headers.get('x-twilio-signature') || '';
  const url        = `${process.env.NEXT_PUBLIC_URL}/api/dental/whatsapp`;
  return twilio.validateRequest(authToken, signature, url, body);
}

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const formData = await request.formData();
    const body     = Object.fromEntries(formData);

    if (!validateTwilioSignature(request, body)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const fromRaw    = body.From   || '';         // "whatsapp:+34612345678"
    const messageText = body.Body  || '';
    const phone      = fromRaw.replace('whatsapp:', '');

    if (!phone || !messageText.trim()) {
      return new NextResponse(twimlMessage('Lo siento, no entendí tu mensaje.'), {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // Load existing conversation (keyed by phone + channel)
    const { data: conv } = await supabase
      .from('dental_conversations')
      .select('*')
      .eq('phone_number', phone)
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let history = conv?.conversation_history || [];

    // Append patient message
    history.push({ role: 'user', content: messageText });

    // Run AI agent
    const { response, updatedHistory } = await runDentalAgent(history, phone);

    // Persist conversation
    if (conv) {
      await supabase
        .from('dental_conversations')
        .update({ conversation_history: updatedHistory, updated_at: new Date().toISOString() })
        .eq('id', conv.id);
    } else {
      await supabase
        .from('dental_conversations')
        .insert({ phone_number: phone, channel: 'whatsapp', conversation_history: updatedHistory });
    }

    return new NextResponse(twimlMessage(response), {
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (err) {
    console.error('[WhatsApp webhook]', err);
    return new NextResponse(
      twimlMessage('Ocurrió un error interno. Por favor intente de nuevo.'),
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }
}

function twimlMessage(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escXML(text)}</Message>
</Response>`;
}

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
