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
const DIFFICULTIES = ['Baja', 'Media', 'Alta']

const QUESTION_OPTIONS = [10, 15, 20, 25, 30]

export default function UploadZone({ onUpload, uploadsUsed = 0, freeLimit = 3, difficulty, onDifficultyChange, questionCount = 10, onQuestionCountChange, onUpgradeClick, unlimited = false }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  const remaining = freeLimit - uploadsUsed
  const atLimit = !unlimited && remaining <= 0

  function validateAndSubmit(file) {
    setError('')
    if (!file) return
    if (atLimit) { onUpgradeClick(); return }
    if (file.type !== 'application/pdf') { setError('Solo se aceptan archivos PDF.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('El archivo supera el límite de 10MB.'); return }
    setFileName(file.name)
    onUpload(file)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', top: '-250px', left: '-250px', width: '700px', height: '700px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,94,167,0.18) 0%, transparent 70%)',
        animation: 'drift 14s ease-in-out infinite', zIndex: 0, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-250px', right: '-250px', width: '800px', height: '800px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
        animation: 'drift 18s ease-in-out infinite reverse', zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Detection badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: 'var(--green)',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
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
          <p style={{ color: 'var(--text-2)', fontSize: '17px', fontWeight: 300, maxWidth: '460px', margin: '0 auto', lineHeight: 1.7 }}>
            Sube cualquier PDF y la IA detecta la asignatura, genera preguntas tipo test, hipótesis, líneas del tiempo y problemas paso a paso.
          </p>
        </div>

        {/* Subject pills */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.6s ease 0.2s both' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {theorySubjects.map(s => (
              <span key={s.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.22)',
                borderRadius: '100px', padding: '6px 14px', fontSize: '13px', color: 'var(--gold)',
              }}>{s.emoji} {s.label}</span>
            ))}
            {practicalSubjects.map(s => (
              <span key={s.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)',
                borderRadius: '100px', padding: '6px 14px', fontSize: '13px', color: 'var(--cyan)',
              }}>{s.emoji} {s.label}</span>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div style={{ marginBottom: '28px', animation: 'fadeUp 0.6s ease 0.25s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>Dificultad de preguntas</span>
            {!unlimited && (
              <span style={{
                background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.25)',
                borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--gold)',
              }}>🔒 Premium</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => unlimited ? onDifficultyChange?.(d) : onUpgradeClick()}
                style={{
                  padding: '8px 20px', borderRadius: '8px',
                  background: unlimited && difficulty === d ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${unlimited && difficulty === d ? 'var(--accent-bright)' : 'var(--border)'}`,
                  color: unlimited && difficulty === d ? 'white' : unlimited ? 'var(--text-2)' : 'var(--text-3)',
                  fontSize: '13px', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', opacity: unlimited ? 1 : 0.55,
                  transition: 'all 0.2s ease',
                }}
              >{unlimited ? d : `🔒 ${d}`}</button>
            ))}
          </div>
        </div>

        {/* Upload limit warning */}
        {atLimit && (
          <div style={{
            marginBottom: '20px', padding: '14px 18px',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.28)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', animation: 'fadeUp 0.3s ease both',
          }}>
            <span style={{ color: 'var(--red)', fontSize: '14px' }}>
              ⚠️ Has usado tus {freeLimit} PDFs gratuitos
            </span>
            <button
              onClick={onUpgradeClick}
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
                border: 'none', borderRadius: '8px', padding: '7px 16px',
                color: 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >Actualizar →</button>
          </div>
        )}

        {/* Question count selector */}
        <div style={{ marginBottom: '28px', animation: 'fadeUp 0.6s ease 0.3s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>Número de preguntas</span>
            {!unlimited && (
              <span style={{
                background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.25)',
                borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--gold)',
              }}>🔒 Premium</span>
            )}
          </div>
          {unlimited ? (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {QUESTION_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => onQuestionCountChange?.(n)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px',
                    background: questionCount === n ? 'var(--accent)' : 'var(--surface)',
                    border: `1px solid ${questionCount === n ? 'var(--accent-bright)' : 'var(--border)'}`,
                    color: questionCount === n ? 'white' : 'var(--text-2)',
                    fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease',
                  }}
                >{n}</button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '8px 20px',
                color: 'var(--text-3)', fontSize: '13px', opacity: 0.7,
              }}>10 preguntas — Plan Gratuito</div>
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div style={{ animation: 'fadeUp 0.6s ease 0.3s both' }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => atLimit ? onUpgradeClick() : inputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && (atLimit ? onUpgradeClick() : inputRef.current?.click())}
            onDragOver={e => { e.preventDefault(); if (!atLimit) setDragging(true) }}
            onDragEnter={e => { e.preventDefault(); if (!atLimit) setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false)
              validateAndSubmit(e.dataTransfer.files[0])
            }}
            style={{
              background: atLimit
                ? 'rgba(244,63,94,0.04)'
                : dragging ? 'rgba(123,94,167,0.1)' : 'rgba(20,20,37,0.8)',
              border: `2px dashed ${atLimit ? 'rgba(244,63,94,0.3)' : dragging ? 'var(--accent-bright)' : 'var(--border-bright)'}`,
              borderRadius: '20px', padding: '52px 40px', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(14px)', outline: 'none',
              opacity: atLimit ? 0.7 : 1,
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={e => validateAndSubmit(e.target.files?.[0])}
            />

            <div style={{
              width: '72px', height: '72px', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(123,94,167,0.28), rgba(34,211,238,0.18))',
              border: '1px solid var(--border-bright)', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
            }}>{atLimit ? '🔒' : '📄'}</div>

            <p style={{ color: 'var(--text)', fontSize: '17px', fontWeight: 500, marginBottom: '8px' }}>
              {atLimit ? 'Límite gratuito alcanzado' : fileName ? `✓ ${fileName}` : 'Arrastra tu PDF aquí'}
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '24px' }}>
              {atLimit
                ? 'Actualiza tu plan para seguir subiendo PDFs'
                : unlimited
                  ? 'o haz clic para seleccionar — PDF, máx. 10MB · ∞ ilimitados'
                  : `o haz clic para seleccionar — PDF, máx. 10MB · ${remaining} restante${remaining !== 1 ? 's' : ''}`
              }
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px', padding: '8px 16px', fontSize: '13px',
              color: 'var(--green)', marginBottom: '28px',
            }}>
              🤖 Detección automática activada
            </div>

            <br />

            {atLimit ? (
              <button
                onClick={e => { e.stopPropagation(); onUpgradeClick() }}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                  border: 'none', borderRadius: '12px', padding: '14px 36px',
                  color: '#fff', fontSize: '15px', fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(34,211,238,0.35)',
                }}
              >Ver planes Premium →</button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
                  border: 'none', borderRadius: '12px', padding: '14px 36px',
                  color: '#fff', fontSize: '15px', fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(123,94,167,0.45)',
                }}
              >Subir PDF y generar quiz</button>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: '16px', padding: '12px 18px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '10px', color: 'var(--red)', fontSize: '14px',
              animation: 'fadeUp 0.3s ease both',
            }}>⚠️ {error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
