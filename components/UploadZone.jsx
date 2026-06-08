'use client'
import { useState, useRef } from 'react'

const theorySubjects = [
  { label: 'Historia', emoji: '📜' },
  { label: 'Derecho', emoji: '⚖️' },
  { label: 'Biología', emoji: '🧬' },
]

const practicalSubjects = [
  { label: 'Cálculo', emoji: '∫' },
  { label: 'Física', emoji: '⚛️' },
  { label: 'Química', emoji: '🧪' },
]

export default function UploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  function validateAndSubmit(file) {
    setError('')
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo supera el límite de 10MB.')
      return
    }
    setFileName(file.name)
    onUpload(file)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', top: '-250px', left: '-250px', width: '700px', height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,94,167,0.18) 0%, transparent 70%)',
        animation: 'drift 14s ease-in-out infinite', zIndex: 0, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-250px', right: '-250px', width: '800px', height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
        animation: 'drift 18s ease-in-out infinite reverse', zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Auto-detect badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: 'var(--green)',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--green)', display: 'inline-block',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            Detección automática de asignatura activa
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp 0.6s ease 0.1s both' }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(2rem, 5.5vw, 3.4rem)', lineHeight: 1.12,
            color: 'var(--text)', marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Tus apuntes,{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-bright) 0%, var(--cyan) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              convertidos en examen
            </span>
          </h1>
          <p style={{
            color: 'var(--text-2)', fontSize: '17px', fontWeight: 300,
            maxWidth: '460px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Sube cualquier PDF y la IA detecta la asignatura, genera preguntas tipo test, hipótesis, líneas del tiempo y problemas paso a paso.
          </p>
        </div>

        {/* Subject pills */}
        <div style={{ marginBottom: '40px', animation: 'fadeUp 0.6s ease 0.2s both' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {theorySubjects.map(s => (
              <span key={s.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.22)',
                borderRadius: '100px', padding: '6px 14px', fontSize: '13px',
                color: 'var(--gold)', fontFamily: 'DM Sans, sans-serif',
              }}>
                {s.emoji} {s.label}
              </span>
            ))}
            {practicalSubjects.map(s => (
              <span key={s.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)',
                borderRadius: '100px', padding: '6px 14px', fontSize: '13px',
                color: 'var(--cyan)', fontFamily: 'DM Sans, sans-serif',
              }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div style={{ animation: 'fadeUp 0.6s ease 0.3s both' }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragEnter={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault()
              setDragging(false)
              validateAndSubmit(e.dataTransfer.files[0])
            }}
            style={{
              background: dragging ? 'rgba(123,94,167,0.1)' : 'rgba(20,20,37,0.8)',
              border: `2px dashed ${dragging ? 'var(--accent-bright)' : 'var(--border-bright)'}`,
              borderRadius: '20px', padding: '52px 40px', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(14px)',
              outline: 'none',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={e => validateAndSubmit(e.target.files?.[0])}
            />

            {/* Icon */}
            <div style={{
              width: '72px', height: '72px', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(123,94,167,0.28), rgba(34,211,238,0.18))',
              border: '1px solid var(--border-bright)', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
            }}>📄</div>

            <p style={{ color: 'var(--text)', fontSize: '17px', fontWeight: 500, marginBottom: '8px' }}>
              {fileName ? `✓ ${fileName}` : 'Arrastra tu PDF aquí'}
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '24px' }}>
              o haz clic para seleccionar &mdash; PDF, máx. 10MB
            </p>

            {/* Auto-detect banner */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px', padding: '8px 16px', fontSize: '13px',
              color: 'var(--green)', marginBottom: '28px',
            }}>
              🤖 Detección automática activada
            </div>

            <br />

            <button
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
                border: 'none', borderRadius: '12px', padding: '14px 36px',
                color: '#fff', fontSize: '15px', fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(123,94,167,0.45)',
                transition: 'opacity 0.2s ease',
              }}
            >
              Subir PDF y generar quiz
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '16px', padding: '12px 18px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '10px', color: 'var(--red)', fontSize: '14px',
              animation: 'fadeUp 0.3s ease both',
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
