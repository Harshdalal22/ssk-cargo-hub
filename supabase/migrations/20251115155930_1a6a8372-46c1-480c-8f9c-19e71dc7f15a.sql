-- Update the generate_lr_number function to use HR/ prefix
CREATE OR REPLACE FUNCTION public.generate_lr_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  new_id TEXT;
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(lr_no FROM 'HR/(\d+)') AS INTEGER)), 0)
  INTO max_num
  FROM public.lr_details;
  
  new_id := 'HR/' || LPAD((max_num + 1)::TEXT, 4, '0');
  
  RETURN new_id;
END;
$function$;