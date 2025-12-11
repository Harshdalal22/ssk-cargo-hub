-- Enable REPLICA IDENTITY FULL for real-time updates on UPDATE events
ALTER TABLE public.vehicle_hiring_details REPLICA IDENTITY FULL;
ALTER TABLE public.booking_register REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_hiring_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_register;