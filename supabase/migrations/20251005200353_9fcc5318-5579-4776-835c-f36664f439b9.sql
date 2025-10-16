-- First, drop all existing policies safely
DO $$ 
BEGIN
  -- Drop tenders policies
  DROP POLICY IF EXISTS "Users can view their own tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users can create their own tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users can update their own tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users can delete their own tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users and admins can view tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users and admins can create tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users and admins can update tenders" ON public.tenders;
  DROP POLICY IF EXISTS "Users and admins can delete tenders" ON public.tenders;
  
  -- Drop expenses policies
  DROP POLICY IF EXISTS "Users can view expenses for their tenders" ON public.expenses;
  DROP POLICY IF EXISTS "Users can create expenses for their tenders" ON public.expenses;
  DROP POLICY IF EXISTS "Users can update expenses for their tenders" ON public.expenses;
  DROP POLICY IF EXISTS "Users can delete expenses for their tenders" ON public.expenses;
  DROP POLICY IF EXISTS "Users and admins can view expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Users and admins can create expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Users and admins can update expenses" ON public.expenses;
  DROP POLICY IF EXISTS "Users and admins can delete expenses" ON public.expenses;
  
  -- Drop incomes policies
  DROP POLICY IF EXISTS "Users can view incomes for their tenders" ON public.incomes;
  DROP POLICY IF EXISTS "Users can create incomes for their tenders" ON public.incomes;
  DROP POLICY IF EXISTS "Users can update incomes for their tenders" ON public.incomes;
  DROP POLICY IF EXISTS "Users can delete incomes for their tenders" ON public.incomes;
  DROP POLICY IF EXISTS "Users and admins can view incomes" ON public.incomes;
  DROP POLICY IF EXISTS "Users and admins can create incomes" ON public.incomes;
  DROP POLICY IF EXISTS "Users and admins can update incomes" ON public.incomes;
  DROP POLICY IF EXISTS "Users and admins can delete incomes" ON public.incomes;
END $$;

-- Create new unified policies for tenders
CREATE POLICY "Admin or owner can view tenders"
ON public.tenders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can create tenders"
ON public.tenders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can update tenders"
ON public.tenders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can delete tenders"
ON public.tenders
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- Create new unified policies for expenses
CREATE POLICY "Admin or owner can view expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = expenses.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can create expenses"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = expenses.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can update expenses"
ON public.expenses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = expenses.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can delete expenses"
ON public.expenses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = expenses.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Create new unified policies for incomes
CREATE POLICY "Admin or owner can view incomes"
ON public.incomes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = incomes.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can create incomes"
ON public.incomes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = incomes.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can update incomes"
ON public.incomes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = incomes.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin or owner can delete incomes"
ON public.incomes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = incomes.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);