'use client'

const PLANS = [
  {
    id: 'premium',
    name: 'Premium',
    price: '5,99€',
    period: '/mes',
    badge: null,
    features: ['PDFs ilimitados', '10–30 preguntas por PDF', 'Flashcards desbloqueadas', 'Dificultad personalizable'],
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
    features: ['Todo lo de Premium', 'Ahorra 31€ vs mensual', 'Facturación anual', 'Acceso anticipado a novedades'],
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
    features: ['Hasta 10 usuarios', 'PDFs ilimitados', 'Panel de administrador', 'Analytics de uso del equipo'],
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
    features: ['Todo lo de Teams', 'Facturación anual', 'Soporte dedicado 24/7', 'Onboarding personalizado'],
    url: 'https://buy.stripe.com/test_bJe3cu1FebuWee55Ty6Zy06',
    accentColor: 'var(--green)',
    highlight: false,
  },
]

const COPY = {
  upload: {
    title: '¡Límite del plan gratuito alcanzado!',
    subtitle: 'Has usado tus 3 PDFs gratuitos. Actualiza para seguir aprendiendo sin límites.',
  },
  flashcard: {
    title: 'Desbloquea las flashcards completas',
    subtitle: 'Las flashcards son una función premium. Actualiza para estudiar con ellas sin límites.',
  },
}

export default function PaymentModal({ onClose, reason = 'upload' }) {
  const { title, subtitle } = COPY[reason] ?? COPY.upload

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(7,7,14,0.88)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'fadeUp 0.2s ease both',
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-bright)',
        borderRadius: '24px', maxWidth: '860px', width: '100%',
        maxHeight: '92vh', overflowY: 'auto', padding: '40px 32px',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '8px', width: '32px', height: '32px',
            cursor: 'pointer', color: 'var(--text-2)', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(123,94,167,0.12)', border: '1px solid rgba(167,139,218,0.3)',
            borderRadius: '100px', padding: '6px 16px', fontSize: '12px',
            color: 'var(--accent-bright)', marginBottom: '14px',
          }}>
            ✦ Planes QuizForge
          </div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
            color: 'var(--text)', marginBottom: '10px',
          }}>{title}</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', maxWidth: '460px', margin: '0 auto' }}>
            {subtitle}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: '12px',
        }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(155deg, rgba(34,211,238,0.07), rgba(123,94,167,0.07))'
                  : 'var(--card)',
                border: `1px solid ${plan.highlight ? 'rgba(34,211,238,0.32)' : 'var(--border)'}`,
                borderRadius: '16px', padding: '22px 18px',
                display: 'flex', flexDirection: 'column', gap: '14px',
                position: 'relative',
                boxShadow: plan.highlight ? '0 0 28px rgba(34,211,238,0.07)' : 'none',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: plan.highlight
                    ? 'linear-gradient(90deg, var(--accent), var(--cyan))'
                    : 'var(--card)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: '100px', padding: '3px 12px',
                  fontSize: '11px', color: plan.highlight ? 'white' : 'var(--text-2)',
                  whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                }}>
                  {plan.badge}
                </div>
              )}

              <div>
                <p style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '14px', color: 'var(--text)', marginBottom: '6px',
                }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: '24px', color: plan.accentColor,
                  }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', flexGrow: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{
                    display: 'flex', gap: '7px', alignItems: 'flex-start',
                    fontSize: '12px', color: 'var(--text-2)',
                  }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: plan.highlight
                    ? 'linear-gradient(135deg, var(--accent), var(--cyan))'
                    : 'transparent',
                  border: plan.highlight ? 'none' : `1px solid ${plan.accentColor}`,
                  borderRadius: '10px', padding: '10px 14px',
                  color: plan.highlight ? 'white' : plan.accentColor,
                  fontSize: '13px', fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: plan.highlight ? '0 4px 16px rgba(34,211,238,0.22)' : 'none',
                }}
              >
                Elegir {plan.name}
              </a>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: 'center', color: 'var(--text-3)',
          fontSize: '12px', marginTop: '22px',
        }}>
          Plan gratuito: 3 PDFs · Sin tarjeta de crédito para empezar
        </p>
      </div>
    </div>
  )
}
