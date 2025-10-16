-- Сделать user_id nullable и изменить поведение при удалении пользователя
-- Сначала удаляем старый внешний ключ
ALTER TABLE public.tenders DROP CONSTRAINT IF EXISTS tenders_user_id_fkey;

-- Делаем user_id nullable
ALTER TABLE public.tenders ALTER COLUMN user_id DROP NOT NULL;

-- Создаем новый внешний ключ с SET NULL вместо CASCADE
ALTER TABLE public.tenders 
ADD CONSTRAINT tenders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Обновляем RLS политики для работы с null user_id
DROP POLICY IF EXISTS "Admin or owner can view tenders" ON public.tenders;
DROP POLICY IF EXISTS "Admin or owner can create tenders" ON public.tenders;
DROP POLICY IF EXISTS "Admin or owner can update tenders" ON public.tenders;
DROP POLICY IF EXISTS "Admin or owner can delete tenders" ON public.tenders;

CREATE POLICY "Admin or owner can view tenders" 
ON public.tenders 
FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR user_id IS NULL
);

CREATE POLICY "Admin or owner can create tenders" 
ON public.tenders 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin or owner can update tenders" 
ON public.tenders 
FOR UPDATE 
USING (
  (auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR user_id IS NULL
);

CREATE POLICY "Admin or owner can delete tenders" 
ON public.tenders 
FOR DELETE 
USING (
  (auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR user_id IS NULL
);