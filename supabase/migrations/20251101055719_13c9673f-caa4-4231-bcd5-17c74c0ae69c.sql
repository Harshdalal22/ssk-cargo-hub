-- Drop the restrictive check constraint on booking_register.lorry_type
-- This constraint is preventing valid lorry type values from being inserted
ALTER TABLE public.booking_register 
DROP CONSTRAINT IF EXISTS booking_register_lorry_type_check;