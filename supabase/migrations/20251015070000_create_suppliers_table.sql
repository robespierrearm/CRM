-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers (all authenticated users can view, only admins can modify)
CREATE POLICY "Authenticated users can view suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create suppliers"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update suppliers"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete suppliers"
ON public.suppliers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_suppliers_name ON public.suppliers(name);

-- Create supplier_tenders junction table (many-to-many relationship)
CREATE TABLE public.supplier_tenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  is_winner BOOLEAN DEFAULT false,
  proposed_amount NUMERIC(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, tender_id)
);

-- Enable RLS for supplier_tenders
ALTER TABLE public.supplier_tenders ENABLE ROW LEVEL SECURITY;

-- Policies for supplier_tenders
CREATE POLICY "Users can view supplier_tenders for their tenders"
ON public.supplier_tenders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = supplier_tenders.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create supplier_tenders for their tenders"
ON public.supplier_tenders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = supplier_tenders.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update supplier_tenders for their tenders"
ON public.supplier_tenders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = supplier_tenders.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete supplier_tenders for their tenders"
ON public.supplier_tenders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tenders 
    WHERE tenders.id = supplier_tenders.tender_id 
    AND tenders.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Create indexes for supplier_tenders
CREATE INDEX idx_supplier_tenders_supplier_id ON public.supplier_tenders(supplier_id);
CREATE INDEX idx_supplier_tenders_tender_id ON public.supplier_tenders(tender_id);
CREATE INDEX idx_supplier_tenders_is_winner ON public.supplier_tenders(is_winner);
