
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS checked_in_by uuid;

CREATE POLICY "Admins can view all tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
