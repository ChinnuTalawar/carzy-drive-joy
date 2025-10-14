-- Step 1: Create app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'car-owner', 'user');

-- Step 2: Create user_roles table with proper RBAC structure
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

-- Step 4: Migrate existing user_type data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE 
    WHEN user_type = 'admin' THEN 'admin'::public.app_role
    WHEN user_type = 'car-owner' THEN 'car-owner'::public.app_role
    ELSE 'user'::public.app_role
  END as role
FROM public.profiles
WHERE user_type IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Create car_owners table for protected PII
CREATE TABLE public.car_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL UNIQUE REFERENCES public.cars(id) ON DELETE CASCADE,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on car_owners
ALTER TABLE public.car_owners ENABLE ROW LEVEL SECURITY;

-- Step 6: Migrate existing owner data from cars to car_owners
INSERT INTO public.car_owners (car_id, owner_name, owner_phone, owner_email)
SELECT id, owner_name, owner_phone, owner_email
FROM public.cars
WHERE owner_name IS NOT NULL OR owner_phone IS NOT NULL OR owner_email IS NOT NULL;

-- Step 7: Drop PII columns from cars table
ALTER TABLE public.cars DROP COLUMN IF EXISTS owner_name;
ALTER TABLE public.cars DROP COLUMN IF EXISTS owner_phone;
ALTER TABLE public.cars DROP COLUMN IF EXISTS owner_email;

-- Step 8: Drop user_type column from profiles (data already migrated)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;

-- Step 9: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 10: Create RLS policies for car_owners table
-- Owner contact info only visible to: car owner, users with bookings, and admins
CREATE POLICY "Car owners can view their own contact info"
ON public.car_owners
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cars
    WHERE cars.id = car_owners.car_id
      AND cars.owner_id = auth.uid()
  )
);

CREATE POLICY "Users with bookings can view owner contact info"
ON public.car_owners
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.car_id = car_owners.car_id
      AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all owner contact info"
ON public.car_owners
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Car owners can insert their own contact info"
ON public.car_owners
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cars
    WHERE cars.id = car_owners.car_id
      AND cars.owner_id = auth.uid()
  )
);

CREATE POLICY "Car owners can update their own contact info"
ON public.car_owners
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.cars
    WHERE cars.id = car_owners.car_id
      AND cars.owner_id = auth.uid()
  )
);

-- Step 11: Update bookings RLS policies to use new role system
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Car owners can view bookings for their cars"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cars
    WHERE cars.id = bookings.car_id
      AND cars.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id);

-- Step 12: Add trigger for car_owners updated_at
CREATE TRIGGER update_car_owners_updated_at
BEFORE UPDATE ON public.car_owners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();