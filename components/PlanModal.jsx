'use client'

const PLANS = [
  {
    id: 'free',
    name: 'GRATIS',
    price: '0€',
    period: '',
    colorVar: 'var(--text-2)',
    borderColor: 'var(--border)',
    bg: 'var(--card)',
    features: ['3 PDFs por semana', '10 preguntas por PDF', 'Test + hipótesis', 'Problemas paso a paso'],
    locked: ['Flashcards', 'Dificultad personalizada', '+10 preguntas'],
    cta: 'Continuar gratis',
    stripeUrl: null,
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '5,99€',
    period: '/mes',
    colorVar: 'var(--accent-bright)',
    borderColor: 'rgba(167,139,218,0.5)',
    bg: 'rgba(123,94,167,0.08)',
    popular: true,
    features: ['PDFs ilimitados', '10–30 preguntas/PDF', 'Flashcards interactivas', 'Dificultad personalizada'],
    locked: [],
    cta: 'Empezar Premium',
    stripeUrl: 'https://buy.stripe.com/test_4gMdR80BafLcfi91Di6Zy03',
  },
  {
    id: 'premium_annual',
    name: 'PREM. ANUAL',
    price: '39,99€',
    period: '/año',
    colorVar: 'var(--cyan)',
    borderColor: 'rgba(34,211,238,0.3)',
    bg: 'rgba(34,211,238,0.04)',
    badge: 'Ahorra 31€',
    features: ['Todo Premium', 'Facturación anual', 'Acceso anticipado'],
    locked: [],
    cta: 'Empezar Anual',
    stripeUrl: 'https://buy.stripe.com/test_14A6oGes08iK6LD6XC6Zy05',
  },
  {
    id: 'teams',
    name: 'TEAMS',
    price: '59,99€',
    period: '/mes',
    colorVar: 'var(--gold)',
    borderColor: 'rgba(232,168,56,0.3)',
    bg: 'rgba(232,168,56,0.04)',
    features: ['Todo Premium', 'Hasta 10 miembros', 'Panel de equipo', 'Soporte prioritario'],
    locked: [],
    cta: 'Empezar Teams',
    stripeUrl: 'https://buy.stripe.com/test_aFa7sKgA8gPg7PHeq46Zy04',
  },
  {
    id: 'teams_annual',
    name: 'TEAMS ANUAL',
    price: '349,99€',
    period: '/año',
    colorVar: 'var(--green)',
    borderColor: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.04)',
    badge: 'Ahorra 370€',
    features: ['Todo Teams', 'Facturación anual', 'Soporte 24/7'],
    locked: [],
    cta: 'Teams Anual',
    stripeUrl: 'https://buy.stripe.com/test_bJe3cu1FebuWee55Ty6Zy06',
  },
]

function buildUrl(base, userId, email) {
  if (!base) return null
  const p = new URLSearchParams()
  if (userId) p.set('client_reference_id', userId)
  if (email)  p.set('prefilled_email', email)
  const qs = p.toString()
  return qs ? `${base}?${qs}` : base
}

export default function PlanModal({ onSelectFree, userId, userEmail }) {
  return (
    <div className="qf-modal-overlay">
      <div className="qf-modal-box" style={{ maxWidth: '980px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 26px)',
            background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Elige tu plan</span>
          <p style={{ color: 'var(--text-2)', fontSize: '13px', marginTop: '8px' }}>
            Sin permanencia · Cancela cuando quieras · PDFs gratuitos se renuevan cada semana
          </p>
        </div>

        <div className="plan-grid" style={{ paddingTop: '14px' }}>
          {PLANS.map(plan => {
            const url = buildUrl(plan.stripeUrl, userId, userEmail)
            return (
              <div key={plan.id} className="plan-card" style={{
                background: plan.bg,
                border: `1px solid ${plan.borderColor}`,
                borderRadius: '16px', padding: '20px 14px 16px',
                position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px',
                ...(plan.popular ? { boxShadow: '0 0 0 2px rgba(167,139,218,0.35)' } : {}),
              }}>
                {(plan.popular || plan.badge) && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: plan.popular
                      ? 'linear-gradient(135deg, var(--accent), var(--accent-bright))'
                      : 'var(--surface)',
                    border: plan.popular ? 'none' : '1px solid var(--border-bright)',
                    borderRadius: '100px', padding: '3px 10px',
                    fontSize: '10px', whiteSpace: 'nowrap',
                    color: plan.popular ? 'white' : 'var(--text-2)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {plan.popular ? '✦ Más popular' : plan.badge}
                  </div>
                )}

                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '5px', letterSpacing: '0.05em', fontFamily: 'DM Sans, sans-serif' }}>
                    {plan.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', flexWrap: 'wrap' }}>
                    <span className="plan-price" style={{ color: plan.colorVar }}>{plan.price}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>{plan.period}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--text-2)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                  {plan.locked?.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--text-3)', alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ flexShrink: 0 }}>✗</span>{f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => url ? window.open(url, '_blank') : onSelectFree()}
                  style={{
                    background: plan.popular
                      ? 'linear-gradient(135deg, var(--accent), var(--accent-bright))'
                      : 'transparent',
                    border: plan.popular ? 'none' : `1px solid ${plan.borderColor}`,
                    borderRadius: '9px', padding: '10px 6px',
                    color: plan.popular ? 'white' : plan.colorVar,
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', width: '100%',
                    boxShadow: plan.popular ? '0 3px 14px rgba(123,94,167,0.3)' : 'none',
                  }}
                >{plan.cta}</button>
              </div>
            )
          })}
        </div>

        {/* Test subscription */}
        <div style={{
          marginTop: '20px', padding: '14px 16px',
          background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
        }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--cyan)', fontWeight: 500, marginBottom: '2px' }}>🧪 Suscripción de prueba</p>
            <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Activa Premium completo para testear todas las funciones</p>
          </div>
          <button
            onClick={() => window.open(buildUrl('https://buy.stripe.com/test_bJe8wOabK8iKfi9eq46Zy07', userId, userEmail), '_blank')}
            style={{
              background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)',
              borderRadius: '8px', padding: '8px 14px', color: 'var(--cyan)',
              fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
            }}
          >Activar prueba →</button>
        </div>
      </div>
    </div>
  )
}
