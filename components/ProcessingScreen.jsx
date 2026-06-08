'use client'
import { useEffect, useState } from 'react'

const STEPS = [
  'Extrayendo texto del PDF...',
  'Detectando tipo de asignatura...',
  'Analizando contenido con IA...',
  'Generando preguntas y problemas...',
]

export default function ProcessingScreen() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px', paddingTop: '80px',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '24px', padding: '52px 48px', maxWidth: '460px', width: '100%',
        textAlign: 'center', backdropFilter: 'blur(14px)',
        animation: 'fadeUp 0.5s ease both',
      }}>
        {/* Spinner */}
        <div style={{
          width: '64px', height: '64px', margin: '0 auto 32px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent-bright)',
          borderRadius: '50%',
          animation: 'spin 0.85s linear infinite',
        }} />

        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '22px', color: 'var(--text)', marginBottom: '8px',
        }}>
          Procesando tu PDF
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '36px' }}>
          La IA está analizando tu material de estudio
        </p>

        {/* Steps */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {STEPS.map((step, i) => {
            const isDone = i < currentStep
            const isActive = i === currentStep
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: isDone
                    ? 'var(--green)'
                    : isActive
                      ? 'var(--accent-bright)'
                      : 'var(--border-bright)',
                  animation: isActive ? 'pulse 1.2s ease-in-out infinite' : 'none',
                  boxShadow: isActive ? '0 0 10px rgba(167,139,218,0.7)' : 'none',
                  transition: 'all 0.4s ease',
                }} />
                <span style={{
                  fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                  color: isDone ? 'var(--green)' : isActive ? 'var(--text)' : 'var(--text-3)',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'color 0.4s ease',
                }}>
                  {isDone ? `✓ ${step}` : step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
