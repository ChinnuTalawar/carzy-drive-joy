import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BackButton from "@/components/BackButton";
import {
  ArrowLeft,
  Star,
  Users,
  Fuel,
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Shield,
  Car as CarIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";
import { fetchCarDetails, CarWithOwnerInfo } from "@/lib/carService";
import { supabase } from "@/integrations/supabase/client";

const CarDetails = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [car, setCar] = useState<CarWithOwnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const fetchCarDetailsData = async () => {
      if (!carId) {
        navigate("/cars");
        return;
      }

      try {
        const carData = await fetchCarDetails(carId);
        setCar(carData);
      } catch (error) {
        console.error("Error fetching car details:", error);
        toast({
          title: "Error",
          description: "Failed to load car details",
          variant: "destructive",
        });
        navigate("/cars");
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetailsData();
  }, [carId, navigate, toast]);

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book this car",
        variant: "destructive",
      });
      return;
    }
    setBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-48"></div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-96 bg-muted rounded-xl"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 p-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Car not found</h1>
            <Button onClick={() => navigate("/cars")}>Back to Cars</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Car Image */}
            <div className="space-y-4">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-96 object-cover rounded-xl shadow-strong"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Car Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="gradient-primary text-primary-foreground">
                    {car.category}
                  </Badge>
                  {car.available && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      Available
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                  {car.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {car.brand} {car.model} • {car.year}
                </p>
                <div className="flex items-center space-x-1 mb-4">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{car.rating}</span>
                  <span className="text-muted-foreground">(4.5)</span>
                </div>
              </div>

              {/* Price */}
              <div className="gradient-card p-6 rounded-xl border border-border">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                    ₹{car.price_per_day.toLocaleString()}
                  </span>
                  <span className="text-lg text-muted-foreground">per day</span>
                </div>
              </div>

              {/* Car Features */}
              <Card className="gradient-card border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Car Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">{car.passengers} Passengers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-4 w-4 text-primary" />
                      <span className="text-sm">{car.fuel_type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-primary" />
                      <span className="text-sm">{car.transmission}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{car.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Book Now Button */}
              <Button
                onClick={handleBookNow}
                disabled={!car.available}
                className="w-full gradient-primary hover:shadow-glow hover:scale-105 text-lg py-6"
              >
                <CarIcon className="h-5 w-5 mr-2" />
                {car.available ? "Book Now" : "Not Available"}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="gradient-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {car.description}
                  </p>
                </CardContent>
              </Card>

              {/* Additional Features */}
              {car.features && car.features.length > 0 && (
                <Card className="gradient-card border-border">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Additional Features</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Owner Details */}
            <Card className="gradient-card border-border h-fit">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {car.owner_name ? "Owner Details" : "Contact Information"}
                </h3>
                <div className="space-y-4">
                  {car.owner_name ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 gradient-primary">
                          <AvatarFallback className="text-primary-foreground font-semibold">
                            {car.owner_name?.charAt(0) || "O"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{car.owner_name}</p>
                          <p className="text-sm text-muted-foreground">Car Owner</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        {car.owner_phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-sm">{car.owner_phone}</span>
                          </div>
                        )}
                        {car.owner_email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm">{car.owner_email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm">{car.location}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center mb-3">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Owner contact information is private and only shared with confirmed bookings.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm">{car.location}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {bookingModal && (
        <BookingModal
          car={car}
          isOpen={bookingModal}
          onClose={() => setBookingModal(false)}
        />
      )}
    </div>
  );
};

export default CarDetails;