import { supabase } from "@/integrations/supabase/client";

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  image: string;
  rating: number;
  passengers: number;
  fuel_type: string;
  transmission: string;
  category: string;
  available: boolean;
  location: string;
  description: string;
  features: string[];
  owner_id: string;
}

export interface CarWithOwnerInfo extends Car {
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
}

export const fetchCarDetails = async (carId: string): Promise<CarWithOwnerInfo | null> => {
  try {
    // Get the basic car information (publicly available)
    const { data: carData, error: carError } = await supabase
      .from("cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (carError) throw carError;
    if (!carData) return null;

    // Check if user is authenticated and has permission to see owner info
    const { data: { user } } = await supabase.auth.getUser();
    
    let ownerInfo = {};
    
    if (user) {
      // Check if user is the car owner, admin, or has a booking for this car
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .maybeSingle();

      const isAdmin = profile?.user_type === 'admin';
      const isOwner = carData.owner_id === user.id;
      
      // Check if user has a booking for this car
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("car_id", carId)
        .eq("user_id", user.id)
        .limit(1);
      
      const hasBooking = booking && booking.length > 0;

      // If user is authorized, try to fetch owner contact info from the new table
      if (isAdmin || isOwner || hasBooking) {
        try {
          // Temporary type casting until Supabase types are updated
          const { data: ownerData } = await (supabase as any)
            .from('car_owners')
            .select('owner_name, owner_phone, owner_email')
            .eq('car_id', carId)
            .maybeSingle();
          
          if (ownerData) {
            ownerInfo = {
              owner_name: ownerData.owner_name,
              owner_phone: ownerData.owner_phone,
              owner_email: ownerData.owner_email
            };
          }
        } catch (error) {
          // If query fails, owner info stays empty (privacy protected)
          console.log("Owner info not available - privacy protected");
        }
      }
    }

    return {
      ...carData,
      ...ownerInfo
    };
  } catch (error) {
    console.error("Error fetching car details:", error);
    throw error;
  }
};

export const fetchPublicCars = async (filters?: { category?: string; available?: boolean }) => {
  try {
    let query = supabase.from("cars").select("*");
    
    if (filters?.available !== undefined) {
      query = query.eq("available", filters.available);
    }
    
    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};