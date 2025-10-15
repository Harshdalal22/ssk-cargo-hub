-- Create customer details table
CREATE TABLE public.customer_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  company_name TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vehicle fleet table
CREATE TABLE public.vehicle_fleet (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id TEXT NOT NULL UNIQUE,
  lorry_number TEXT NOT NULL UNIQUE,
  lorry_type TEXT NOT NULL,
  capacity_tons NUMERIC,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  registration_date DATE,
  insurance_expiry DATE,
  fitness_expiry DATE,
  status TEXT DEFAULT 'Available',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create driver information table
CREATE TABLE public.driver_information (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  experience_years NUMERIC,
  current_vehicle TEXT,
  status TEXT DEFAULT 'Available',
  address TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_details
CREATE POLICY "Admins can view all customers"
ON public.customer_details FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own customers"
ON public.customer_details FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create customers"
ON public.customer_details FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update customers"
ON public.customer_details FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customers"
ON public.customer_details FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for vehicle_fleet
CREATE POLICY "Admins can view all vehicles"
ON public.vehicle_fleet FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own vehicles"
ON public.vehicle_fleet FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create vehicles"
ON public.vehicle_fleet FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update vehicles"
ON public.vehicle_fleet FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete vehicles"
ON public.vehicle_fleet FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for driver_information
CREATE POLICY "Admins can view all drivers"
ON public.driver_information FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own drivers"
ON public.driver_information FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create drivers"
ON public.driver_information FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update drivers"
ON public.driver_information FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete drivers"
ON public.driver_information FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_customer_details_updated_at
BEFORE UPDATE ON public.customer_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_fleet_updated_at
BEFORE UPDATE ON public.vehicle_fleet
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_information_updated_at
BEFORE UPDATE ON public.driver_information
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate booking ID
CREATE OR REPLACE FUNCTION public.generate_booking_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  max_num INTEGER;
BEGIN
  -- Get the maximum booking number from both tables
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_id FROM 'BK(\d+)') AS INTEGER)), 0)
  INTO max_num
  FROM (
    SELECT booking_id FROM public.booking_register
    UNION ALL
    SELECT booking_id FROM public.vehicle_hiring_details
  ) combined;
  
  -- Generate new ID
  new_id := 'BK' || LPAD((max_num + 1)::TEXT, 6, '0');
  
  RETURN new_id;
END;
$$;