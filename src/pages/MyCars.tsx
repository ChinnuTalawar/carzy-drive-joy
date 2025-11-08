import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Edit, TrendingUp } from "lucide-react";
import BackButton from "@/components/BackButton";

interface CarWithStats {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  image: string;
  category: string;
  available: boolean;
  location: string;
  total_bookings: number;
  revenue: number;
}

export default function MyCars() {
  const [cars, setCars] = useState<CarWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCars();
  }, []);

  const fetchMyCars = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to view your cars");
        navigate("/");
        return;
      }

      // Fetch cars owned by the user
      const { data: carsData, error: carsError } = await supabase
        .from("cars")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (carsError) throw carsError;

      // Fetch booking statistics for each car
      const carsWithStats = await Promise.all(
        (carsData || []).map(async (car) => {
          const { data: bookings } = await supabase
            .from("bookings")
            .select("total_amount")
            .eq("car_id", car.id);

          const total_bookings = bookings?.length || 0;
          const revenue = bookings?.reduce((sum, b) => sum + b.total_amount, 0) || 0;

          return {
            ...car,
            total_bookings,
            revenue,
          };
        })
      );

      setCars(carsWithStats);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to load your cars");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (carId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("cars")
        .update({ available: !currentStatus })
        .eq("id", carId);

      if (error) throw error;

      setCars(cars.map(car => 
        car.id === carId ? { ...car, available: !currentStatus } : car
      ));

      toast.success(`Car ${!currentStatus ? "listed" : "unlisted"} successfully`);
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update car availability");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-foreground mb-2">My Cars</h1>
          <p className="text-primary-foreground/80">Manage your car listings and view statistics</p>
        </div>

        {cars.length === 0 ? (
          <Card className="gradient-card shadow-medium">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't listed any cars yet</p>
              <Button onClick={() => navigate("/add-car")} variant="hero">
                Add Your First Car
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Card key={car.id} className="gradient-card shadow-soft hover:shadow-medium transition-all">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={`absolute top-4 right-4 ${
                        car.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {car.available ? "Available" : "Unlisted"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2">{car.name}</CardTitle>
                  <CardDescription className="mb-4">
                    {car.brand} {car.model} • {car.year}
                  </CardDescription>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price per day:</span>
                      <span className="font-semibold">${car.price_per_day}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{car.location}</span>
                    </div>

                    <div className="flex items-center gap-2 p-3 gradient-secondary rounded-lg">
                      <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-foreground/80">Bookings:</span>
                          <span className="font-semibold text-secondary-foreground">{car.total_bookings}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-secondary-foreground/80">Revenue:</span>
                          <span className="font-semibold text-secondary-foreground">${car.revenue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`available-${car.id}`}
                        checked={car.available}
                        onCheckedChange={() => toggleAvailability(car.id, car.available)}
                      />
                      <Label htmlFor={`available-${car.id}`} className="text-sm cursor-pointer">
                        {car.available ? "Listed" : "Unlisted"}
                      </Label>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/edit-car/${car.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}