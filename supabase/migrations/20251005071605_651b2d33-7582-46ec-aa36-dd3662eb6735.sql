-- Drop old enum and create new one with updated statuses
DROP TYPE IF EXISTS public.tender_status CASCADE;
CREATE TYPE public.tender_status AS ENUM ('accepting', 'submitted', 'won', 'in_progress');

-- Drop customer column and add new columns
ALTER TABLE public.tenders 
  DROP COLUMN IF EXISTS customer,
  ADD COLUMN IF NOT EXISTS status public.tender_status NOT NULL DEFAULT 'accepting',
  ADD COLUMN IF NOT EXISTS win_amount numeric,
  ADD COLUMN IF NOT EXISTS publish_date date;

-- Update column comments for clarity
COMMENT ON COLUMN public.tenders.amount IS 'Начальная цена тендера';
COMMENT ON COLUMN public.tenders.win_amount IS 'Цена победы (заполняется при статусе "Победа")';
COMMENT ON COLUMN public.tenders.publish_date IS 'Дата публикации тендера';
COMMENT ON COLUMN public.tenders.submission_date IS 'Дата подачи заявки (deprecated)';
COMMENT ON COLUMN public.tenders.deadline IS 'Дата окончания приема заявок';