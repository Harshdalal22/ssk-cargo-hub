-- Remove the incorrect check constraint on owner_name
-- This field should accept any owner name, not just 'Self' or 'Third Party'
ALTER TABLE public.vehicle_hiring_details 
DROP CONSTRAINT IF EXISTS vehicle_hiring_details_owner_name_check;