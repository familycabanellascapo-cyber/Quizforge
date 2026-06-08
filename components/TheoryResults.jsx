'use client'
import { useState } from 'react'

function TestQuestion({ q, idx }) {
  const [selected, setSelected] = useState(null)
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px', marginBottom: '16px',
    }}>
      <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '16px', lineHeight: 1.6 }}>
        <span style={{
          color: 'var(--text-3)', marginRight: '8px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
        }}>P{idx + 1}</span>
        {q.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, oi) => {
          const isSelected = selected === oi
          const isCorrect = oi === q.correct
          let bg = 'rgba(255,255,255,0.02)'
          let border = 'var(--border)'
          let color = 'var(--text-2)'
          if (selected !== null) {
            if (isCorrect)      { bg = 'rgba(16,185,129,0.1)';  border = 'rgba(16,185,129,0.4)';  color = 'var(--green)' }
            else if (isSelected){ bg = 'rgba(244,63,94,0.08)'; border = 'rgba(244,63,94,0.3)';  color = 'var(--red)' }
          }
          return (
            <button
              key={oi}
              onClick={() => selected === null && setSelected(oi)}
              style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: '10px', padding: '11px 16px',
                textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
                color, fontSize: '14px', transition: 'all 0.2s ease',
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-2)',
              }}>
                {String.fromCharCode(65 + oi)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div style={{
          marginTop: '12px', padding: '12px 16px',
          background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)',
          borderRadius: '10px', fontSize: '13px', color: 'var(--cyan)',
          animation: 'fadeUp 0.3s ease both', lineHeight: 1.6,
        }}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  )
}

function HypothesisQuestion({ q }) {
  const [answer, setAnswer] = useState('')
  return (
    <div style={{
      background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.22)',
      borderRadius: '16px', padding: '24px', marginBottom: '16px',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          background: 'rgba(232,168,56,0.12)', border: '1px solid rgba(232,168,56,0.25)',
          borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: 'var(--gold)',
        }}>
          🧠 Pregunta de hipótesis
        </span>
      </div>
      <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '14px', lineHeight: 1.6 }}>
        {q.question}
      </p>
      {q.hint && (
        <div style={{
          background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.18)',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
          fontSize: '13px', color: 'var(--gold)', lineHeight: 1.6,
        }}>
          💡 Pista: {q.hint}
        </div>
      )}
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Escribe tu análisis aquí..."
        style={{
          width: '100%', minHeight: '100px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '12px', color: 'var(--text)',
          fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical',
          outline: 'none', lineHeight: 1.6,
        }}
      />
    </div>
  )
}

export default function TheoryResults({ data }) {
  const [tab, setTab] = useState('summary')

  const tabs = [
    { id: 'summary',   label: '📋 Resumen' },
    { id: 'timeline',  label: '📅 Línea del tiempo' },
    { id: 'questions', label: '❓ Preguntas' },
  ]

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px 80px', animation: 'fadeUp 0.5s ease both' }}>
      {/* Subject banner */}
      <div style={{
        background: 'rgba(232,168,56,0.07)', border: '1px solid rgba(232,168,56,0.22)',
        borderRadius: '16px', padding: '20px 24px', marginBottom: '28px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <span style={{ fontSize: '38px' }}>{data.emoji}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: 'var(--text)' }}>
              {data.subject}
            </h2>
            <span style={{
              background: 'rgba(232,168,56,0.12)', border: '1px solid rgba(232,168,56,0.28)',
              borderRadius: '6px', padding: '2px 10px', fontSize: '12px', color: 'var(--gold)',
            }}>📚 Teórica</span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>Material generado automáticamente con IA</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'var(--surface)', borderRadius: '12px', padding: '4px',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--card)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text-2)',
              fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
              fontWeight: tab === t.id ? 500 : 400, transition: 'all 0.2s ease',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {tab === 'summary' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '28px',
          }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '15px', marginBottom: '20px', color: 'var(--text)',
            }}>Puntos clave</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.summary?.map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: '2px' }}>◆</span>
                  <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '15px' }}>{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          {data.timeline && data.timeline.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: '28px' }}>
              <div style={{
                position: 'absolute', left: '9px', top: '6px', bottom: '6px', width: '2px',
                background: 'linear-gradient(to bottom, var(--accent) 0%, transparent 100%)',
              }} />
              {data.timeline.map((item, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: '28px' }}>
                  <div style={{
                    position: 'absolute', left: '-22px', top: '4px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: 'var(--accent)', border: '2px solid var(--accent-bright)',
                    boxShadow: '0 0 8px rgba(123,94,167,0.55)',
                  }} />
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                    color: 'var(--gold)', marginBottom: '5px',
                  }}>{item.year}</div>
                  <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.7 }}>{item.event}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '48px', textAlign: 'center',
              color: 'var(--text-2)', fontSize: '15px',
            }}>
              No hay línea del tiempo disponible para este tema.
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      {tab === 'questions' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          {data.questions?.map((q, i) =>
            q.type === 'test'
              ? <TestQuestion key={q.id} q={q} idx={i} />
              : <HypothesisQuestion key={q.id} q={q} />
          )}
        </div>
      )}
    </div>
  )
}
