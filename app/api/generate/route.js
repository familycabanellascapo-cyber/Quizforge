import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60

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

const DIFFICULTY_INSTRUCTIONS = {
  low:    'Las preguntas deben ser directas, basadas en conceptos fundamentales del texto. Nivel básico.',
  medium: 'Las preguntas deben requerir comprensión y aplicación básica. Nivel intermedio.',
  high:   'Las preguntas deben requerir análisis crítico, síntesis y aplicación compleja. Nivel avanzado.',
}

const THEORY_PROMPT = (text, difficulty, questionCount) => {
  const testCount = questionCount - 1
  const flashcardCount = Math.min(10, Math.max(3, Math.ceil(questionCount / 3)))
  return `
Eres un tutor educativo experto en pedagogía activa. Tu método: NUNCA expliques la teoría directamente. En cambio, plantea situaciones, problemas o retos que obliguen al estudiante a pensar y aplicar el conocimiento.

TEXTO A ANALIZAR:
${text}

NIVEL DE DIFICULTAD: ${DIFFICULTY_INSTRUCTIONS[difficulty] ?? DIFFICULTY_INSTRUCTIONS.medium}

Responde ÚNICAMENTE con un JSON válido con esta estructura (los arrays deben tener exactamente el número indicado en IMPORTANTE):
{
  "type": "theory",
  "subject": "nombre de la asignatura detectada",
  "emoji": "un emoji representativo",
  "summary": [
    "Reto o pregunta reflexiva que lleva al estudiante a descubrir el concepto 1",
    "Reto o pregunta reflexiva que lleva al estudiante a descubrir el concepto 2",
    "Reto o pregunta reflexiva que lleva al estudiante a descubrir el concepto 3",
    "Reto o pregunta reflexiva que lleva al estudiante a descubrir el concepto 4"
  ],
  "timeline": [
    {"year": "año o período", "event": "descripción del evento"}
  ],
  "flashcards": [
    {"front": "¿Pregunta o concepto clave?", "back": "Respuesta concisa y clara (1-2 frases)"}
  ],
  "questions": [
    {
      "id": 1,
      "type": "test",
      "question": "Plantea una SITUACIÓN o CASO PRÁCTICO del tema. No preguntes definiciones directas.",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación de POR QUÉ es correcta, revelando el concepto teórico subyacente"
    },
    {
      "id": ${testCount},
      "type": "test",
      "question": "Última pregunta tipo test del set",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 1,
      "explanation": "Explicación"
    },
    {
      "id": ${questionCount},
      "type": "hypothesis",
      "question": "Plantea un dilema o pregunta abierta que obligue al estudiante a aplicar y argumentar",
      "hint": "Aspectos clave a considerar para construir una respuesta sólida"
    }
  ]
}

IMPORTANTE: El campo "summary" debe contener RETOS o PREGUNTAS REFLEXIVAS, no explicaciones directas. La explicación de cada pregunta tipo test solo se mostrará si el estudiante falla. Genera exactamente ${flashcardCount} flashcards, ${testCount} preguntas de tipo "test" y 1 pregunta de tipo "hypothesis" (total ${questionCount} en el array questions).
`
}

const PRACTICAL_PROMPT = (text, difficulty, questionCount) => {
  const flashcardCount = Math.min(10, Math.max(3, Math.ceil(questionCount / 3)))
  return `
Eres un tutor de ciencias exactas experto en aprendizaje activo. Tu método: NUNCA des la fórmula o explicación directamente. Plantea primero el problema, el estudiante intenta resolverlo, y solo entonces se revela la solución.

TEXTO A ANALIZAR:
${text}

NIVEL DE DIFICULTAD: ${DIFFICULTY_INSTRUCTIONS[difficulty] ?? DIFFICULTY_INSTRUCTIONS.medium}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "type": "practical",
  "subject": "nombre de la asignatura detectada",
  "emoji": "emoji representativo (∫ cálculo, ⚛️ física, 🧪 química)",
  "formulas": [
    {"name": "Nombre de la fórmula", "formula": "Expresión matemática"},
    {"name": "Segunda fórmula", "formula": "Expresión"},
    {"name": "Tercera fórmula", "formula": "Expresión"}
  ],
  "flashcards": [
    {"front": "¿Cuándo se usa [fórmula o concepto]?", "back": "Se usa cuando... Condición o contexto de aplicación."}
  ],
  "problems": [
    {
      "id": 1,
      "difficulty": "Baja",
      "statement": "Enunciado con datos numéricos concretos. NO incluyas la solución.",
      "steps": ["Paso 1: identifica las variables dadas", "Paso 2: elige la fórmula correcta", "Paso 3: sustituye los valores", "Paso 4: calcula el resultado"],
      "answer": "Resultado final con unidades"
    },
    {
      "id": 2, "difficulty": "Media",
      "statement": "Enunciado de dificultad media con más variables",
      "steps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"], "answer": "Respuesta final"
    },
    {
      "id": 3, "difficulty": "Alta",
      "statement": "Enunciado complejo que combina varios conceptos",
      "steps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4", "Paso 5"], "answer": "Respuesta final"
    }
  ],
  "miniTest": [
    {
      "id": 1,
      "question": "Situación numérica o conceptual concreta para aplicar el conocimiento",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación del razonamiento correcto (solo se muestra si el estudiante falla)"
    }
  ]
}

IMPORTANTE: Los problemas deben presentarse como retos — la solución solo se muestra cuando el estudiante lo solicita. Genera exactamente 3 fórmulas, ${flashcardCount} flashcards, 3 problemas y ${questionCount} preguntas en miniTest.
`
}

let openai = null
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf')
    const difficulty = formData.get('difficulty') || 'medium'
    const questionCount = Math.min(30, Math.max(10, parseInt(formData.get('questionCount') || '10')))

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
    const prompt = type === 'practical'
      ? PRACTICAL_PROMPT(text, difficulty, questionCount)
      : THEORY_PROMPT(text, difficulty, questionCount)

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
