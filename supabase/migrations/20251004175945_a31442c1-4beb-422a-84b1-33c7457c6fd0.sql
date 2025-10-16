-- Create enum for tender status
CREATE TYPE tender_status AS ENUM ('draft', 'submitted', 'review', 'won', 'lost', 'cancelled');

-- Create tenders table
CREATE TABLE public.tenders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  customer TEXT NOT NULL,
  amount NUMERIC(15, 2),
  link TEXT,
  submission_date DATE,
  deadline DATE,
  status tender_status NOT NULL DEFAULT 'draft',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tenders" 
  ON public.tenders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tenders" 
  ON public.tenders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenders" 
  ON public.tenders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tenders" 
  ON public.tenders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tenders_updated_at
  BEFORE UPDATE ON public.tenders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tenders_user_id ON public.tenders(user_id);
CREATE INDEX idx_tenders_status ON public.tenders(status);
CREATE INDEX idx_tenders_deadline ON public.tenders(deadline);