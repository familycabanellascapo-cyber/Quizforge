'use client'
import { useState, useEffect } from 'react'
import UploadZone from '@/components/UploadZone'
import ProcessingScreen from '@/components/ProcessingScreen'
import TheoryResults from '@/components/TheoryResults'
import PracticalResults from '@/components/PracticalResults'
import PaymentModal from '@/components/PaymentModal'

const FREE_LIMIT = 3

function Navbar({ uploadsUsed, onUpgradeClick }) {
  const remaining = FREE_LIMIT - uploadsUsed
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '64px',
    }}>
      <span style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px',
        background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        QuizForge
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: '12px',
          color: remaining > 0 ? 'var(--text-2)' : 'var(--red)',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {uploadsUsed}/{FREE_LIMIT} PDFs usados
        </span>
        <button
          onClick={onUpgradeClick}
          style={{
            background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(167,139,218,0.3)',
            borderRadius: '100px', padding: '4px 14px', fontSize: '12px',
            color: 'var(--accent-bright)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
          }}
        >
          ✦ Actualizar plan
        </button>
      </div>
    </nav>
  )
}

export default function Home() {
  const [screen, setScreen] = useState('upload')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [uploadsUsed, setUploadsUsed] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentReason, setPaymentReason] = useState('upload')
  const [difficulty, setDifficulty] = useState('medium')

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('qf_uploads') || '0')
    setUploadsUsed(saved)
  }, [])

  function triggerPayment(reason = 'upload') {
    setPaymentReason(reason)
    setShowPaymentModal(true)
  }

  async function handleUpload(file) {
    const current = parseInt(localStorage.getItem('qf_uploads') || '0')
    if (current >= FREE_LIMIT) {
      triggerPayment('upload')
      return
    }
    setScreen('processing')
    setError('')
    try {
      const form = new FormData()
      form.append('pdf', file)
      form.append('difficulty', difficulty)
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error desconocido')
      const next = current + 1
      localStorage.setItem('qf_uploads', next)
      setUploadsUsed(next)
      setData(json)
      setScreen('results')
    } catch (err) {
      setError(err.message)
      setScreen('upload')
    }
  }

  function reset() {
    setScreen('upload')
    setData(null)
    setError('')
  }

  return (
    <>
      <Navbar uploadsUsed={uploadsUsed} onUpgradeClick={() => triggerPayment('upload')} />
      <main>
        {screen === 'upload' && (
          <>
            <UploadZone
              onUpload={handleUpload}
              uploadsUsed={uploadsUsed}
              freeLimit={FREE_LIMIT}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              onUpgradeClick={() => triggerPayment('upload')}
            />
            {error && (
              <div style={{
                position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.35)',
                borderRadius: '12px', padding: '14px 24px', color: 'var(--red)',
                fontSize: '14px', maxWidth: '480px', zIndex: 200, whiteSpace: 'nowrap',
                animation: 'fadeUp 0.3s ease both',
              }}>
                ⚠️ {error}
              </div>
            )}
          </>
        )}

        {screen === 'processing' && <ProcessingScreen />}

        {screen === 'results' && data && (
          <div style={{ paddingTop: '80px' }}>
            {data.type === 'theory'
              ? <TheoryResults data={data} onPaywall={() => triggerPayment('flashcard')} />
              : <PracticalResults data={data} onPaywall={() => triggerPayment('flashcard')} />
            }
            <div style={{ textAlign: 'center', paddingBottom: '48px' }}>
              <button
                onClick={reset}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border-bright)',
                  borderRadius: '12px', padding: '12px 28px', color: 'var(--text-2)',
                  fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                ← Subir otro PDF
              </button>
            </div>
          </div>
        )}
      </main>

      {showPaymentModal && (
        <PaymentModal
          reason={paymentReason}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  )
}
