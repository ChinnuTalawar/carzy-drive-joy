-- Add explicit policies to deny anonymous access to sensitive tables

-- Deny anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to car_owners table
CREATE POLICY "Deny anonymous access to car_owners"
ON public.car_owners
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to user_roles table
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR SELECT
TO anon
USING (false);