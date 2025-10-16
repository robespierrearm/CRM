-- Создание таблиц suppliers и expenses для CRM

-- ========== SUPPLIERS TABLE ==========
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  inn TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);

-- RLS для suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Политики для suppliers
CREATE POLICY "Users can view their own suppliers"
  ON public.suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
  ON public.suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON public.suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON public.suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- ========== EXPENSES TABLE ==========
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  category TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для expenses
CREATE INDEX IF NOT EXISTS idx_expenses_tender_id ON public.expenses(tender_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);

-- RLS для expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Политики для expenses (доступ через связь с tenders)
CREATE POLICY "Users can view expenses for their tenders"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenders
      WHERE tenders.id = expenses.tender_id
      AND tenders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses for their tenders"
  ON public.expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenders
      WHERE tenders.id = expenses.tender_id
      AND tenders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses for their tenders"
  ON public.expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenders
      WHERE tenders.id = expenses.tender_id
      AND tenders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses for their tenders"
  ON public.expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenders
      WHERE tenders.id = expenses.tender_id
      AND tenders.user_id = auth.uid()
    )
  );

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для suppliers
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE public.suppliers IS 'Поставщики для тендеров';
COMMENT ON TABLE public.expenses IS 'Расходы по тендерам';
