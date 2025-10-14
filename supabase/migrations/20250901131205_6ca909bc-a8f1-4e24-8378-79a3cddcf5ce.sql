-- Create table to track OTP usage per day
CREATE TABLE public.otp_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, date)
);

-- Enable RLS
ALTER TABLE public.otp_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP usage tracking
CREATE POLICY "Users can view their own OTP usage" 
ON public.otp_usage 
FOR SELECT 
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can insert OTP usage" 
ON public.otp_usage 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update OTP usage" 
ON public.otp_usage 
FOR UPDATE 
USING (true);

-- Create function to check and increment OTP usage
CREATE OR REPLACE FUNCTION public.check_and_increment_otp_usage(user_email_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current day's usage
  SELECT count INTO current_count
  FROM public.otp_usage
  WHERE user_email = user_email_param 
  AND date = CURRENT_DATE;
  
  -- If no record exists, create one
  IF current_count IS NULL THEN
    INSERT INTO public.otp_usage (user_email, date, count)
    VALUES (user_email_param, CURRENT_DATE, 1);
    RETURN true;
  END IF;
  
  -- If already at limit, return false
  IF current_count >= 5 THEN
    RETURN false;
  END IF;
  
  -- Increment count
  UPDATE public.otp_usage
  SET count = count + 1, updated_at = now()
  WHERE user_email = user_email_param 
  AND date = CURRENT_DATE;
  
  RETURN true;
END;
$$;

-- Add mobile number to profiles table
ALTER TABLE public.profiles ADD COLUMN mobile_number TEXT;

-- Create unique constraint to prevent duplicate emails and mobile numbers
CREATE UNIQUE INDEX unique_email_idx ON public.profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX unique_mobile_idx ON public.profiles(mobile_number) WHERE mobile_number IS NOT NULL;