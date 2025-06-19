UPDATE public.config 
SET login_logo_url = 'https://qqvwsyvnvlfnbmrzyjkg.supabase.co/storage/v1/object/public/app-images//default-logo.png'
WHERE id IS NOT NULL;

INSERT INTO public.config (login_logo_url)
SELECT 'https://qqvwsyvnvlfnbmrzyjkg.supabase.co/storage/v1/object/public/app-images//default-logo.png'
WHERE NOT EXISTS (SELECT 1 FROM public.config);