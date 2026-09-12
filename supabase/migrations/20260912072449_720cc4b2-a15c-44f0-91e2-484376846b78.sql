CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins read all products" ON public.products;
CREATE POLICY "Admins read all products" ON public.products FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins read all orders" ON public.orders;
CREATE POLICY "Admins read all orders" ON public.orders FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins read product images" ON storage.objects;
CREATE POLICY "Admins read product images" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION public.has_role(uuid, public.app_role);