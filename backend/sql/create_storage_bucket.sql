-- Rodar no SQL Editor do Supabase para criar o bucket de arquivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('agro-files', 'agro-files', true)
ON CONFLICT (id) DO NOTHING;
