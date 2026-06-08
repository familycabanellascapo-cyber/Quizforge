-- ============================================================
-- DENTAL MULTI-TENANT MIGRATION
-- Run after dental_schema.sql
-- ============================================================

-- 1. Clinics table: one row per dental clinic client
CREATE TABLE IF NOT EXISTS dental_clinics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         TEXT DEFAULT '',               -- display phone for confirmation messages
  twilio_phone  TEXT DEFAULT '',               -- Twilio number assigned to this clinic
  webhook_token TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  services      JSONB DEFAULT '["Consulta general","Limpieza dental","Extracción dental","Empaste / Obturación","Blanqueamiento dental","Ortodoncia – consulta inicial","Implantes dentales – consulta inicial","Urgencia dental"]',
  schedule      JSONB DEFAULT '{"mon_fri":{"start":"09:00","end":"18:00"},"sat":{"start":"09:00","end":"14:00"},"sun":null}',
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Clinic ↔ user membership
CREATE TABLE IF NOT EXISTS dental_clinic_users (
  clinic_id UUID REFERENCES dental_clinics(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES auth.users(id)     ON DELETE CASCADE,
  role      TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  PRIMARY KEY (clinic_id, user_id)
);

-- 3. Add clinic_id to appointments and conversations (nullable for backward compat)
ALTER TABLE dental_appointments    ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES dental_clinics(id);
ALTER TABLE dental_conversations   ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES dental_clinics(id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS dental_clinics_token_idx     ON dental_clinics(webhook_token);
CREATE INDEX IF NOT EXISTS dental_appt_clinic_idx       ON dental_appointments(clinic_id);
CREATE INDEX IF NOT EXISTS dental_conv_clinic_idx       ON dental_conversations(clinic_id);
CREATE INDEX IF NOT EXISTS dental_clinic_users_user_idx ON dental_clinic_users(user_id);

-- 5. Trigger for updated_at
CREATE TRIGGER dental_clinics_updated_at
  BEFORE UPDATE ON dental_clinics
  FOR EACH ROW EXECUTE FUNCTION update_dental_updated_at();

-- 6. RLS
ALTER TABLE dental_clinics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_clinic_users  ENABLE ROW LEVEL SECURITY;

-- Admins can manage all clinics
CREATE POLICY "Admins manage all clinics"
  ON dental_clinics FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Clinic staff can read their own clinic
CREATE POLICY "Staff read own clinic"
  ON dental_clinics FOR SELECT
  USING (EXISTS (SELECT 1 FROM dental_clinic_users WHERE clinic_id = dental_clinics.id AND user_id = auth.uid()));

-- Clinic staff can read/update their own memberships
CREATE POLICY "Admins manage memberships"
  ON dental_clinic_users FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Staff read own membership"
  ON dental_clinic_users FOR SELECT
  USING (user_id = auth.uid());
