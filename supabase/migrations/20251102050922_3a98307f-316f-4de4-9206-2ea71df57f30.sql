-- Create LR Details table for storing Lorry Receipts
CREATE TABLE IF NOT EXISTS public.lr_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lr_no TEXT NOT NULL UNIQUE,
  lr_type TEXT NOT NULL DEFAULT 'Original',
  truck_no TEXT NOT NULL,
  date DATE NOT NULL,
  from_place TEXT NOT NULL,
  to_place TEXT NOT NULL,
  
  -- Consignor details
  consignor_name TEXT NOT NULL,
  consignor_address TEXT,
  consignor_city TEXT,
  consignor_contact TEXT,
  consignor_pan TEXT,
  consignor_gst TEXT,
  
  -- Consignee details
  consignee_name TEXT NOT NULL,
  consignee_address TEXT,
  consignee_city TEXT,
  consignee_contact TEXT,
  consignee_pan TEXT,
  consignee_gst TEXT,
  
  -- Billing party details
  billing_party_name TEXT,
  billing_party_address TEXT,
  billing_party_city TEXT,
  billing_party_contact TEXT,
  billing_party_pan TEXT,
  billing_party_gst TEXT,
  
  -- Invoice and billing details
  invoice_no TEXT,
  invoice_amount NUMERIC,
  invoice_date DATE,
  po_no TEXT,
  po_date DATE,
  eway_bill_no TEXT,
  eway_bill_date DATE,
  eway_ex_date DATE,
  method_of_packing TEXT,
  address_of_delivery TEXT,
  charged_weight NUMERIC,
  lorry_type TEXT,
  billing_party TEXT,
  gst_paid_by TEXT,
  
  -- Agent and employee details
  agent TEXT,
  employee TEXT,
  truck_driver_no TEXT,
  
  -- Weight and freight details
  weight NUMERIC NOT NULL DEFAULT 0,
  freight NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC,
  rate_on TEXT,
  
  -- Item details (stored as JSONB array)
  items JSONB DEFAULT '[]'::jsonb,
  
  -- Remark
  remark TEXT,
  
  -- Design and branding
  design_template TEXT DEFAULT 'standard',
  company_logo_url TEXT,
  
  -- Sharing logs
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LR Permit table for road permit tracking
CREATE TABLE IF NOT EXISTS public.lr_permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lr_id UUID NOT NULL REFERENCES public.lr_details(id) ON DELETE CASCADE,
  lr_no TEXT NOT NULL,
  road_permit_receipt_date DATE,
  ack_rec_date DATE,
  status TEXT,
  attachment_url TEXT,
  remark TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lr_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lr_permits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lr_details
CREATE POLICY "Users can view own LRs"
ON public.lr_details FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all LRs"
ON public.lr_details FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create LRs"
ON public.lr_details FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update LRs"
ON public.lr_details FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete LRs"
ON public.lr_details FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for lr_permits
CREATE POLICY "Users can view own permits"
ON public.lr_permits FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all permits"
ON public.lr_permits FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create permits"
ON public.lr_permits FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update permits"
ON public.lr_permits FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete permits"
ON public.lr_permits FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate LR number
CREATE OR REPLACE FUNCTION public.generate_lr_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(lr_no FROM 'DEL/(\d+)') AS INTEGER)), 0)
  INTO max_num
  FROM public.lr_details;
  
  new_id := 'DEL/' || LPAD((max_num + 1)::TEXT, 4, '0');
  
  RETURN new_id;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_lr_details_updated_at
BEFORE UPDATE ON public.lr_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lr_permits_updated_at
BEFORE UPDATE ON public.lr_permits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();