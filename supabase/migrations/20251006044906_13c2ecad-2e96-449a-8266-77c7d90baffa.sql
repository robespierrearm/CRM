-- Fix Tenders Table RLS Policies
-- Remove the OR (user_id IS NULL) condition that exposes unassigned tenders

DROP POLICY IF EXISTS "Admin or owner can view tenders" ON public.tenders;
DROP POLICY IF EXISTS "Admin or owner can create tenders" ON public.tenders;
DROP POLICY IF EXISTS "Admin or owner can update tenders" ON public.tenders;
DROP POLICY IF EXISTS "Admin or owner can delete tenders" ON public.tenders;

-- Recreate policies without the NULL user_id bypass
CREATE POLICY "Admin or owner can view tenders"
ON public.tenders
FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin or owner can create tenders"
ON public.tenders
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin or owner can update tenders"
ON public.tenders
FOR UPDATE
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin or owner can delete tenders"
ON public.tenders
FOR DELETE
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix Settings Table RLS Policy
-- Change from public read to admin-only access

DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can view settings" ON public.settings;

CREATE POLICY "Only admins can view settings"
ON public.settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));