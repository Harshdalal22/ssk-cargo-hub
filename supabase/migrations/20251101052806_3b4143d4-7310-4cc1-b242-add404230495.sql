-- Add missing columns to vehicle_hiring_details
ALTER TABLE public.vehicle_hiring_details 
ADD COLUMN IF NOT EXISTS pod_received_status TEXT NOT NULL DEFAULT 'Not Received',
ADD COLUMN IF NOT EXISTS pod_received_date DATE;

-- Add missing columns to booking_register
ALTER TABLE public.booking_register 
ADD COLUMN IF NOT EXISTS pod_received_status TEXT NOT NULL DEFAULT 'Not Received',
ADD COLUMN IF NOT EXISTS pod_received_date DATE;

-- Create advance_payments table for tracking multiple payments
CREATE TABLE IF NOT EXISTS public.advance_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_type TEXT NOT NULL CHECK (record_type IN ('booking', 'vehicle_hiring')),
  record_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on advance_payments
ALTER TABLE public.advance_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for advance_payments
CREATE POLICY "Users can view own payments" 
ON public.advance_payments 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all payments" 
ON public.advance_payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create payments" 
ON public.advance_payments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update payments" 
ON public.advance_payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payments" 
ON public.advance_payments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_advance_payments_updated_at
BEFORE UPDATE ON public.advance_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();