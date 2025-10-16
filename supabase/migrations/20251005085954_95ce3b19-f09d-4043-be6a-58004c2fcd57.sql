-- Create incomes table
CREATE TABLE public.incomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for incomes (users can only manage incomes for their own tenders)
CREATE POLICY "Users can view incomes for their tenders"
ON public.incomes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = incomes.tender_id
    AND tenders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create incomes for their tenders"
ON public.incomes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = incomes.tender_id
    AND tenders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update incomes for their tenders"
ON public.incomes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = incomes.tender_id
    AND tenders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete incomes for their tenders"
ON public.incomes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = incomes.tender_id
    AND tenders.user_id = auth.uid()
  )
);

-- Create policies for expenses (users can only manage expenses for their own tenders)
CREATE POLICY "Users can view expenses for their tenders"
ON public.expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = expenses.tender_id
    AND tenders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create expenses for their tenders"
ON public.expenses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = expenses.tender_id
    AND tenders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update expenses for their tenders"
ON public.expenses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = expenses.tender_id
    AND tenders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete expenses for their tenders"
ON public.expenses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tenders
    WHERE tenders.id = expenses.tender_id
    AND tenders.user_id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX idx_incomes_tender_id ON public.incomes(tender_id);
CREATE INDEX idx_expenses_tender_id ON public.expenses(tender_id);
CREATE INDEX idx_incomes_date ON public.incomes(date);
CREATE INDEX idx_expenses_date ON public.expenses(date);