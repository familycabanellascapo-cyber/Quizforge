'use client'
import { useState, useEffect, useRef } from 'react'
import UploadZone from '@/components/UploadZone'
import ProcessingScreen from '@/components/ProcessingScreen'
import TheoryResults from '@/components/TheoryResults'
import PracticalResults from '@/components/PracticalResults'
import PaymentModal from '@/components/PaymentModal'
import AuthModal from '@/components/AuthModal'
import PlanModal from '@/components/PlanModal'
import { supabase, getUserProfile, isUnlimited } from '@/lib/supabase'

const FREE_LIMIT = 3

// ── Weekly localStorage helpers ──────────────────────────────────────────────
function getWeekKey() {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-${week}`
}
function getLocalUploads() {
  try {
    const s = JSON.parse(localStorage.getItem('qf_usage') || '{}')
    return s.week === getWeekKey() ? (s.count || 0) : 0
  } catch { return 0 }
}
function setLocalUploads(n) {
  try { localStorage.setItem('qf_usage', JSON.stringify({ week: getWeekKey(), count: n })) } catch {}
}

// ── User avatar dropdown ─────────────────────────────────────────────────────
function UserAvatar({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const initial = (user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)} title={user.email}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
          border: '2px solid rgba(167,139,218,0.5)', cursor: 'pointer',
          color: 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(123,94,167,0.4)',
        }}
      >{initial}</button>
      {open && (
        <div style={{
          position: 'absolute', top: '46px', right: 0, minWidth: '210px',
          background: 'var(--card)', border: '1px solid var(--border-bright)',
          borderRadius: '14px', padding: '8px', zIndex: 200,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)', animation: 'fadeUp 0.15s ease both',
        }}>
          <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '3px' }}>Conectado como</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
          <button
            onClick={() => { onSignOut(); setOpen(false) }}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--red)', fontSize: '13px', textAlign: 'left',
              fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          ><span>→</span> Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ uploadsUsed, onUpgradeClick, user, onLoginClick, onSignOut, unlimited }) {
  const remaining = FREE_LIMIT - uploadsUsed
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,7,14,0.87)', backdropFilter: 'blur(18px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '64px', gap: '12px',
    }}>
      <span style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px',
        background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        flexShrink: 0,
      }}>QuizForge</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {unlimited ? (
          <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            ∞ PDFs ilimitados
          </span>
        ) : (
          <span style={{ fontSize: '12px', color: remaining > 0 ? 'var(--text-2)' : 'var(--red)', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            {uploadsUsed}/{FREE_LIMIT} PDFs esta semana
          </span>
        )}
        {unlimited ? (
          <span style={{
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '100px', padding: '4px 13px', fontSize: '12px',
            color: 'var(--green)', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
          }}>👑 Admin</span>
        ) : (
          <button
            onClick={onUpgradeClick}
            style={{
              background: 'rgba(123,94,167,0.15)', border: '1px solid rgba(167,139,218,0.28)',
              borderRadius: '100px', padding: '4px 13px', fontSize: '12px',
              color: 'var(--accent-bright)', fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >✦ Premium</button>
        )}
        {user ? (
          <UserAvatar user={user} onSignOut={onSignOut} />
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
              border: 'none', borderRadius: '10px', padding: '8px 18px',
              color: 'white', fontSize: '13px', fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              boxShadow: '0 2px 14px rgba(123,94,167,0.4)', whiteSpace: 'nowrap',
            }}
          >Iniciar sesión</button>
        )}
      </div>
    </nav>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState('upload')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [uploadsUsed, setUploadsUsed] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [paymentReason, setPaymentReason] = useState('upload')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // Stores pending payment reason when user isn't logged in yet
  const pendingPaymentRef = useRef(null)

  // ── Auth helpers ─────────────────────────────────────────────────────────
  async function loadUser(u, event) {
    setUser(u)
    if (u) {
      const p = await getUserProfile(u.id)
      setProfile(p)
      fetchUploadCount(u.id)

      // Show plan modal on every login
      if (event === 'SIGNED_IN') {
        setShowPlanModal(true)
      }

      // Resolve pending payment that was triggered before login
      if (pendingPaymentRef.current) {
        setPaymentReason(pendingPaymentRef.current)
        setShowPaymentModal(true)
        pendingPaymentRef.current = null
      }
    } else {
      setProfile(null)
      setUploadsUsed(getLocalUploads())
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null, null).then(() => setAuthReady(true))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      loadUser(session?.user ?? null, event)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUploadCount(userId) {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', weekAgo)
      setUploadsUsed(count ?? 0)
    } catch {
      setUploadsUsed(getLocalUploads())
    }
  }

  // ── Payment / upgrade ────────────────────────────────────────────────────
  function triggerPayment(reason = 'upload') {
    if (!user) {
      // Not logged in: ask to register/login first, then show payment
      pendingPaymentRef.current = reason
      setShowAuthModal(true)
    } else {
      setPaymentReason(reason)
      setShowPaymentModal(true)
    }
  }

  // ── Upload handler ───────────────────────────────────────────────────────
  async function handleUpload(file) {
    const unlimited = isUnlimited(profile, user?.email)
    let current = 0
    if (user) {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('uploads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekAgo)
        current = count ?? 0
      } catch {
        current = uploadsUsed
      }
    } else {
      current = getLocalUploads()
    }

    if (!unlimited && current >= FREE_LIMIT) {
      triggerPayment('upload')
      return
    }

    setScreen('processing')
    setError('')
    try {
      const form = new FormData()
      form.append('pdf', file)
      form.append('difficulty', difficulty)
      form.append('questionCount', unlimited ? String(questionCount) : '10')
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error desconocido')

      if (user) {
        try {
          await supabase.from('uploads').insert({
            user_id: user.id,
            subject: json.subject,
            type: json.type,
            emoji: json.emoji ?? null,
            quiz_data: json,
          })
        } catch {}
        await fetchUploadCount(user.id)
      } else {
        const next = current + 1
        setLocalUploads(next)
        setUploadsUsed(next)
      }

      setData(json)
      setScreen('results')
    } catch (err) {
      setError(err.message)
      setScreen('upload')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setUploadsUsed(getLocalUploads())
  }

  function reset() { setScreen('upload'); setData(null); setError('') }

  const unlimited = isUnlimited(profile, user?.email)

  return (
    <>
      <Navbar
        uploadsUsed={uploadsUsed}
        onUpgradeClick={() => triggerPayment('upload')}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        unlimited={unlimited}
      />
      <main>
        {screen === 'upload' && (
          <>
            <UploadZone
              onUpload={handleUpload}
              uploadsUsed={uploadsUsed}
              freeLimit={FREE_LIMIT}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              questionCount={questionCount}
              onQuestionCountChange={setQuestionCount}
              onUpgradeClick={() => triggerPayment('upload')}
              unlimited={unlimited}
            />
            {error && (
              <div style={{
                position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.35)',
                borderRadius: '12px', padding: '14px 24px', color: 'var(--red)',
                fontSize: '14px', maxWidth: '480px', zIndex: 200, whiteSpace: 'nowrap',
                animation: 'fadeUp 0.3s ease both',
              }}>⚠️ {error}</div>
            )}
          </>
        )}

        {screen === 'processing' && <ProcessingScreen />}

        {screen === 'results' && data && (
          <div style={{ paddingTop: '80px' }}>
            {data.type === 'theory'
              ? <TheoryResults data={data} onPaywall={() => triggerPayment('flashcard')} unlimited={unlimited} />
              : <PracticalResults data={data} onPaywall={() => triggerPayment('flashcard')} unlimited={unlimited} />
            }
            <div style={{ textAlign: 'center', paddingBottom: '48px' }}>
              <button
                onClick={reset}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border-bright)',
                  borderRadius: '12px', padding: '12px 28px', color: 'var(--text-2)',
                  fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >← Subir otro PDF</button>
            </div>
          </div>
        )}
      </main>

      {/* Plan selection for new users */}
      {showPlanModal && (
        <PlanModal onSelectFree={() => setShowPlanModal(false)} />
      )}

      {showPaymentModal && (
        <PaymentModal reason={paymentReason} onClose={() => setShowPaymentModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false)
            pendingPaymentRef.current = null
          }}
          onAuthSuccess={() => setShowAuthModal(false)}
          pendingPayment={pendingPaymentRef.current}
        />
      )}
    </>
  )
}
