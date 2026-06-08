'use client';

export default function ConversationLog({ conversation, onClose }) {
  if (!conversation) return null;

  const history = (conversation.conversation_history || []).filter(
    m => m.role === 'user' || m.role === 'assistant'
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000088',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      zIndex: 1000, padding: 24
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0F0F1C',
          border: '1px solid #222238',
          borderRadius: 16,
          width: 420,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #222238', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#EEEEFF', fontWeight: 700, fontSize: 15 }}>
              {conversation.channel === 'whatsapp' ? '💬 WhatsApp' : '📞 Llamada'}
            </div>
            <div style={{ color: '#8888AA', fontSize: 12, marginTop: 2 }}>
              {conversation.phone_number} &nbsp;·&nbsp;
              {new Date(conversation.updated_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8888AA', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.length === 0 && (
            <p style={{ color: '#44445A', textAlign: 'center', fontSize: 14 }}>Conversación vacía.</p>
          )}
          {history.map((msg, i) => {
            const isUser = msg.role === 'user';
            const text   = extractText(msg.content);
            if (!text) return null;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  background: isUser ? '#141425' : '#2a1a4a',
                  border: `1px solid ${isUser ? '#222238' : '#4a2a7a'}`,
                  borderRadius: isUser ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                  padding: '8px 12px',
                  maxWidth: '80%',
                  fontSize: 13,
                  color: isUser ? '#EEEEFF' : '#D4B8FF',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join(' ')
      .trim();
  }
  return '';
}
