-- SQL Script para criar as tabelas necessárias no Supabase
-- Execute estes comandos no SQL Editor do Supabase Dashboard

-- 1. Tabela de Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anônimo',
    email TEXT,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'compliment', 'complaint', 'accessibility')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Questionários
CREATE TABLE IF NOT EXISTS questionnaires (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anônimo',
    disability_type TEXT,
    common_problems TEXT[],
    site_rating INTEGER CHECK (site_rating >= 1 AND site_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para permitir inserção anônima
CREATE POLICY "Allow anonymous inserts on feedback" ON feedback
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on questionnaires" ON questionnaires
    FOR INSERT TO anon
    WITH CHECK (true);

-- 5. Políticas para permitir leitura (para estatísticas)
CREATE POLICY "Allow anonymous read on feedback" ON feedback
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Allow anonymous read on questionnaires" ON questionnaires
    FOR SELECT TO anon
    USING (true);

-- 6. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

CREATE INDEX IF NOT EXISTS idx_questionnaires_created_at ON questionnaires(created_at);
CREATE INDEX IF NOT EXISTS idx_questionnaires_disability_type ON questionnaires(disability_type);
CREATE INDEX IF NOT EXISTS idx_questionnaires_site_rating ON questionnaires(site_rating);

-- 7. Comentários para documentação
COMMENT ON TABLE feedback IS 'Tabela para armazenar feedback dos usuários sobre o site';
COMMENT ON TABLE questionnaires IS 'Tabela para armazenar respostas dos questionários de acessibilidade';

COMMENT ON COLUMN feedback.name IS 'Nome do usuário (padrão: Anônimo)';
COMMENT ON COLUMN feedback.email IS 'Email do usuário (opcional)';
COMMENT ON COLUMN feedback.type IS 'Tipo do feedback: bug, suggestion, compliment, complaint, accessibility';
COMMENT ON COLUMN feedback.rating IS 'Avaliação de 1 a 5 estrelas';
COMMENT ON COLUMN feedback.message IS 'Mensagem do feedback';
COMMENT ON COLUMN feedback.page IS 'Página onde o feedback foi enviado';

COMMENT ON COLUMN questionnaires.name IS 'Nome do respondente (padrão: Anônimo)';
COMMENT ON COLUMN questionnaires.disability_type IS 'Tipo de deficiência ou dificuldade';
COMMENT ON COLUMN questionnaires.common_problems IS 'Array de problemas comuns enfrentados';
COMMENT ON COLUMN questionnaires.site_rating IS 'Avaliação do site de 1 a 5 estrelas';