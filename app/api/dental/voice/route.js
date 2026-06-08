import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runDentalAgent, getClinicByToken } from '@/lib/dentalAgent';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://tu-dominio.com';
const FAREWELL = ['hasta luego','adiós','adios','gracias por llamar','que tenga','buenas tardes','buenas noches'];

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const formData    = await request.formData();
    const body        = Object.fromEntries(formData);
    const callSid     = body.CallSid || '';
    const from        = body.From    || '';
    const speechResult = body.SpeechResult || '';

    const clinic   = token ? await getClinicByToken(token) : null;
    const clinicId = clinic?.id || null;
    const clinicName = clinic?.name || process.env.DENTAL_CLINIC_NAME || 'Clínica Dental Sonrisa';

    const gatherUrl = `${BASE_URL}/api/dental/voice${token ? `?token=${token}` : ''}`;

    // --- First call: play greeting ---
    if (!speechResult) {
      const convRow = { phone_number: from, channel: 'phone', session_id: callSid, conversation_history: [] };
      if (clinicId) convRow.clinic_id = clinicId;
      await supabase.from('dental_conversations').insert(convRow);

      return xml(gather(`Bienvenido a ${clinicName}. Soy su asistente virtual. ¿En qué puedo ayudarle hoy?`, gatherUrl, clinicName));
    }

    // --- Subsequent turns ---
    const { data: conv } = await supabase.from('dental_conversations').select('*').eq('session_id', callSid).single();
    let history = conv?.conversation_history || [];
    history.push({ role: 'user', content: speechResult });

    const { response, updatedHistory } = await runDentalAgent(history, from, clinic);

    await supabase.from('dental_conversations').update({ conversation_history: updatedHistory, updated_at: new Date().toISOString() }).eq('session_id', callSid);

    const lower = response.toLowerCase();
    const isEnd = FAREWELL.some(w => lower.includes(w));
    return xml(isEnd ? farewell(response) : gather(response, gatherUrl, clinicName));

  } catch (err) {
    console.error('[Voice webhook]', err);
    return xml(farewell('Lo siento, hubo un problema técnico. Por favor llame de nuevo más tarde.'));
  }
}

function gather(text, actionUrl, clinicName) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${actionUrl}" method="POST" language="es-ES" speechTimeout="3" speechModel="phone_call">
    <Say voice="Polly.Conchita" language="es-ES">${esc(text)}</Say>
  </Gather>
  <Say voice="Polly.Conchita" language="es-ES">No he recibido respuesta. Gracias por llamar a ${esc(clinicName)}. Hasta luego.</Say>
  <Hangup/>
</Response>`;
}

function farewell(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Conchita" language="es-ES">${esc(text)}</Say>
  <Hangup/>
</Response>`;
}

function xml(body) { return new NextResponse(body, { headers: { 'Content-Type': 'text/xml' } }); }
function esc(s)    { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
