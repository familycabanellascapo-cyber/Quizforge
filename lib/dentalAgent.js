import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const CLINIC_NAME  = process.env.DENTAL_CLINIC_NAME  || 'Clínica Dental Sonrisa';
const CLINIC_PHONE = process.env.DENTAL_CLINIC_PHONE || '';

const SYSTEM_PROMPT = `Eres la recepcionista virtual de ${CLINIC_NAME}, una clínica dental.
Atiendes pacientes por WhatsApp y teléfono en español. Eres amable, concisa y profesional.

HORARIO:
- Lunes a Viernes: 09:00 - 18:00
- Sábados: 09:00 - 14:00
- Domingos y festivos: Cerrado

SERVICIOS:
- Consulta general (30 min)
- Limpieza dental (45 min)
- Extracción dental (45 min)
- Empaste / Obturación (45 min)
- Blanqueamiento dental (60 min)
- Ortodoncia – consulta inicial (60 min)
- Implantes dentales – consulta inicial (60 min)
- Urgencia dental (30 min – atención prioritaria)

FLUJO PARA AGENDAR CITA:
1. Saluda y pregunta en qué puedes ayudar.
2. Si desean cita, recopila: nombre completo, servicio, fecha y hora preferidas.
3. Verifica disponibilidad con las herramientas. Si no hay slot, ofrece alternativas.
4. Confirma todos los datos antes de agendar.
5. Usa book_appointment y envía resumen con fecha, hora y servicio.
6. Menciona que pueden confirmar llamando a ${CLINIC_PHONE || 'la clínica'}.

REGLAS:
- Responde siempre en español.
- Mensajes breves (máx 4 líneas) – recuerda que es WhatsApp/teléfono.
- Nunca inventes disponibilidad; siempre verifica con herramientas.
- Urgencias: indica que pueden acudir directamente a la clínica.
- Para cancelar o modificar, busca la cita con get_appointment_info.
- El teléfono del paciente es el número desde el que contacta.`;

const tools = [
  {
    name: 'get_available_slots',
    description: 'Retorna los horarios disponibles para una fecha.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Fecha YYYY-MM-DD' }
      },
      required: ['date']
    }
  },
  {
    name: 'check_slot_availability',
    description: 'Verifica si un horario concreto está libre.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Fecha YYYY-MM-DD' },
        time: { type: 'string', description: 'Hora HH:MM' }
      },
      required: ['date', 'time']
    }
  },
  {
    name: 'book_appointment',
    description: 'Agenda la cita. Úsalo SOLO después de que el paciente confirme todos los detalles.',
    input_schema: {
      type: 'object',
      properties: {
        patient_name:  { type: 'string', description: 'Nombre completo' },
        patient_phone: { type: 'string', description: 'Teléfono del paciente' },
        date:          { type: 'string', description: 'Fecha YYYY-MM-DD' },
        time:          { type: 'string', description: 'Hora HH:MM' },
        service:       { type: 'string', description: 'Servicio solicitado' },
        notes:         { type: 'string', description: 'Notas adicionales (opcional)' }
      },
      required: ['patient_name', 'patient_phone', 'date', 'time', 'service']
    }
  },
  {
    name: 'get_appointment_info',
    description: 'Busca citas futuras para el número de teléfono dado.',
    input_schema: {
      type: 'object',
      properties: {
        patient_phone: { type: 'string', description: 'Teléfono del paciente' }
      },
      required: ['patient_phone']
    }
  },
  {
    name: 'cancel_appointment',
    description: 'Cancela una cita existente por ID.',
    input_schema: {
      type: 'object',
      properties: {
        appointment_id: { type: 'string', description: 'UUID de la cita' }
      },
      required: ['appointment_id']
    }
  }
];

// --- Tool implementations ---

async function getAvailableSlots(date) {
  const d = new Date(date + 'T12:00:00Z');
  const day = d.getUTCDay(); // 0=Sun, 6=Sat

  if (day === 0) return { available: false, reason: 'Cerrado los domingos.' };

  const startH = 9;
  const endH   = day === 6 ? 14 : 18;

  const allSlots = [];
  for (let h = startH; h < endH; h++) {
    allSlots.push(`${String(h).padStart(2, '0')}:00`);
    if (h * 60 + 30 < endH * 60) allSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const { data: booked } = await getSupabase()
    .from('dental_appointments')
    .select('appointment_time')
    .eq('appointment_date', date)
    .in('status', ['confirmed', 'pending']);

  const bookedSet = new Set((booked || []).map(b => b.appointment_time));
  const available  = allSlots.filter(s => !bookedSet.has(s));

  return {
    date,
    available_slots: available,
    total: available.length,
    clinic_hours: day === 6 ? '09:00–14:00' : '09:00–18:00'
  };
}

async function checkSlotAvailability(date, time) {
  const { data } = await getSupabase()
    .from('dental_appointments')
    .select('id')
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .in('status', ['confirmed', 'pending']);

  return { available: !data || data.length === 0, date, time };
}

async function bookAppointment(input, patientPhone) {
  const { patient_name, patient_phone, date, time, service, notes = '' } = input;
  const phone = patientPhone || patient_phone;

  // Double-check slot is free
  const check = await checkSlotAvailability(date, time);
  if (!check.available) {
    return { success: false, error: 'El horario ya fue tomado. Por favor elige otro.' };
  }

  const { data, error } = await getSupabase()
    .from('dental_appointments')
    .insert({ patient_name, patient_phone: phone, appointment_date: date, appointment_time: time, service, status: 'confirmed', channel: 'whatsapp', notes })
    .select()
    .single();

  if (error) return { success: false, error: 'Error al guardar la cita. Intente de nuevo.' };

  return { success: true, appointment_id: data.id, patient_name, date, time, service };
}

async function getAppointmentInfo(phone) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await getSupabase()
    .from('dental_appointments')
    .select('id, patient_name, appointment_date, appointment_time, service, status')
    .eq('patient_phone', phone)
    .in('status', ['confirmed', 'pending'])
    .gte('appointment_date', today)
    .order('appointment_date', { ascending: true });

  return { appointments: data || [] };
}

async function cancelAppointment(appointmentId) {
  const { error } = await getSupabase()
    .from('dental_appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  return { success: !error };
}

async function executeTool(name, input, patientPhone) {
  switch (name) {
    case 'get_available_slots':     return getAvailableSlots(input.date);
    case 'check_slot_availability': return checkSlotAvailability(input.date, input.time);
    case 'book_appointment':        return bookAppointment(input, patientPhone);
    case 'get_appointment_info':    return getAppointmentInfo(input.patient_phone);
    case 'cancel_appointment':      return cancelAppointment(input.appointment_id);
    default:                        return { error: 'Herramienta desconocida.' };
  }
}

// --- Main agent runner ---

export async function runDentalAgent(conversationHistory, patientPhone) {
  const messages = conversationHistory.map(m => ({
    role: m.role,
    content: m.content
  }));

  const anthropic = getAnthropic();
  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages
  });

  // Agentic tool-use loop
  while (response.stop_reason === 'tool_use') {
    const assistantMsg = { role: 'assistant', content: response.content };
    messages.push(assistantMsg);

    const toolResults = [];
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const result = await executeTool(block.name, block.input, patientPhone);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });

    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages
    });
  }

  const textBlock = response.content.find(b => b.type === 'text');
  const agentText = textBlock?.text || 'Lo siento, ocurrió un error. Por favor intente de nuevo.';

  messages.push({ role: 'assistant', content: response.content });

  return { response: agentText, updatedHistory: messages };
}
