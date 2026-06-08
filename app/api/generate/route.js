import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60

let openai = null
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai
}

const PRACTICAL_KEYWORDS = [
  'derivada', 'integral', 'límite', 'ecuación', 'función', 'cálculo',
  'teorema', 'álgebra', 'geometría', 'probabilidad', 'estadística',
  'fuerza', 'energía', 'velocidad', 'física', 'química', 'matemáticas',
  'vector', 'matriz', 'mol', 'reacción química', 'campo eléctrico',
]

function detectType(text) {
  const lower = text.toLowerCase()
  let count = 0
  for (const kw of PRACTICAL_KEYWORDS) {
    if (lower.includes(kw)) count++
  }
  return count >= 3 ? 'practical' : 'theory'
}

const THEORY_PROMPT = (text) => `
Eres un asistente educativo experto. Analiza el siguiente texto académico y genera material de estudio en español.

TEXTO:
${text}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "type": "theory",
  "subject": "nombre de la asignatura detectada",
  "emoji": "un emoji representativo",
  "summary": ["punto clave 1", "punto clave 2", "punto clave 3", "punto clave 4"],
  "timeline": [
    {"year": "año o período", "event": "descripción del evento"}
  ],
  "questions": [
    {
      "id": 1,
      "type": "test",
      "question": "¿Pregunta de opción múltiple?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación de por qué es correcta"
    },
    {
      "id": 2,
      "type": "test",
      "question": "¿Segunda pregunta?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 1,
      "explanation": "Explicación"
    },
    {
      "id": 3,
      "type": "test",
      "question": "¿Tercera pregunta?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 2,
      "explanation": "Explicación"
    },
    {
      "id": 4,
      "type": "test",
      "question": "¿Cuarta pregunta?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación"
    },
    {
      "id": 5,
      "type": "hypothesis",
      "question": "Pregunta de análisis profundo y reflexión crítica sobre el tema",
      "hint": "Pistas y aspectos a considerar para responder"
    }
  ]
}

Genera exactamente 4 preguntas tipo test y 1 hipótesis. Incluye línea del tiempo solo si el tema lo permite (historia, evolución de conceptos, etc.); si no aplica, devuelve array vacío [].
`

const PRACTICAL_PROMPT = (text) => `
Eres un asistente educativo experto en ciencias exactas. Analiza el siguiente texto académico y genera material de estudio práctico en español.

TEXTO:
${text}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "type": "practical",
  "subject": "nombre de la asignatura detectada",
  "emoji": "emoji representativo (∫ para cálculo, ⚛️ para física, 🧪 para química)",
  "formulas": [
    {"name": "Nombre de la fórmula", "formula": "Expresión matemática"},
    {"name": "Segunda fórmula", "formula": "Expresión"},
    {"name": "Tercera fórmula", "formula": "Expresión"}
  ],
  "problems": [
    {
      "id": 1,
      "difficulty": "Baja",
      "statement": "Enunciado detallado con números concretos",
      "steps": ["Paso 1: descripción", "Paso 2: descripción", "Paso 3: descripción", "Paso 4: descripción"],
      "answer": "Resultado final con unidades"
    },
    {
      "id": 2,
      "difficulty": "Media",
      "statement": "Enunciado de dificultad media con datos",
      "steps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
      "answer": "Respuesta final"
    },
    {
      "id": 3,
      "difficulty": "Alta",
      "statement": "Enunciado complejo e integrador",
      "steps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4", "Paso 5"],
      "answer": "Respuesta final"
    }
  ],
  "miniTest": [
    {
      "id": 1,
      "question": "¿Pregunta teórica sobre el tema?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación de la respuesta correcta"
    },
    {
      "id": 2,
      "question": "¿Segunda pregunta teórica?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 1,
      "explanation": "Explicación"
    }
  ]
}

Genera exactamente 3 fórmulas, 3 problemas con dificultades Baja/Media/Alta, y 2 preguntas de miniTest.
`

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf')

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Solo se aceptan archivos PDF.' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo supera el límite de 10MB.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let pdfData
    try {
      const pdfParse = (await import('pdf-parse')).default
      pdfData = await pdfParse(buffer)
    } catch {
      return NextResponse.json(
        { error: 'No se pudo procesar el PDF. Asegúrate de que no esté protegido.' },
        { status: 400 }
      )
    }

    const rawText = pdfData.text?.trim() ?? ''

    if (rawText.length < 100) {
      return NextResponse.json(
        { error: 'El PDF parece estar escaneado o tiene muy poco texto extraíble.' },
        { status: 400 }
      )
    }

    const text = rawText.slice(0, 6000)
    const type = detectType(text)
    const prompt = type === 'practical' ? PRACTICAL_PROMPT(text) : THEORY_PROMPT(text)

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const data = JSON.parse(completion.choices[0].message.content)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
