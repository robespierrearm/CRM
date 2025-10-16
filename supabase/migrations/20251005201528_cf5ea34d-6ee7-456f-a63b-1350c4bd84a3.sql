-- Add new statuses to enum
ALTER TYPE tender_status ADD VALUE IF NOT EXISTS 'review';
ALTER TYPE tender_status ADD VALUE IF NOT EXISTS 'lost';
ALTER TYPE tender_status ADD VALUE IF NOT EXISTS 'completed';

-- Add new fields to tenders table
ALTER TABLE public.tenders 
ADD COLUMN IF NOT EXISTS review_date date,
ADD COLUMN IF NOT EXISTS contract_guarantee_percent numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS contract_guarantee_amount numeric,
ADD COLUMN IF NOT EXISTS completion_deadline date,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Function to automatically set submission_date when status changes to 'submitted'
CREATE OR REPLACE FUNCTION public.set_submission_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    NEW.submission_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically calculate contract guarantee when status is 'won'
CREATE OR REPLACE FUNCTION public.calculate_contract_guarantee()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'won' AND NEW.win_amount IS NOT NULL THEN
    NEW.contract_guarantee_amount = (NEW.win_amount * COALESCE(NEW.contract_guarantee_percent, 5)) / 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically archive tender when status is 'lost' or 'completed'
CREATE OR REPLACE FUNCTION public.auto_archive_tender()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('lost', 'completed') AND (OLD.status IS NULL OR OLD.status NOT IN ('lost', 'completed')) THEN
    NEW.is_archived = true;
    NEW.archived_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_set_submission_date ON public.tenders;
CREATE TRIGGER trigger_set_submission_date
  BEFORE UPDATE ON public.tenders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_submission_date();

DROP TRIGGER IF EXISTS trigger_calculate_contract_guarantee ON public.tenders;
CREATE TRIGGER trigger_calculate_contract_guarantee
  BEFORE INSERT OR UPDATE ON public.tenders
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_contract_guarantee();

DROP TRIGGER IF EXISTS trigger_auto_archive_tender ON public.tenders;
CREATE TRIGGER trigger_auto_archive_tender
  BEFORE UPDATE ON public.tenders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_archive_tender();