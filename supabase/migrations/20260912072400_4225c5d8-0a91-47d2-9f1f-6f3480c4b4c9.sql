UPDATE public.products
SET published = false,
    updated_at = now()
WHERE published = true;