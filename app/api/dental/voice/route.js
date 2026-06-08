import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDentalAgent } from '@/lib/dentalAgent';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const CLINIC_NAME = process.env.DENTAL_CLINIC_NAME || 'Clínica Dental Sonrisa';
const BASE_URL    = process.env.NEXT_PUBLIC_URL     || 'https://tu-dominio.com';

// Keywords that signal the patient wants to end the call
const FAREWELL_WORDS = ['hasta luego', 'adiós', 'adios', 'gracias', 'que tenga', 'buenas tardes', 'buenas noches'];

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const formData   = await request.formData();
    const body       = Object.fromEntries(formData);
    const callSid    = body.CallSid    || '';
    const from       = body.From       || '';
    const speechResult = body.SpeechResult || '';

    // --- First call: no speech yet — play greeting ---
    if (!speechResult) {
      // Create conversation record for this call
      await supabase
        .from('dental_conversations')
        .insert({
          phone_number: from,
          channel: 'phone',
          session_id: callSid,
          conversation_history: []
        });

      const greeting = `Bienvenido a ${CLINIC_NAME}. Soy su asistente virtual. ¿En qué puedo ayudarle hoy?`;
      return xmlResponse(buildGather(greeting));
    }

    // --- Subsequent turns: process speech and respond ---
    const { data: conv } = await supabase
      .from('dental_conversations')
      .select('*')
      .eq('session_id', callSid)
      .single();

    let history = conv?.conversation_history || [];
    history.push({ role: 'user', content: speechResult });

    const { response, updatedHistory } = await runDentalAgent(history, from);

    await supabase
      .from('dental_conversations')
      .update({ conversation_history: updatedHistory, updated_at: new Date().toISOString() })
      .eq('session_id', callSid);

    const lower     = response.toLowerCase();
    const isEnd     = FAREWELL_WORDS.some(w => lower.includes(w));
    const twiml     = isEnd ? buildFarewell(response) : buildGather(response);

    return xmlResponse(twiml);
  } catch (err) {
    console.error('[Voice webhook]', err);
    const errMsg = 'Lo siento, hubo un problema técnico. Por favor llame de nuevo más tarde.';
    return xmlResponse(buildFarewell(errMsg));
  }
}

// --- TwiML builders ---

function buildGather(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${BASE_URL}/api/dental/voice" method="POST"
          language="es-ES" speechTimeout="3" speechModel="phone_call">
    <Say voice="Polly.Conchita" language="es-ES">${esc(text)}</Say>
  </Gather>
  <Say voice="Polly.Conchita" language="es-ES">No he recibido ninguna respuesta. Gracias por llamar a ${esc(CLINIC_NAME)}. Hasta luego.</Say>
  <Hangup/>
</Response>`;
}

function buildFarewell(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Conchita" language="es-ES">${esc(text)}</Say>
  <Hangup/>
</Response>`;
}

function xmlResponse(body) {
  return new NextResponse(body, { headers: { 'Content-Type': 'text/xml' } });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
