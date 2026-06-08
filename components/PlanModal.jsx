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
      'Línea del tiempo',
      'Problemas con solución paso a paso',
    ],
    locked: ['Flashcards', 'Dificultad personalizada', 'Hasta 30 preguntas'],
    cta: 'Continuar gratis',
    stripeUrl: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '9€',
    period: '/mes',
    color: 'var(--accent-bright)',
    borderColor: 'rgba(167,139,218,0.55)',
    bg: 'rgba(123,94,167,0.08)',
    popular: true,
    features: [
      'PDFs ilimitados',
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
    id: 'teams',
    name: 'Teams',
    price: '19€',
    period: '/mes',
    color: 'var(--cyan)',
    borderColor: 'rgba(34,211,238,0.35)',
    bg: 'rgba(34,211,238,0.05)',
    features: [
      'Todo lo incluido en Premium',
      'Hasta 10 miembros en el equipo',
      'Panel de administración de equipo',
      'Soporte prioritario',
    ],
    locked: [],
    cta: 'Empezar Teams →',
    stripeUrl: 'https://buy.stripe.com/test_aFa7sKgA8gPg7PHeq46Zy04',
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
        borderRadius: '24px', maxWidth: '820px', width: '100%',
        padding: '40px 32px 32px', maxHeight: '95vh', overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px',
            background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Bienvenido a QuizForge</span>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '10px', lineHeight: 1.6 }}>
            Elige el plan que mejor se adapte a ti. Puedes cambiarlo cuando quieras.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px', marginBottom: '28px',
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.bg,
              border: `1px solid ${plan.borderColor}`,
              borderRadius: '18px', padding: '26px 22px',
              position: 'relative', display: 'flex', flexDirection: 'column', gap: '18px',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
                  borderRadius: '100px', padding: '4px 16px', fontSize: '11px',
                  color: 'white', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                }}>✦ Más popular</div>
              )}

              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'DM Sans, sans-serif' }}>
                  {plan.name.toUpperCase()}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '32px',
                    color: plan.color,
                  }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>{plan.period}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-2)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }}>✓</span> {f}
                  </div>
                ))}
                {plan.locked.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-3)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ flexShrink: 0, marginTop: '1px' }}>✗</span> {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.stripeUrl) window.open(plan.stripeUrl, '_blank')
                  else onSelectFree()
                }}
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-bright))'
                    : plan.id === 'teams'
                      ? 'transparent'
                      : 'var(--surface)',
                  border: plan.popular ? 'none' : `1px solid ${plan.borderColor}`,
                  borderRadius: '10px', padding: '12px',
                  color: plan.popular ? 'white' : plan.color,
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.2s',
                  boxShadow: plan.popular ? '0 4px 18px rgba(123,94,167,0.35)' : 'none',
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
