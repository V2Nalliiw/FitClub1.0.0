-- Remove políticas existentes no bucket 'app-images' para evitar conflitos.
-- É uma boa prática para garantir que o script seja idempotente.
DROP POLICY IF EXISTS "Public Read Access for App Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access for App Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access for App Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access for App Images" ON storage.objects;


-- POLÍTICA 1: ACESSO DE LEITURA PÚBLICO
-- Permite que qualquer pessoa (mesmo não logada) leia/veja os arquivos neste bucket.
-- Essencial para que as URLs públicas das logos funcionem no seu site.
CREATE POLICY "Public Read Access for App Images"
ON storage.objects FOR SELECT
TO public -- 'public' concede acesso a todos, incluindo anônimos.
USING ( bucket_id = 'app-images' );


-- POLÍTICA 2: ACESSO DE UPLOAD PARA USUÁRIOS AUTENTICADOS
-- Permite que qualquer usuário logado (authenticated) insira novos arquivos.
-- A sua aplicação (API/Frontend) é responsável por verificar se o usuário tem a role correta (ex: 'super_admin').
CREATE POLICY "Authenticated Upload Access for App Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'app-images' );


-- POLÍTICA 3: ACESSO DE ATUALIZAÇÃO PARA USUÁRIOS AUTENTICADOS
-- Permite que usuários logados atualizem (sobrescrevam) arquivos existentes.
-- Útil para a funcionalidade de 'upsert' do Supabase Storage.
CREATE POLICY "Authenticated Update Access for App Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'app-images' );


-- POLÍTICA 4: ACESSO DE EXCLUSÃO PARA USUÁRIOS AUTENTICADOS
-- Permite que usuários logados removam arquivos.
-- Necessário para a lógica de limpeza do seu 'logoService.ts'.
CREATE POLICY "Authenticated Delete Access for App Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'app-images' );