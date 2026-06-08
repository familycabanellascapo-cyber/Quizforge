'use client'

const PLANS = [
  {
    id: 'premium',
    name: 'Premium',
    price: '5,99€',
    period: '/mes',
    badge: null,
    features: ['PDFs ilimitados', '10–30 preguntas/PDF', 'Flashcards desbloqueadas', 'Dificultad personalizable'],
    url: 'https://buy.stripe.com/test_4gMdR80BafLcfi91Di6Zy03',
    accentColor: 'var(--accent-bright)',
    highlight: false,
  },
  {
    id: 'premium_annual',
    name: 'Premium Anual',
    price: '39,99€',
    period: '/año',
    badge: '🏆 Más popular',
    features: ['Todo lo de Premium', 'Ahorra 31€ al año', 'Facturación anual', 'Acceso anticipado'],
    url: 'https://buy.stripe.com/test_14A6oGes08iK6LD6XC6Zy05',
    accentColor: 'var(--cyan)',
    highlight: true,
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '59,99€',
    period: '/mes',
    badge: null,
    features: ['Hasta 10 usuarios', 'PDFs ilimitados', 'Panel de administrador', 'Analytics del equipo'],
    url: 'https://buy.stripe.com/test_aFa7sKgA8gPg7PHeq46Zy04',
    accentColor: 'var(--gold)',
    highlight: false,
  },
  {
    id: 'teams_annual',
    name: 'Teams Anual',
    price: '349,99€',
    period: '/año',
    badge: '💰 Ahorra 370€',
    features: ['Todo lo de Teams', 'Facturación anual', 'Soporte 24/7', 'Onboarding personalizado'],
    url: 'https://buy.stripe.com/test_bJe3cu1FebuWee55Ty6Zy06',
    accentColor: 'var(--green)',
    highlight: false,
  },
]

const COPY = {
  upload:    { title: '¡Límite semanal alcanzado!',         subtitle: 'Has usado tus 3 PDFs gratuitos esta semana. Actualiza para continuar sin límites.' },
  flashcard: { title: 'Desbloquea las flashcards completas', subtitle: 'Las flashcards son una función Premium. Actualiza para estudiar con ellas sin límites.' },
}

function buildUrl(base, userId, email) {
  if (!base) return '#'
  const p = new URLSearchParams()
  if (userId) p.set('client_reference_id', userId)
  if (email)  p.set('prefilled_email', email)
  const qs = p.toString()
  return qs ? `${base}?${qs}` : base
}

export default function PaymentModal({ onClose, reason = 'upload', userId, userEmail }) {
  const { title, subtitle } = COPY[reason] ?? COPY.upload

  return (
    <div className="qf-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="qf-modal-box" style={{ maxWidth: '880px' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '8px', width: '32px', height: '32px',
            cursor: 'pointer', color: 'var(--text-2)', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(123,94,167,0.12)', border: '1px solid rgba(167,139,218,0.3)',
            borderRadius: '100px', padding: '5px 14px', fontSize: '12px',
            color: 'var(--accent-bright)', marginBottom: '12px',
          }}>✦ Planes QuizForge</div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', color: 'var(--text)', marginBottom: '8px',
          }}>{title}</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>{subtitle}</p>
        </div>

        <div className="payment-grid">
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight
                ? 'linear-gradient(155deg, rgba(34,211,238,0.07), rgba(123,94,167,0.07))'
                : 'var(--card)',
              border: `1px solid ${plan.highlight ? 'rgba(34,211,238,0.3)' : 'var(--border)'}`,
              borderRadius: '16px', padding: '20px 16px',
              display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative',
              boxShadow: plan.highlight ? '0 0 24px rgba(34,211,238,0.06)' : 'none',
              overflow: 'hidden',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: plan.highlight
                    ? 'linear-gradient(90deg, var(--accent), var(--cyan))'
                    : 'var(--card)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: '100px', padding: '3px 10px',
                  fontSize: '10px', color: plan.highlight ? 'white' : 'var(--text-2)',
                  whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                }}>{plan.badge}</div>
              )}

              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '13px', color: 'var(--text)', marginBottom: '5px' }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: 'clamp(16px, 2vw, 22px)', color: plan.accentColor,
                    wordBreak: 'break-word', overflowWrap: 'anywhere',
                  }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '11px', flexShrink: 0 }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              <a
                href={buildUrl(plan.url, userId, userEmail)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: plan.highlight
                    ? 'linear-gradient(135deg, var(--accent), var(--cyan))'
                    : 'transparent',
                  border: plan.highlight ? 'none' : `1px solid ${plan.accentColor}`,
                  borderRadius: '9px', padding: '10px',
                  color: plan.highlight ? 'white' : plan.accentColor,
                  fontSize: '12px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                  boxShadow: plan.highlight ? '0 3px 14px rgba(34,211,238,0.2)' : 'none',
                }}
              >Elegir {plan.name}</a>
            </div>
          ))}
        </div>

        {/* Test subscription */}
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.18)',
          borderRadius: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500, marginBottom: '1px' }}>🧪 Modo prueba</p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>Activa Premium completo para testing</p>
          </div>
          <a
            href={buildUrl('https://buy.stripe.com/test_bJe8wOabK8iKfi9eq46Zy07', userId, userEmail)}
            target="_blank" rel="noopener noreferrer"
            style={{
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
              borderRadius: '8px', padding: '7px 14px', color: 'var(--cyan)',
              fontSize: '11px', textDecoration: 'none', whiteSpace: 'nowrap',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >Activar prueba →</a>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '11px', marginTop: '16px' }}>
          Plan gratuito: 3 PDFs/semana · Sin tarjeta de crédito para empezar
        </p>
      </div>
    </div>
  )
}
