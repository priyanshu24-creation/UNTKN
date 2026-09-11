ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'unisex';
ALTER TABLE public.products ADD CONSTRAINT products_gender_check CHECK (gender IN ('men','women','unisex'));
CREATE INDEX IF NOT EXISTS products_gender_idx ON public.products (gender);