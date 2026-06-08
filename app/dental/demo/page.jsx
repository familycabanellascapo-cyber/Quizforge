'use client';
import { useState, useRef, useEffect } from 'react';

const CLINIC_NAME = process.env.NEXT_PUBLIC_DENTAL_CLINIC_NAME || 'Clínica Dental Sonrisa';

const QUICK_REPLIES = [
  'Hola, quiero pedir una cita',
  'Necesito una limpieza dental',
  '¿Qué horarios tienen disponibles mañana?',
  'Quiero cancelar mi cita',
  '¿Cuánto cuesta un empaste?',
];

export default function DemoPage() {
  const [messages, setMessages]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [channel, setChannel]     = useState('whatsapp');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res  = await fetch('/api/dental/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history, phone: '+34612345678' })
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Error desconocido');

      setHistory(json.history);
      setMessages(prev => [...prev, { role: 'assistant', content: json.response, ts: Date.now() }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ' + err.message, ts: Date.now(), isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function reset() {
    setMessages([]);
    setHistory([]);
    setInput('');
    setError('');
  }

  const isWA = channel === 'whatsapp';

  return (
    <div style={{ minHeight: '100vh', background: '#07070E', color: '#EEEEFF', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #222238', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <a href="/dental" style={{ color: '#8888AA', textDecoration: 'none', fontSize: 13 }}>← Dashboard</a>
        <span style={{ color: '#44445A' }}>|</span>
        <span style={{ color: '#A78BDA', fontWeight: 700 }}>🦷 Demo — Agente IA</span>
        <span style={{ flex: 1 }} />

        {/* Channel selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['whatsapp', 'phone'].map(ch => (
            <button
              key={ch}
              onClick={() => { setChannel(ch); reset(); }}
              style={{
                background: channel === ch ? (ch === 'whatsapp' ? '#1a3a1a' : '#1a1a3a') : '#141425',
                border: `1px solid ${channel === ch ? (ch === 'whatsapp' ? '#10B981' : '#7B5EA7') : '#222238'}`,
                color: channel === ch ? (ch === 'whatsapp' ? '#10B981' : '#A78BDA') : '#8888AA',
                borderRadius: 8, padding: '5px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600
              }}
            >
              {ch === 'whatsapp' ? '💬 WhatsApp' : '📞 Llamada'}
            </button>
          ))}
        </div>

        <button onClick={reset} style={{ background: 'transparent', border: '1px solid #222238', color: '#8888AA', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
          Reiniciar
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', maxWidth: 900, margin: '0 auto', width: '100%', gap: 0 }}>

        {/* Chat column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Phone / WA header */}
          <div style={{
            background: isWA ? '#1b2e1b' : '#1a1a2e',
            borderBottom: `1px solid ${isWA ? '#2a4a2a' : '#2a2a4a'}`,
            padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: isWA ? '#128C7E' : '#7B5EA7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🦷
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{CLINIC_NAME}</div>
              <div style={{ color: isWA ? '#25D366' : '#A78BDA', fontSize: 12 }}>
                {isWA ? '● En línea' : '📞 Llamada activa'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 16px',
            background: isWA ? '#0a1a0a' : '#0a0a1a',
            display: 'flex', flexDirection: 'column', gap: 10,
            minHeight: 0
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#44445A', marginTop: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{isWA ? '💬' : '📞'}</div>
                <div style={{ fontSize: 14 }}>
                  {isWA
                    ? 'Escribe un mensaje como si fuera un paciente por WhatsApp'
                    : 'Simula una conversación por teléfono con el agente IA'}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  {!isUser && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isWA ? '#128C7E' : '#7B5EA7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                      🦷
                    </div>
                  )}
                  <div style={{
                    background: isUser
                      ? (isWA ? '#005C4B' : '#2a1a4a')
                      : (msg.isError ? '#2d0d17' : (isWA ? '#202c33' : '#1a1a2e')),
                    border: msg.isError ? '1px solid #F43F5E33' : 'none',
                    borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    padding: '9px 13px',
                    maxWidth: '72%',
                    fontSize: 14,
                    color: msg.isError ? '#F43F5E' : '#EEEEFF',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                    <div style={{ fontSize: 10, color: '#44445A', textAlign: 'right', marginTop: 4 }}>
                      {new Date(msg.ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isWA ? '#128C7E' : '#7B5EA7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🦷</div>
                <div style={{ background: isWA ? '#202c33' : '#1a1a2e', borderRadius: '12px 12px 12px 4px', padding: '10px 16px' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            borderTop: `1px solid ${isWA ? '#2a4a2a' : '#2a2a4a'}`,
            padding: '12px 16px',
            background: isWA ? '#1b2e1b' : '#1a1a2e',
            display: 'flex', gap: 10, alignItems: 'flex-end'
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isWA ? 'Escribe un mensaje...' : 'Habla con el agente...'}
              rows={1}
              style={{
                flex: 1, background: isWA ? '#2a3a2a' : '#2a2a3a',
                border: 'none', borderRadius: 20,
                padding: '10px 16px', color: '#EEEEFF', fontSize: 14,
                outline: 'none', resize: 'none', lineHeight: 1.4,
                maxHeight: 100, overflowY: 'auto'
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: isWA ? '#00A884' : '#7B5EA7',
                color: '#fff', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: (!input.trim() || loading) ? 0.4 : 1,
                flexShrink: 0
              }}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Sidebar: quick replies + info */}
        <div style={{ width: 240, borderLeft: '1px solid #222238', padding: 16, display: 'flex', flexDirection: 'column', gap: 16, background: '#0a0a14' }}>
          <div>
            <p style={{ fontSize: 11, color: '#8888AA', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Frases de prueba
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_REPLIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  style={{
                    background: '#141425', border: '1px solid #222238',
                    borderRadius: 8, padding: '7px 10px',
                    color: '#A78BDA', fontSize: 12, cursor: 'pointer',
                    textAlign: 'left', lineHeight: 1.35,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #222238', paddingTop: 14 }}>
            <p style={{ fontSize: 11, color: '#8888AA', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Estado
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <StatusRow label="Agente IA" value="Claude claude-sonnet-4-6" ok />
              <StatusRow
                label="Base de datos"
                value={isMockModeClient() ? 'Modo demo ✦' : 'Supabase'}
                ok={!isMockModeClient()}
                warn={isMockModeClient()}
              />
              <StatusRow label="Mensajes" value={messages.filter(m => m.role === 'user').length} ok />
            </div>
          </div>

          {isMockModeClient() && (
            <div style={{ background: '#1a1a00', border: '1px solid #444400', borderRadius: 8, padding: 10, fontSize: 11, color: '#E8A838', lineHeight: 1.5 }}>
              <strong>Modo demo</strong><br />
              Las citas se guardan en memoria (se pierden al reiniciar). Configura Supabase para persistencia real.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%', background: '#8888AA',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }}
        />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

function StatusRow({ label, value, ok, warn }) {
  const color = ok ? '#10B981' : warn ? '#E8A838' : '#F43F5E';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
      <span style={{ color: '#8888AA' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

function isMockModeClient() {
  if (typeof window === 'undefined') return true;
  // Detect if we're on placeholder (dev without .env)
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');
}
