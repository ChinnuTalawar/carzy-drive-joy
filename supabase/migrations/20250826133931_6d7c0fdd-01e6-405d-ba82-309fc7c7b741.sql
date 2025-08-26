-- Create admin user directly
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'fakebgmit1@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"c7","user_type":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create cars table for detailed car information
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price_per_day INTEGER NOT NULL, -- Price in INR per day
  image TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  passengers INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  location TEXT,
  description TEXT,
  features TEXT[], -- Array of car features
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Create policies for cars
CREATE POLICY "Anyone can view available cars" 
ON public.cars 
FOR SELECT 
USING (true);

CREATE POLICY "Car owners can insert their own cars" 
ON public.cars 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Car owners can update their own cars" 
ON public.cars 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount INTEGER NOT NULL, -- Total amount in INR
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  user_details JSONB, -- Store user booking details
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample cars data
INSERT INTO public.cars (name, brand, model, year, price_per_day, image, passengers, fuel_type, transmission, category, owner_name, owner_phone, owner_email, location, description, features) VALUES
('Swift Dzire', 'Maruti Suzuki', 'Dzire', 2023, 1500, '/src/assets/car-compact.jpg', 5, 'Petrol', 'Manual', 'Compact', 'Rajesh Kumar', '+91-9876543210', 'rajesh@example.com', 'Mumbai, Maharashtra', 'Fuel efficient compact car perfect for city driving', ARRAY['AC', 'Power Steering', 'Central Locking', 'Music System']),
('Fortuner', 'Toyota', 'Fortuner', 2023, 4500, '/src/assets/car-suv.jpg', 7, 'Diesel', 'Automatic', 'SUV', 'Priya Sharma', '+91-8765432109', 'priya@example.com', 'Delhi, NCR', 'Luxury SUV for family trips and adventures', ARRAY['4WD', 'Leather Seats', 'Sunroof', 'GPS Navigation', 'Parking Sensors']),
('BMW 3 Series', 'BMW', '3 Series', 2022, 6000, '/src/assets/car-luxury.jpg', 5, 'Petrol', 'Automatic', 'Luxury', 'Arjun Singh', '+91-7654321098', 'arjun@example.com', 'Bangalore, Karnataka', 'Premium luxury sedan with advanced features', ARRAY['Premium Audio', 'Sunroof', 'Leather Interior', 'Climate Control', 'Keyless Entry']),
('Lamborghini Huracan', 'Lamborghini', 'Huracan', 2023, 25000, '/src/assets/car-sports.jpg', 2, 'Petrol', 'Automatic', 'Sports', 'Vikash Gupta', '+91-6543210987', 'vikash@example.com', 'Pune, Maharashtra', 'Exotic sports car for special occasions', ARRAY['Carbon Fiber', 'Racing Seats', 'Launch Control', 'Track Mode', 'Premium Sound']);

-- Add trigger for updating timestamps
CREATE TRIGGER update_cars_updated_at
BEFORE UPDATE ON public.cars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();