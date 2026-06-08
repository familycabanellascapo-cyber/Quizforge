import './globals.css'

export const metadata = {
  title: 'QuizForge — Convierte tus apuntes en examen',
  description: 'Sube un PDF y genera preguntas tipo test, hipótesis de análisis, líneas del tiempo y problemas paso a paso con IA.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
