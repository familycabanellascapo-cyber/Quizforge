'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const PWD_RULES = [
  { key: 'upper',   label: 'Una mayúscula (A-Z)',          test: (p) => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'Una minúscula (a-z)',           test: (p) => /[a-z]/.test(p) },
  { key: 'number',  label: 'Un número (0-9)',               test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'Un carácter especial (!@#...)', test: (p) => /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(p) },
  { key: 'length',  label: 'Mínimo 8 caracteres',           test: (p) => p.length >= 8 },
]

function isPasswordValid(pwd) {
  return PWD_RULES.every(r => r.test(pwd))
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)', borderRadius: '10px',
  padding: '12px 14px', color: 'var(--text)', fontSize: '14px',
  fontFamily: 'DM Sans, sans-serif', outline: 'none',
}

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  function switchMode(m) { setMode(m); setError(''); setSuccessMsg('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (mode === 'register' && !isPasswordValid(password)) {
      setError('La contraseña no cumple todos los requisitos.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuthSuccess?.(data.user)
        onClose()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '' },
        })
        if (error) throw error
        setSuccessMsg('¡Cuenta creada! Revisa tu email para confirmarla.')
      }
    } catch (err) {
      const msg = err.message ?? ''
      if (msg.includes('Invalid login credentials')) setError('Email o contraseña incorrectos.')
      else if (msg.includes('already registered'))   setError('Este email ya está registrado.')
      else if (msg.includes('Password should'))      setError('La contraseña no cumple los requisitos de seguridad.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : '' },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const pwdChecks = PWD_RULES.map(r => ({ ...r, ok: password.length > 0 && r.test(password) }))
  const showChecks = mode === 'register' && password.length > 0

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(7,7,14,0.9)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeUp 0.2s ease both',
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-bright)',
        borderRadius: '24px', maxWidth: '420px', width: '100%',
        padding: '36px 32px', position: 'relative',
        maxHeight: '95vh', overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
            color: 'var(--text-2)', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px',
            background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>QuizForge</span>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', marginTop: '6px' }}>
            {mode === 'login' ? 'Bienvenido de vuelta 👋' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: 'var(--card)',
          borderRadius: '10px', padding: '4px', marginBottom: '24px',
        }}>
          {[['login', 'Iniciar sesión'], ['register', 'Registrarse']].map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '9px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: mode === m ? 'var(--surface)' : 'transparent',
              color: mode === m ? 'var(--text)' : 'var(--text-2)',
              fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
              fontWeight: mode === m ? 500 : 400, transition: 'all 0.2s',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}>{label}</button>
          ))}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
            cursor: 'pointer', color: 'var(--text)', fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            marginBottom: '18px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>o con email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            required
            style={inputStyle}
          />

          {/* Password field with show/hide */}
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Contraseña segura' : 'Contraseña'}
              required
              style={{ ...inputStyle, paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', fontSize: '14px', padding: '4px',
              }}
            >{showPwd ? '🙈' : '👁'}</button>
          </div>

          {/* Password requirements checklist */}
          {showChecks && (
            <div style={{
              background: 'rgba(20,20,37,0.8)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: '6px',
              animation: 'fadeUp 0.2s ease both',
            }}>
              {pwdChecks.map(rule => (
                <div key={rule.key} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px',
                  color: rule.ok ? 'var(--green)' : 'var(--text-3)',
                  transition: 'color 0.2s',
                }}>
                  <span style={{
                    width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                    background: rule.ok ? 'rgba(16,185,129,0.2)' : 'var(--border)',
                    border: `1px solid ${rule.ok ? 'rgba(16,185,129,0.5)' : 'var(--border-bright)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', transition: 'all 0.2s',
                  }}>
                    {rule.ok ? '✓' : ''}
                  </span>
                  {rule.label}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px',
              fontSize: '13px', color: 'var(--red)',
            }}>⚠️ {error}</div>
          )}
          {successMsg && (
            <div style={{
              padding: '10px 14px', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px',
              fontSize: '13px', color: 'var(--green)',
            }}>✓ {successMsg}</div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'register' && password.length > 0 && !isPasswordValid(password))}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
              border: 'none', borderRadius: '10px', padding: '13px',
              color: 'white', fontSize: '14px', fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif',
              cursor: (loading || (mode === 'register' && password.length > 0 && !isPasswordValid(password))) ? 'not-allowed' : 'pointer',
              opacity: (loading || (mode === 'register' && password.length > 0 && !isPasswordValid(password))) ? 0.6 : 1,
              transition: 'opacity 0.2s',
              boxShadow: '0 4px 16px rgba(123,94,167,0.35)',
            }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', color: 'var(--text-3)',
          fontSize: '12px', marginTop: '20px', lineHeight: 1.6,
        }}>
          Tu historial se guarda de forma segura en la nube
        </p>
      </div>
    </div>
  )
}
