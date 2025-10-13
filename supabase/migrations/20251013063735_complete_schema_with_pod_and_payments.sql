-- Complete Schema Setup with POD and Payment Tracking
--
-- This migration creates the complete database schema including:
-- 1. User roles and profiles
-- 2. Vehicle hiring and booking tables with POD tracking
-- 3. Customer details, vehicle fleet, and driver information
-- 4. Multiple advance payments tracking
-- 5. All RLS policies for security

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create vehicle_hiring_details table with POD tracking
CREATE TABLE public.vehicle_hiring_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL,
    date DATE NOT NULL,
    gr_number TEXT NOT NULL,
    bill_number TEXT,
    lorry_number TEXT NOT NULL,
    driver_number TEXT,
    owner_name TEXT NOT NULL CHECK (owner_name IN ('Self', 'Third Party')),
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    freight DECIMAL(10, 2) NOT NULL DEFAULT 0,
    advance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    balance DECIMAL(10, 2) GENERATED ALWAYS AS (freight - advance) STORED,
    other_expenses DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_balance DECIMAL(10, 2) GENERATED ALWAYS AS ((freight - advance) + other_expenses) STORED,
    pod_status TEXT NOT NULL DEFAULT 'Pending' CHECK (pod_status IN ('Pending', 'Completed')),
    pod_received_status TEXT DEFAULT 'Not Received',
    pod_received_date DATE,
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed')),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vehicle_hiring_details ENABLE ROW LEVEL SECURITY;

-- Create booking_register table with POD tracking
CREATE TABLE public.booking_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL,
    party_name TEXT NOT NULL,
    date DATE NOT NULL,
    gr_number TEXT NOT NULL,
    bill_number TEXT,
    lorry_number TEXT NOT NULL,
    lorry_type TEXT NOT NULL CHECK (lorry_type IN ('Open', 'Closed')),
    weight DECIMAL(10, 2) NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    freight DECIMAL(10, 2) NOT NULL DEFAULT 0,
    advance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    balance DECIMAL(10, 2) GENERATED ALWAYS AS (freight - advance) STORED,
    other_expenses DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_balance DECIMAL(10, 2) GENERATED ALWAYS AS ((freight - advance) + other_expenses) STORED,
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed')),
    pod_received_status TEXT DEFAULT 'Not Received',
    pod_received_date DATE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.booking_register ENABLE ROW LEVEL SECURITY;

-- Create advance_payments table for multiple payments tracking
CREATE TABLE public.advance_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_type TEXT NOT NULL CHECK (record_type IN ('vehicle_hiring', 'booking')),
  record_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.advance_payments ENABLE ROW LEVEL SECURITY;

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

ALTER TABLE public.customer_details ENABLE ROW LEVEL SECURITY;

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

ALTER TABLE public.vehicle_fleet ENABLE ROW LEVEL SECURITY;

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

ALTER TABLE public.driver_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vehicle_hiring_details
CREATE POLICY "Users can view own vehicle records"
ON public.vehicle_hiring_details FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all vehicle records"
ON public.vehicle_hiring_details FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create vehicle hiring details"
ON public.vehicle_hiring_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update vehicle hiring details"
ON public.vehicle_hiring_details FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own vehicle records"
ON public.vehicle_hiring_details FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete vehicle hiring details"
ON public.vehicle_hiring_details FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for booking_register
CREATE POLICY "Users can view own bookings"
ON public.booking_register FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all bookings"
ON public.booking_register FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create bookings"
ON public.booking_register FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update bookings"
ON public.booking_register FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own bookings"
ON public.booking_register FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete bookings"
ON public.booking_register FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for advance_payments
CREATE POLICY "Admins can view all payments"
ON public.advance_payments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own payments"
ON public.advance_payments FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create payments"
ON public.advance_payments FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update payments"
ON public.advance_payments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own payments"
ON public.advance_payments FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete payments"
ON public.advance_payments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

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
CREATE TRIGGER update_vehicle_hiring_details_updated_at
BEFORE UPDATE ON public.vehicle_hiring_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_register_updated_at
BEFORE UPDATE ON public.booking_register
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advance_payments_updated_at
BEFORE UPDATE ON public.advance_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_details_updated_at
BEFORE UPDATE ON public.customer_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_fleet_updated_at
BEFORE UPDATE ON public.vehicle_fleet
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_information_updated_at
BEFORE UPDATE ON public.driver_information
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate booking ID
CREATE OR REPLACE FUNCTION public.generate_booking_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_id FROM 'BK(\d+)') AS INTEGER)), 0)
  INTO max_num
  FROM (
    SELECT booking_id FROM public.booking_register
    UNION ALL
    SELECT booking_id FROM public.vehicle_hiring_details
  ) combined;
  
  new_id := 'BK' || LPAD((max_num + 1)::TEXT, 6, '0');
  
  RETURN new_id;
END;
$$;

-- Create indexes for better query performance
CREATE INDEX idx_advance_payments_record ON public.advance_payments(record_type, record_id);
CREATE INDEX idx_advance_payments_created_by ON public.advance_payments(created_by);
CREATE INDEX idx_vehicle_hiring_booking_id ON public.vehicle_hiring_details(booking_id);
CREATE INDEX idx_booking_register_booking_id ON public.booking_register(booking_id);