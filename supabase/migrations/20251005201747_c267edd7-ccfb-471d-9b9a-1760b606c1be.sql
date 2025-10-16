-- Fix security warnings by setting search_path for functions

CREATE OR REPLACE FUNCTION public.set_submission_date()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    NEW.submission_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_contract_guarantee()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'won' AND NEW.win_amount IS NOT NULL THEN
    NEW.contract_guarantee_amount = (NEW.win_amount * COALESCE(NEW.contract_guarantee_percent, 5)) / 100;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_archive_tender()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('lost', 'completed') AND (OLD.status IS NULL OR OLD.status NOT IN ('lost', 'completed')) THEN
    NEW.is_archived = true;
    NEW.archived_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;