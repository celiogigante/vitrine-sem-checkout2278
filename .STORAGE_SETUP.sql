-- Script para criar bucket de imagens no Supabase
-- Cole no SQL Editor do seu Supabase

-- Criar bucket public para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT DO NOTHING;

-- Política para que qualquer um possa ver imagens
CREATE POLICY "Públicas visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Política para que apenas admins possam upload/delete
CREATE POLICY "Admin upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admin delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admin update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.uid() IS NOT NULL);
