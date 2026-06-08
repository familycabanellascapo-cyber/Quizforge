'use client';
import { useState, useEffect } from 'react';

const DEFAULT_SERVICES = ['Consulta general','Limpieza dental','Extracción dental','Empaste / Obturación','Blanqueamiento dental','Ortodoncia – consulta inicial','Implantes dentales – consulta inicial','Urgencia dental'];

export default function DentalAdmin() {
  const [clinics, setClinics]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState(null);   // clinic being edited/viewed
  const [copied, setCopied]       = useState('');
  const base = typeof window !== 'undefined' ? window.location.origin : '';

  async function fetchClinics() {
    setLoading(true);
    const res  = await fetch('/api/dental/clinics');
    const json = await res.json();
    setClinics(json.clinics || []);
    setLoading(false);
  }

  useEffect(() => { fetchClinics(); }, []);

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  async function deactivate(id) {
    if (!confirm('¿Desactivar esta clínica?')) return;
    await fetch(`/api/dental/clinics?id=${id}`, { method: 'DELETE' });
    fetchClinics();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070E', color: '#EEEEFF', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #222238', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🦷</span>
        <span style={{ fontWeight: 700, color: '#A78BDA' }}>Dental Admin — Panel de clínicas</span>
        <span style={{ flex: 1 }} />
        <a href="/dental" style={{ color: '#8888AA', fontSize: 13, textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Clínicas registradas</h1>
            <p style={{ margin: '4px 0 0', color: '#8888AA', fontSize: 14 }}>
              Cada clínica tiene su propio token y URLs de webhook únicas para Twilio.
            </p>
          </div>
          <button
            onClick={() => { setSelected(null); setShowForm(true); }}
            style={{ background: '#7B5EA7', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            + Nueva clínica
          </button>
        </div>

        {/* Global env vars reminder */}
        <div style={{ background: '#0d1a2d', border: '1px solid #1a3a5a', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
          <p style={{ margin: '0 0 8px', color: '#22D3EE', fontWeight: 600, fontSize: 13 }}>
            ⚙️ Variables de entorno globales (configurar UNA SOLA VEZ en tu servidor)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['ANTHROPIC_API_KEY','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_URL'].map(v => (
              <code key={v} style={{ background: '#141425', border: '1px solid #222238', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#A78BDA' }}>{v}</code>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', color: '#8888AA', fontSize: 12 }}>
            Todo lo demás (nombre, teléfono, horario, servicios) se configura por clínica en esta tabla.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#8888AA', textAlign: 'center', padding: 40 }}>Cargando clínicas…</p>
        ) : clinics.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#44445A', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
            <p>No hay clínicas registradas. Crea la primera.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clinics.map(c => {
              const waUrl   = `${base}/api/dental/whatsapp?token=${c.webhook_token}`;
              const voiceUrl = `${base}/api/dental/voice?token=${c.webhook_token}`;
              const isOpen  = selected?.id === c.id;
              return (
                <div key={c.id} style={{ background: '#141425', border: `1px solid ${isOpen ? '#7B5EA7' : '#222238'}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Clinic row */}
                  <div
                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                    onClick={() => setSelected(isOpen ? null : c)}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a0a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🦷</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                      <div style={{ color: '#8888AA', fontSize: 12, marginTop: 2 }}>
                        {c.phone || 'Sin teléfono'} &nbsp;·&nbsp;
                        {c.twilio_phone ? `Twilio: ${c.twilio_phone}` : 'Sin número Twilio'} &nbsp;·&nbsp;
                        {new Date(c.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <span style={{ background: c.active ? '#0d3321' : '#2d0d17', color: c.active ? '#10B981' : '#F43F5E', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                      {c.active ? 'Activa' : 'Inactiva'}
                    </span>
                    <span style={{ color: '#44445A' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>

                  {/* Expanded: webhook URLs */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #222238', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <p style={{ margin: 0, color: '#8888AA', fontSize: 13, fontWeight: 600 }}>
                        Pega estas URLs en la consola de Twilio para este número:
                      </p>

                      <WebhookRow label="💬 WhatsApp Messaging URL" url={waUrl}    copied={copied === `wa-${c.id}`}    onCopy={() => copy(waUrl,    `wa-${c.id}`)} />
                      <WebhookRow label="📞 Voice Incoming Call URL" url={voiceUrl} copied={copied === `voice-${c.id}`} onCopy={() => copy(voiceUrl, `voice-${c.id}`)} />

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                        <a href={`/dental?clinic=${c.id}`} style={{ ...btnStyle, background: '#141425', border: '1px solid #7B5EA7', color: '#A78BDA', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                          Ver dashboard →
                        </a>
                        <button onClick={() => { setSelected(c); setShowForm(true); }} style={{ ...btnStyle, background: '#1a1a35', border: '1px solid #222238', color: '#8888AA' }}>
                          Editar
                        </button>
                        <button onClick={() => deactivate(c.id)} style={{ ...btnStyle, background: 'transparent', border: '1px solid #F43F5E33', color: '#F43F5E' }}>
                          Desactivar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <ClinicForm
          clinic={selected}
          onClose={() => { setShowForm(false); setSelected(null); }}
          onSaved={() => { setShowForm(false); setSelected(null); fetchClinics(); }}
        />
      )}
    </div>
  );
}

function WebhookRow({ label, url, copied, onCopy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ color: '#8888AA', fontSize: 12, minWidth: 220 }}>{label}</span>
      <code style={{ background: '#0a0a14', border: '1px solid #222238', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#A78BDA', flex: 1, wordBreak: 'break-all' }}>{url}</code>
      <span style={{ background: '#0a1a0d', color: '#10B981', fontSize: 11, padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>POST</span>
      <button onClick={onCopy} style={{ background: 'none', border: '1px solid #222238', color: copied ? '#10B981' : '#8888AA', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}

function ClinicForm({ clinic, onClose, onSaved }) {
  const isEdit = !!clinic?.id;
  const [form, setForm] = useState({
    name:        clinic?.name        || '',
    phone:       clinic?.phone       || '',
    twilio_phone: clinic?.twilio_phone || '',
    services:    (clinic?.services   || []).join('\n'),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        id:          clinic?.id,
        name:        form.name,
        phone:       form.phone,
        twilio_phone: form.twilio_phone,
        services:    form.services.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const method = isEdit ? 'PATCH' : 'POST';
      const res    = await fetch('/api/dental/clinics', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json   = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0F0F1C', border: '1px solid #222238', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>{isEdit ? 'Editar clínica' : 'Nueva clínica'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <F label="Nombre de la clínica *"><input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Clínica Dental García" style={inp} /></F>
          <F label="Teléfono de contacto"><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 912 345 678" style={inp} /></F>
          <F label="Número de Twilio asignado"><input value={form.twilio_phone} onChange={e => set('twilio_phone', e.target.value)} placeholder="+34 900 000 000" style={inp} /></F>
          <F label="Servicios (uno por línea)">
            <textarea value={form.services} onChange={e => set('services', e.target.value)} rows={6} placeholder={DEFAULT_SERVICES.join('\n')} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
          </F>
          {error && <p style={{ color: '#F43F5E', fontSize: 13, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...btnStyle, background: 'transparent', border: '1px solid #222238', color: '#8888AA' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ ...btnStyle, background: '#7B5EA7', color: '#fff', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear clínica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, color: '#8888AA', fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const inp = { background: '#141425', border: '1px solid #222238', borderRadius: 8, padding: '8px 12px', color: '#EEEEFF', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle = { padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
