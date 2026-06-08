'use client'

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '0€',
    period: '',
    color: 'var(--text-2)',
    borderColor: 'var(--border)',
    bg: 'var(--card)',
    features: [
      '3 PDFs por semana (se renuevan cada lunes)',
      '10 preguntas por PDF',
      'Test tipo test + hipótesis',
      'Línea del tiempo automática',
      'Problemas con solución paso a paso',
    ],
    locked: [
      'Flashcards interactivas',
      'Dificultad personalizada',
      'Más de 10 preguntas por PDF',
    ],
    cta: 'Continuar gratis',
    stripeUrl: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '5,99€',
    period: '/mes',
    color: 'var(--accent-bright)',
    borderColor: 'rgba(167,139,218,0.55)',
    bg: 'rgba(123,94,167,0.08)',
    popular: true,
    features: [
      'PDFs ilimitados (sin límite semanal)',
      'Elige entre 10 y 30 preguntas por PDF',
      'Flashcards interactivas desbloqueadas',
      'Dificultad personalizada (Baja / Media / Alta)',
      'Historial guardado en la nube',
    ],
    locked: [],
    cta: 'Empezar Premium →',
    stripeUrl: 'https://buy.stripe.com/test_4gMdR80BafLcfi91Di6Zy03',
  },
  {
    id: 'premium_annual',
    name: 'Premium Anual',
    price: '39,99€',
    period: '/año',
    color: 'var(--cyan)',
    borderColor: 'rgba(34,211,238,0.35)',
    bg: 'rgba(34,211,238,0.05)',
    badge: '🏆 Ahorra 31€',
    features: [
      'Todo lo incluido en Premium',
      'Facturación anual — ahorra 31€',
      'Acceso anticipado a nuevas funciones',
    ],
    locked: [],
    cta: 'Empezar Premium Anual →',
    stripeUrl: 'https://buy.stripe.com/test_14A6oGes08iK6LD6XC6Zy05',
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '59,99€',
    period: '/mes',
    color: 'var(--gold)',
    borderColor: 'rgba(232,168,56,0.35)',
    bg: 'rgba(232,168,56,0.05)',
    features: [
      'Todo lo incluido en Premium',
      'Hasta 10 miembros en el equipo',
      'Panel de administración de equipo',
      'Analytics de uso del equipo',
      'Soporte prioritario',
    ],
    locked: [],
    cta: 'Empezar Teams →',
    stripeUrl: 'https://buy.stripe.com/test_aFa7sKgA8gPg7PHeq46Zy04',
  },
  {
    id: 'teams_annual',
    name: 'Teams Anual',
    price: '349,99€',
    period: '/año',
    color: 'var(--green)',
    borderColor: 'rgba(16,185,129,0.35)',
    bg: 'rgba(16,185,129,0.04)',
    badge: '💰 Ahorra 370€',
    features: [
      'Todo lo incluido en Teams',
      'Facturación anual — ahorra 370€',
      'Soporte dedicado 24/7',
      'Onboarding personalizado para el equipo',
    ],
    locked: [],
    cta: 'Empezar Teams Anual →',
    stripeUrl: 'https://buy.stripe.com/test_bJe3cu1FebuWee55Ty6Zy06',
  },
]

export default function PlanModal({ onSelectFree }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(7,7,14,0.93)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', animation: 'fadeUp 0.25s ease both',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-bright)',
        borderRadius: '24px', maxWidth: '1020px', width: '100%',
        padding: '40px 32px 32px', maxHeight: '95vh', overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px',
            background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Elige tu plan</span>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '10px', lineHeight: 1.6 }}>
            Puedes cambiar o cancelar en cualquier momento. Sin permanencia.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px', marginBottom: '28px',
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.bg,
              border: `1px solid ${plan.borderColor}`,
              borderRadius: '18px', padding: '22px 18px',
              position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              {/* Badge */}
              {(plan.popular || plan.badge) && (
                <div style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: plan.popular
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-bright))'
                    : 'var(--card)',
                  border: plan.popular ? 'none' : '1px solid var(--border-bright)',
                  borderRadius: '100px', padding: '4px 14px', fontSize: '11px',
                  color: plan.popular ? 'white' : 'var(--text-2)',
                  whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                }}>{plan.popular ? '✦ Más popular' : plan.badge}</div>
              )}

              {/* Price */}
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '5px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em' }}>
                  {plan.name.toUpperCase()}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px', color: plan.color }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '7px', fontSize: '12px', color: 'var(--text-2)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }}>✓</span> {f}
                  </div>
                ))}
                {plan.locked?.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '7px', fontSize: '12px', color: 'var(--text-3)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ flexShrink: 0, marginTop: '1px' }}>✗</span> {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  if (plan.stripeUrl) window.open(plan.stripeUrl, '_blank')
                  else onSelectFree()
                }}
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-bright))'
                    : 'transparent',
                  border: plan.popular ? 'none' : `1px solid ${plan.borderColor}`,
                  borderRadius: '10px', padding: '11px 8px',
                  color: plan.popular ? 'white' : plan.color,
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.2s',
                  boxShadow: plan.popular ? '0 4px 18px rgba(123,94,167,0.35)' : 'none',
                  lineHeight: 1.3,
                }}
              >{plan.cta}</button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7 }}>
          Los PDFs del plan gratuito se renuevan cada semana · Sin permanencia · Cancela cuando quieras
        </p>
      </div>
    </div>
  )
}
