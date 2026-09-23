-- Criar tabela para logs de erro
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL CHECK (error_type IN ('javascript', 'network', 'unhandled_rejection', 'custom')),
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT NOT NULL,
  user_agent TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index para queries rápidas
CREATE INDEX IF NOT EXISTS error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_error_type ON error_logs(error_type);

-- RLS Policy: Apenas logs de leitura (nunca deletar via policy)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT anônimo (para capturar erros de usuários não autenticados)
CREATE POLICY "Allow anonymous insert" ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Permitir SELECT apenas para admin (autenticado)
CREATE POLICY "Allow admin select" ON error_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Permitir DELETE apenas para admin
CREATE POLICY "Allow admin delete" ON error_logs
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Comentário explicativo
COMMENT ON TABLE error_logs IS 'Logs de erros da aplicação - deletar regularmente para manter storage limpo';
