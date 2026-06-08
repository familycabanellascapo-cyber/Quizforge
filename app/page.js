'use client'
import { useState } from 'react'
import UploadZone from '@/components/UploadZone'
import ProcessingScreen from '@/components/ProcessingScreen'
import TheoryResults from '@/components/TheoryResults'
import PracticalResults from '@/components/PracticalResults'

function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '64px'
    }}>
      <span style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px',
        background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>
        QuizForge
      </span>
      <span style={{
        background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(167,139,218,0.3)',
        borderRadius: '100px', padding: '4px 14px', fontSize: '12px',
        color: 'var(--accent-bright)', fontFamily: 'DM Sans, sans-serif'
      }}>
        ✦ Beta gratuita
      </span>
    </nav>
  )
}

export default function Home() {
  const [screen, setScreen] = useState('upload')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  async function handleUpload(file) {
    setScreen('processing')
    setError('')
    try {
      const form = new FormData()
      form.append('pdf', file)
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error desconocido')
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
      <Navbar />
      <main>
        {screen === 'upload' && (
          <>
            <UploadZone onUpload={handleUpload} />
            {error && (
              <div style={{
                position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.35)',
                borderRadius: '12px', padding: '14px 24px', color: 'var(--red)',
                fontSize: '14px', maxWidth: '480px', zIndex: 200, whiteSpace: 'nowrap',
                animation: 'fadeUp 0.3s ease forwards'
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
              ? <TheoryResults data={data} />
              : <PracticalResults data={data} />
            }
            <div style={{ textAlign: 'center', paddingBottom: '48px' }}>
              <button
                onClick={reset}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border-bright)',
                  borderRadius: '12px', padding: '12px 28px', color: 'var(--text-2)',
                  fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s ease',
                }}
              >
                ← Subir otro PDF
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
