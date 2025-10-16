-- Create settings table for tax rate and other system settings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_rate numeric NOT NULL DEFAULT 7,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view settings
CREATE POLICY "Anyone can view settings"
  ON public.settings
  FOR SELECT
  USING (true);

-- Allow authenticated users to update settings
CREATE POLICY "Authenticated users can update settings"
  ON public.settings
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert settings
CREATE POLICY "Authenticated users can insert settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default settings (will create one row)
INSERT INTO public.settings (tax_rate)
VALUES (7);

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();