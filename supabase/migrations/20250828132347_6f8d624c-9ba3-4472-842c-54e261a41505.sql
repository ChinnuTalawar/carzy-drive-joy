-- Create a separate table for car owner contact details (private)
CREATE TABLE public.car_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on car_owners table
ALTER TABLE public.car_owners ENABLE ROW LEVEL SECURITY;

-- Only car owners can see their own contact details
CREATE POLICY "Car owners can view their own contact details" 
ON public.car_owners 
FOR SELECT 
USING (auth.uid() = owner_id);

-- Car owners can insert their own contact details
CREATE POLICY "Car owners can insert their own contact details" 
ON public.car_owners 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Car owners can update their own contact details
CREATE POLICY "Car owners can update their own contact details" 
ON public.car_owners 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Admins can view all contact details (for customer support)
CREATE POLICY "Admins can view all contact details" 
ON public.car_owners 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  )
);

-- Migrate existing owner data to the new table
INSERT INTO public.car_owners (car_id, owner_id, owner_name, owner_phone, owner_email)
SELECT id, owner_id, owner_name, owner_phone, owner_email 
FROM public.cars 
WHERE owner_id IS NOT NULL;

-- Remove sensitive owner information from cars table
ALTER TABLE public.cars DROP COLUMN IF EXISTS owner_name;
ALTER TABLE public.cars DROP COLUMN IF EXISTS owner_phone;
ALTER TABLE public.cars DROP COLUMN IF EXISTS owner_email;

-- Create trigger for automatic timestamp updates on car_owners
CREATE TRIGGER update_car_owners_updated_at
  BEFORE UPDATE ON public.car_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for car details with owner info (for authenticated users only)
CREATE VIEW public.cars_with_owner_info AS
SELECT 
  c.*,
  co.owner_name,
  co.owner_phone,
  co.owner_email
FROM public.cars c
LEFT JOIN public.car_owners co ON c.id = co.car_id;

-- RLS policy for the view - only show owner info to car owners themselves or admins
ALTER VIEW public.cars_with_owner_info SET (security_barrier = true);
CREATE POLICY "Restricted car owner info access" 
ON public.cars_with_owner_info
FOR SELECT 
USING (
  -- Everyone can see car details, but owner info only if they own the car or are admin
  CASE 
    WHEN owner_id IS NULL THEN true
    WHEN auth.uid() = owner_id THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    ) THEN true
    ELSE false
  END
);