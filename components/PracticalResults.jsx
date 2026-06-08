'use client'
import { useState } from 'react'

const DIFFICULTY_STYLE = {
  Baja:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  color: 'var(--green)' },
  Media: { bg: 'rgba(123,94,167,0.1)',  border: 'rgba(167,139,218,0.3)', color: 'var(--accent-bright)' },
  Alta:  { bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.28)',  color: 'var(--red)' },
}

function DifficultyBadge({ level }) {
  const s = DIFFICULTY_STYLE[level] ?? DIFFICULTY_STYLE.Media
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: s.color,
    }}>{level}</span>
  )
}

function ProblemCard({ p }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <DifficultyBadge level={p.difficulty} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-3)' }}>
          Problema #{p.id}
        </span>
      </div>
      <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '16px', lineHeight: 1.6 }}>{p.statement}</p>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: '10px', padding: '10px 18px', cursor: 'pointer',
          color: 'var(--cyan)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease',
        }}
      >
        {open ? '▲' : '▼'} Ver solución paso a paso
      </button>
      {open && (
        <div style={{ marginTop: '18px', animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {p.steps?.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                  background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--cyan)',
                }}>{i + 1}</span>
                <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.7 }}>{step}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '10px', padding: '12px 16px', color: 'var(--green)', fontSize: '14px',
          }}>
            ✓ Respuesta: <strong>{p.answer}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniTestQuestion({ q, idx }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const isCorrect = answered && selected === q.correct

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px', marginBottom: '16px',
    }}>
      <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '16px', lineHeight: 1.6 }}>
        <span style={{ color: 'var(--text-3)', marginRight: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
          P{idx + 1}
        </span>
        {q.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, oi) => {
          const isOptCorrect = oi === q.correct
          const isSelected = selected === oi
          let bg = 'rgba(255,255,255,0.02)'
          let border = 'var(--border)'
          let color = 'var(--text-2)'
          if (answered) {
            if (isOptCorrect)    { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.4)'; color = 'var(--green)' }
            else if (isSelected) { bg = 'rgba(244,63,94,0.08)'; border = 'rgba(244,63,94,0.3)'; color = 'var(--red)' }
          }
          return (
            <button
              key={oi}
              onClick={() => !answered && setSelected(oi)}
              style={{
                background: bg, border: `1px solid ${border}`, borderRadius: '10px',
                padding: '11px 16px', textAlign: 'left',
                cursor: answered ? 'default' : 'pointer',
                color, fontSize: '14px', transition: 'all 0.2s ease',
                fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-2)',
              }}>{String.fromCharCode(65 + oi)}</span>
              {opt}
            </button>
          )
        })}
      </div>
      {answered && isCorrect && (
        <div style={{
          marginTop: '12px', padding: '12px 16px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '10px', fontSize: '13px', color: 'var(--green)',
          animation: 'fadeUp 0.3s ease both',
        }}>✓ ¡Correcto! Buen trabajo.</div>
      )}
      {answered && !isCorrect && (
        <div style={{
          marginTop: '12px', padding: '12px 16px',
          background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)',
          borderRadius: '10px', fontSize: '13px', color: 'var(--cyan)',
          animation: 'fadeUp 0.3s ease both', lineHeight: 1.6,
        }}>💡 {q.explanation}</div>
      )}
    </div>
  )
}

function FlashCard({ card, index, onPaywall, unlimited }) {
  const [revealed, setRevealed] = useState(false)

  if (unlimited) {
    return (
      <div style={{
        background: 'var(--card)', border: `1px solid ${revealed ? 'rgba(16,185,129,0.35)' : 'var(--border)'}`,
        borderRadius: '14px', padding: '20px 22px', marginBottom: '12px',
        transition: 'border-color 0.2s ease', display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-3)' }}>
            Flashcard #{index + 1}
          </span>
          <span style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: 'var(--green)',
          }}>👑 Admin</span>
        </div>
        <p style={{ color: 'var(--text)', fontSize: '14px', fontWeight: 500, lineHeight: 1.6 }}>{card.front}</p>
        {revealed ? (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: 'var(--green)',
            lineHeight: 1.6, animation: 'fadeUp 0.2s ease both',
          }}>
            ✓ {card.back}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            style={{
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px', padding: '10px 14px', cursor: 'pointer',
              color: 'var(--green)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >▶ Ver respuesta</button>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onPaywall}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '20px 22px', marginBottom: '12px',
        cursor: 'pointer', transition: 'border-color 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-3)' }}>
          Flashcard #{index + 1}
        </span>
        <span style={{
          background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
          borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: 'var(--cyan)',
        }}>🔒 Premium</span>
      </div>
      <p style={{ color: 'var(--text)', fontSize: '14px', fontWeight: 500, lineHeight: 1.6 }}>{card.front}</p>
      <div style={{
        background: 'rgba(34,211,238,0.05)', border: '1px dashed rgba(34,211,238,0.2)',
        borderRadius: '8px', padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>🔒</span>
        <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>Haz clic para ver la respuesta — actualiza a Premium</span>
      </div>
    </div>
  )
}

export default function PracticalResults({ data, onPaywall, unlimited = false }) {
  const [tab, setTab] = useState('formulas')

  const tabs = [
    { id: 'formulas',   label: '📐 Fórmulas' },
    { id: 'problems',   label: '🔢 Problemas' },
    { id: 'minitest',   label: '❓ Test teórico' },
    { id: 'flashcards', label: '🃏 Flashcards' },
  ]

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px 80px', animation: 'fadeUp 0.5s ease both' }}>
      <div style={{
        background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)',
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
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.28)',
              borderRadius: '6px', padding: '2px 10px', fontSize: '12px', color: 'var(--cyan)',
            }}>🔢 Práctica</span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>Problemas y fórmulas generados con IA · Aprende resolviendo</p>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'var(--surface)', borderRadius: '12px', padding: '4px', overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, minWidth: '88px', padding: '10px 6px', borderRadius: '9px', border: 'none',
              cursor: 'pointer',
              background: tab === t.id ? 'var(--card)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text-2)',
              fontSize: '12px', fontFamily: 'DM Sans, sans-serif',
              fontWeight: tab === t.id ? 500 : 400, transition: 'all 0.2s ease',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none', whiteSpace: 'nowrap',
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'formulas' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            {data.formulas?.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px', flexWrap: 'wrap', gap: '12px',
                borderBottom: i < (data.formulas.length - 1) ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ color: 'var(--text-2)', fontSize: '14px' }}>{f.name}</span>
                <code style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--cyan)',
                  background: 'rgba(34,211,238,0.09)', border: '1px solid rgba(34,211,238,0.2)',
                  borderRadius: '8px', padding: '6px 14px',
                }}>{f.formula}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'problems' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{
            background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.18)',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
            fontSize: '13px', color: 'var(--text-2)',
          }}>
            💡 Intenta resolver cada problema antes de ver la solución. Primero tú, luego los pasos.
          </div>
          {data.problems?.map(p => <ProblemCard key={p.id} p={p} />)}
        </div>
      )}

      {tab === 'minitest' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{
            background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.18)',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
            fontSize: '13px', color: 'var(--text-2)',
          }}>
            💡 La explicación solo aparece si fallas. ¡Confía en ti!
          </div>
          {data.miniTest?.map((q, i) => <MiniTestQuestion key={q.id} q={q} idx={i} />)}
        </div>
      )}

      {tab === 'flashcards' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{
            background: unlimited ? 'rgba(16,185,129,0.06)' : 'rgba(34,211,238,0.05)',
            border: `1px solid ${unlimited ? 'rgba(16,185,129,0.2)' : 'rgba(34,211,238,0.18)'}`,
            borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>
              🃏 {data.flashcards?.length ?? 0} flashcards generadas{unlimited ? ' — haz clic en cada una para ver la respuesta' : ' — actualiza para estudiar con ellas'}
            </span>
            {!unlimited && (
              <button
                onClick={onPaywall}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                  border: 'none', borderRadius: '8px', padding: '6px 14px',
                  color: 'white', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >Desbloquear →</button>
            )}
          </div>
          {data.flashcards?.map((card, i) => (
            <FlashCard key={i} card={card} index={i} onPaywall={onPaywall} unlimited={unlimited} />
          ))}
        </div>
      )}
    </div>
  )
}
