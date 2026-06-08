'use client';
import { useState, useEffect, useCallback } from 'react';
import AppointmentsList from '@/components/dental/AppointmentsList';
import ConversationLog  from '@/components/dental/ConversationLog';
import NewAppointmentModal from '@/components/dental/NewAppointmentModal';

const CLINIC_NAME = process.env.NEXT_PUBLIC_DENTAL_CLINIC_NAME || 'Clínica Dental Sonrisa';

const TABS = [
  { id: 'today',    label: 'Hoy' },
  { id: 'upcoming', label: 'Próximas' },
  { id: 'all',      label: 'Todas' }
];

export default function DentalDashboard() {
  const [appointments, setAppointments]     = useState([]);
  const [conversations, setConversations]   = useState([]);
  const [activeTab, setActiveTab]           = useState('today');
  const [loading, setLoading]               = useState(true);
  const [showModal, setShowModal]           = useState(false);
  const [selectedConv, setSelectedConv]     = useState(null);
  const [selectedAppt, setSelectedAppt]     = useState(null);
  const [statusFilter, setStatusFilter]     = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/dental/appointments?';
      if (activeTab === 'today') url += `date=${today}`;
      else if (activeTab === 'upcoming') url += `from=${today}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res  = await fetch(url);
      const json = await res.json();
      setAppointments(json.appointments || []);
    } finally {
      setLoading(false);
    }
  }, [activeTab, today, statusFilter]);

  const fetchConversations = useCallback(async () => {
    const res  = await fetch('/api/dental/conversations');
    const json = await res.json();
    setConversations(json.conversations || []);
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  async function handleStatusChange(id, newStatus) {
    await fetch('/api/dental/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchAppointments();
  }

  function handleSelectAppt(appt) {
    setSelectedAppt(appt);
    const conv = conversations.find(c => c.phone_number === appt.patient_phone);
    setSelectedConv(conv || null);
  }

  // Stats
  const todayAppts     = appointments.filter(a => a.appointment_date === today);
  const confirmedToday = todayAppts.filter(a => a.status === 'confirmed').length;
  const pendingCount   = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div style={{ minHeight: '100vh', background: '#07070E', color: '#EEEEFF', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #222238', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16, height: 60 }}>
        <span style={{ fontSize: 20 }}>🦷</span>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#A78BDA' }}>{CLINIC_NAME}</span>
        <span style={{ flex: 1 }} />
        <a href="/" style={{ color: '#8888AA', fontSize: 13, textDecoration: 'none' }}>← Volver a QuizForge</a>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Panel de citas</h1>
            <p style={{ margin: '4px 0 0', color: '#8888AA', fontSize: 14 }}>
              {formatFullDate(today)}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#7B5EA7', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            + Nueva cita
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          <StatCard icon="📅" label="Citas hoy"        value={todayAppts.length}  color="#A78BDA" />
          <StatCard icon="✅" label="Confirmadas hoy"  value={confirmedToday}     color="#10B981" />
          <StatCard icon="⏳" label="Pendientes"        value={pendingCount}       color="#E8A838" />
          <StatCard icon="🏁" label="Completadas"       value={completedCount}     color="#22D3EE" />
        </div>

        {/* Webhook Setup */}
        <SetupCard />

        {/* Tabs + Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? '#7B5EA7' : '#141425',
                border: `1px solid ${activeTab === t.id ? '#7B5EA7' : '#222238'}`,
                color: activeTab === t.id ? '#fff' : '#8888AA',
                borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}
            >{t.label}</button>
          ))}
          <span style={{ flex: 1 }} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#141425', border: '1px solid #222238', color: '#EEEEFF', borderRadius: 8, padding: '7px 12px', fontSize: 13 }}
          >
            <option value="">Todos los estados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {/* Appointments list */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#8888AA', padding: '40px 0' }}>Cargando citas…</div>
        ) : (
          <AppointmentsList
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onSelect={handleSelectAppt}
            selectedId={selectedAppt?.id}
          />
        )}

        {/* Recent conversations */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#A78BDA', marginBottom: 14 }}>Conversaciones recientes del agente IA</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conversations.slice(0, 10).map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                style={{
                  background: '#141425', border: '1px solid #222238', borderRadius: 10,
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12
                }}
              >
                <span style={{ fontSize: 18 }}>{conv.channel === 'whatsapp' ? '💬' : '📞'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#EEEEFF', fontSize: 14, fontWeight: 500 }}>{conv.phone_number}</div>
                  <div style={{ color: '#44445A', fontSize: 12 }}>
                    {conv.conversation_history?.filter(m => m.role).length || 0} mensajes &nbsp;·&nbsp;
                    {new Date(conv.updated_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <span style={{ color: '#44445A', fontSize: 12 }}>Ver →</span>
              </div>
            ))}
            {conversations.length === 0 && (
              <p style={{ color: '#44445A', fontSize: 14 }}>Aún no hay conversaciones del agente.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <NewAppointmentModal
          onClose={() => setShowModal(false)}
          onCreated={appt => { setAppointments(prev => [appt, ...prev]); }}
        />
      )}

      {selectedConv && (
        <ConversationLog conversation={selectedConv} onClose={() => setSelectedConv(null)} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#141425', border: '1px solid #222238', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: '#8888AA', fontSize: 12 }}>{label}</span>
      </div>
      <div style={{ color, fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}

function SetupCard() {
  const [open, setOpen] = useState(false);
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com';

  return (
    <div style={{ background: '#0d1a2d', border: '1px solid #1a3a5a', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <span style={{ color: '#22D3EE', fontSize: 16 }}>⚙️</span>
        <span style={{ color: '#22D3EE', fontWeight: 600, fontSize: 14 }}>Configuración de webhooks Twilio</span>
        <span style={{ marginLeft: 'auto', color: '#44445A' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <WebhookRow label="WhatsApp Messaging URL" url={`${base}/api/dental/whatsapp`} method="POST" />
          <WebhookRow label="Voice Incoming Call URL" url={`${base}/api/dental/voice`}    method="POST" />
          <div style={{ color: '#8888AA', fontSize: 12, marginTop: 6 }}>
            Variables de entorno necesarias: <code style={{ color: '#A78BDA' }}>ANTHROPIC_API_KEY</code>,{' '}
            <code style={{ color: '#A78BDA' }}>TWILIO_ACCOUNT_SID</code>,{' '}
            <code style={{ color: '#A78BDA' }}>TWILIO_AUTH_TOKEN</code>,{' '}
            <code style={{ color: '#A78BDA' }}>SUPABASE_SERVICE_ROLE_KEY</code>,{' '}
            <code style={{ color: '#A78BDA' }}>DENTAL_CLINIC_NAME</code>
          </div>
        </div>
      )}
    </div>
  );
}

function WebhookRow({ label, url, method }) {
  const [copied, setCopied] = useState(false);
  function copy() { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ color: '#8888AA', fontSize: 12, minWidth: 200 }}>{label}</span>
      <code style={{ background: '#141425', border: '1px solid #222238', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#A78BDA', flex: 1 }}>{url}</code>
      <span style={{ background: '#0d3321', color: '#10B981', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{method}</span>
      <button onClick={copy} style={{ background: 'none', border: '1px solid #222238', color: copied ? '#10B981' : '#8888AA', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
