-- ============================================================
-- DENTAL CLINIC AI SCHEDULER - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Appointments table
CREATE TABLE IF NOT EXISTS dental_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,          -- Format: HH:MM
  service TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  channel TEXT NOT NULL DEFAULT 'manual'
    CHECK (channel IN ('whatsapp', 'phone', 'manual')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations table (AI agent chat history)
CREATE TABLE IF NOT EXISTS dental_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'phone')),
  session_id TEXT,                         -- CallSid for phone, NULL for WhatsApp
  conversation_history JSONB DEFAULT '[]',
  appointment_id UUID REFERENCES dental_appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS dental_appt_date_idx    ON dental_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS dental_appt_phone_idx   ON dental_appointments(patient_phone);
CREATE INDEX IF NOT EXISTS dental_appt_status_idx  ON dental_appointments(status);
CREATE INDEX IF NOT EXISTS dental_conv_phone_idx   ON dental_conversations(phone_number, channel);
CREATE INDEX IF NOT EXISTS dental_conv_session_idx ON dental_conversations(session_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_dental_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dental_appointments_updated_at
  BEFORE UPDATE ON dental_appointments
  FOR EACH ROW EXECUTE FUNCTION update_dental_updated_at();

CREATE TRIGGER dental_conversations_updated_at
  BEFORE UPDATE ON dental_conversations
  FOR EACH ROW EXECUTE FUNCTION update_dental_updated_at();

-- RLS: Allow service role full access (API routes use service role key)
ALTER TABLE dental_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_conversations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin users to read/write dental data
CREATE POLICY "Admins can manage dental appointments"
  ON dental_appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can manage dental conversations"
  ON dental_conversations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
