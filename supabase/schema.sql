-- Tabla para guardar los quizzes generados por usuario
CREATE TABLE IF NOT EXISTS uploads (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject     TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('theory', 'practical')),
  emoji       TEXT,
  quiz_data   JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: cada usuario solo ve sus propios datos
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios uploads"
  ON uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus propios uploads"
  ON uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus propios uploads"
  ON uploads FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para consultas rápidas por usuario
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads (user_id);
CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON uploads (created_at DESC);
