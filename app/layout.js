import './globals.css'

export const metadata = {
  title: 'QuizForge — Convierte tus apuntes en examen',
  description: 'Sube un PDF y genera preguntas tipo test, hipótesis y problemas paso a paso con IA.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
