'use client';
import { useState } from 'react';

const SERVICES = [
  'Consulta general',
  'Limpieza dental',
  'Extracción dental',
  'Empaste / Obturación',
  'Blanqueamiento dental',
  'Ortodoncia – consulta inicial',
  'Implantes dentales – consulta inicial',
  'Urgencia dental'
];

const TIME_SLOTS = [];
for (let h = 9; h < 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function NewAppointmentModal({ onClose, onCreated }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    patient_name: '', patient_phone: '', appointment_date: today,
    appointment_time: '09:00', service: SERVICES[0], notes: '', channel: 'manual'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/dental/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error desconocido');
      onCreated(json.appointment);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0F0F1C', border: '1px solid #222238', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
        <h2 style={{ margin: '0 0 20px', color: '#EEEEFF', fontSize: 18 }}>Nueva cita</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nombre completo *">
            <input value={form.patient_name} onChange={e => set('patient_name', e.target.value)} required placeholder="Ej: María García" style={inputStyle} />
          </Field>

          <Field label="Teléfono *">
            <input value={form.patient_phone} onChange={e => set('patient_phone', e.target.value)} required placeholder="+34 612 345 678" style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Fecha *">
              <input type="date" value={form.appointment_date} min={today} onChange={e => set('appointment_date', e.target.value)} required style={inputStyle} />
            </Field>
            <Field label="Hora *">
              <select value={form.appointment_time} onChange={e => set('appointment_time', e.target.value)} style={inputStyle}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Servicio *">
            <select value={form.service} onChange={e => set('service', e.target.value)} style={inputStyle}>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Canal">
            <select value={form.channel} onChange={e => set('channel', e.target.value)} style={inputStyle}>
              <option value="manual">Manual (presencial/web)</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Llamada</option>
            </select>
          </Field>

          <Field label="Notas">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Observaciones adicionales..." style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          {error && <p style={{ color: '#F43F5E', fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...btnStyle, background: 'transparent', border: '1px solid #222238', color: '#8888AA' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ ...btnStyle, background: '#7B5EA7', color: '#fff', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Guardando…' : 'Agendar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, color: '#8888AA', fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  background: '#141425', border: '1px solid #222238', borderRadius: 8,
  padding: '8px 12px', color: '#EEEEFF', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box'
};

const btnStyle = {
  padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontSize: 14, fontWeight: 600
};
