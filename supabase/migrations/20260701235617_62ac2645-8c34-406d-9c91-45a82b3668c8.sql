ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Populaire',
  ADD COLUMN IF NOT EXISTS price_fcfa integer NOT NULL DEFAULT 1000;