'use client';

const STATUS_COLORS = {
  confirmed: { bg: '#0d3321', color: '#10B981', label: 'Confirmada' },
  pending:   { bg: '#2d2200', color: '#E8A838', label: 'Pendiente'  },
  cancelled: { bg: '#2d0d17', color: '#F43F5E', label: 'Cancelada'  },
  completed: { bg: '#0d1a2d', color: '#22D3EE', label: 'Completada' }
};

const CHANNEL_ICONS = {
  whatsapp: '💬',
  phone:    '📞',
  manual:   '🖊️'
};

export default function AppointmentsList({ appointments, onStatusChange, onSelect, selectedId }) {
  if (!appointments.length) {
    return (
      <div style={{ textAlign: 'center', color: '#44445A', padding: '48px 0' }}>
        No hay citas para este período.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {appointments.map(appt => {
        const s   = STATUS_COLORS[appt.status] || STATUS_COLORS.confirmed;
        const selected = appt.id === selectedId;
        return (
          <div
            key={appt.id}
            onClick={() => onSelect?.(appt)}
            style={{
              background: selected ? '#1a1a30' : '#141425',
              border: `1px solid ${selected ? '#7B5EA7' : '#222238'}`,
              borderRadius: 12,
              padding: '14px 18px',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
          >
            {/* Time block */}
            <div style={{ minWidth: 60, textAlign: 'center' }}>
              <div style={{ color: '#A78BDA', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono, monospace)' }}>
                {appt.appointment_time}
              </div>
              <div style={{ color: '#44445A', fontSize: 11 }}>
                {formatDate(appt.appointment_date)}
              </div>
            </div>

            {/* Patient info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#EEEEFF', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {appt.patient_name}
              </div>
              <div style={{ color: '#8888AA', fontSize: 13, marginTop: 2 }}>
                {appt.service} &nbsp;·&nbsp; {appt.patient_phone}
              </div>
            </div>

            {/* Channel badge */}
            <div style={{ fontSize: 18 }} title={appt.channel}>
              {CHANNEL_ICONS[appt.channel] || '📋'}
            </div>

            {/* Status badge */}
            <div style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              {s.label}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
              {appt.status === 'confirmed' && (
                <>
                  <ActionBtn color="#10B981" onClick={() => onStatusChange(appt.id, 'completed')} title="Marcar completada">✓</ActionBtn>
                  <ActionBtn color="#F43F5E" onClick={() => onStatusChange(appt.id, 'cancelled')} title="Cancelar">✕</ActionBtn>
                </>
              )}
              {appt.status === 'pending' && (
                <ActionBtn color="#10B981" onClick={() => onStatusChange(appt.id, 'confirmed')} title="Confirmar">✓</ActionBtn>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionBtn({ color, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: `1px solid ${color}33`,
        color,
        borderRadius: 6,
        width: 28,
        height: 28,
        cursor: 'pointer',
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </button>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${months[parseInt(m) - 1]}`;
}
