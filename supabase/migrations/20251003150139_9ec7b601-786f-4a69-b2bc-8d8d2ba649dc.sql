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

-- Enable RLS on user_roles
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

-- Create vehicle_hiring_details table
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
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed')),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vehicle_hiring_details ENABLE ROW LEVEL SECURITY;

-- Create booking_register table
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
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.booking_register ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

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
CREATE POLICY "Authenticated users can view all vehicle hiring details"
ON public.vehicle_hiring_details FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create vehicle hiring details"
ON public.vehicle_hiring_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update vehicle hiring details"
ON public.vehicle_hiring_details FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicle hiring details"
ON public.vehicle_hiring_details FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for booking_register
CREATE POLICY "Authenticated users can view all bookings"
ON public.booking_register FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create bookings"
ON public.booking_register FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update bookings"
ON public.booking_register FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
ON public.booking_register FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_vehicle_hiring_details_updated_at
BEFORE UPDATE ON public.vehicle_hiring_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_register_updated_at
BEFORE UPDATE ON public.booking_register
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();