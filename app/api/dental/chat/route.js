import { NextResponse } from 'next/server';
import { runDentalAgent } from '@/lib/dentalAgent';

export async function POST(request) {
  try {
    const { message, history = [], phone = '+34000000000' } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje vacío.' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no configurada. Añádela a tu archivo .env.local.' },
        { status: 503 }
      );
    }

    const updatedHistory = [...history, { role: 'user', content: message }];
    const { response, updatedHistory: finalHistory } = await runDentalAgent(updatedHistory, phone);

    return NextResponse.json({ response, history: finalHistory });
  } catch (err) {
    console.error('[Chat API]', err);
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 });
  }
}
