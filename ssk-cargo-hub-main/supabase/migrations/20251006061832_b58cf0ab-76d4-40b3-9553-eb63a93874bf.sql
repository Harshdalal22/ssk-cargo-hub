-- Fix critical security issue: Restrict profiles table to owner-only viewing
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix critical security issue: Restrict vehicle hiring details to owner or admin
DROP POLICY IF EXISTS "Authenticated users can view all vehicle hiring details" ON public.vehicle_hiring_details;
DROP POLICY IF EXISTS "Users can view own vehicle records" ON public.vehicle_hiring_details;
DROP POLICY IF EXISTS "Admins can view all vehicle records" ON public.vehicle_hiring_details;

CREATE POLICY "Users can view own vehicle records"
ON public.vehicle_hiring_details
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all vehicle records"
ON public.vehicle_hiring_details
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix critical security issue: Restrict booking register to owner or admin
DROP POLICY IF EXISTS "Authenticated users can view all bookings" ON public.booking_register;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.booking_register;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.booking_register;

CREATE POLICY "Users can view own bookings"
ON public.booking_register
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all bookings"
ON public.booking_register
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));