-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.check_and_increment_otp_usage(user_email_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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