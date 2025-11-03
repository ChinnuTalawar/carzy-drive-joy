import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Fuel, Settings, Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import { fetchPublicCars } from "@/lib/carService";
import carCompactImage from "@/assets/car-compact.jpg";
import carLuxuryImage from "@/assets/car-luxury.jpg";
import carSuvImage from "@/assets/car-suv.jpg";
import carSportsImage from "@/assets/car-sports.jpg";

const Cars = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await fetchPublicCars({ available: true });
        setCars(data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const staticCars = [
    {
      id: 1,
      name: "Compact Hatchback",
      price: "$25",
      image: carCompactImage,
      rating: 4.8,
      passengers: 4,
      fuel: "Petrol",
      transmission: "Manual",
      category: "Economy",
      availability: "Available",
      location: "Downtown",
      description: "Perfect for city driving with excellent fuel efficiency and easy parking.",
      features: ["Air Conditioning", "Bluetooth", "USB Charging", "GPS Navigation"],
      specifications: {
        engine: "1.2L 4-Cylinder",
        mileage: "22 km/l",
        year: "2023",
        color: "Silver"
      }
    },
    {
      id: 2,
      name: "Luxury Sedan",
      price: "$75",
      image: carLuxuryImage,
      rating: 4.9,
      passengers: 5,
      fuel: "Hybrid",
      transmission: "Automatic",
      category: "Luxury",
      availability: "Available",
      location: "Airport",
      description: "Premium comfort with advanced features for executive travel.",
      features: ["Leather Seats", "Sunroof", "Premium Sound", "Heated Seats", "Wireless Charging"],
      specifications: {
        engine: "2.0L Hybrid",
        mileage: "18 km/l",
        year: "2024",
        color: "Black"
      }
    },
    {
      id: 3,
      name: "Family SUV",
      price: "$55",
      image: carSuvImage,
      rating: 4.7,
      passengers: 7,
      fuel: "Petrol",
      transmission: "Automatic",
      category: "SUV",
      availability: "Available",
      location: "City Center",
      description: "Spacious and comfortable for family trips and adventures.",
      features: ["3rd Row Seating", "Roof Rails", "Rear Camera", "Cruise Control"],
      specifications: {
        engine: "2.5L V6",
        mileage: "14 km/l",
        year: "2023",
        color: "White"
      }
    },
    {
      id: 4,
      name: "Sports Convertible",
      price: "$95",
      image: carSportsImage,
      rating: 4.9,
      passengers: 2,
      fuel: "Petrol",
      transmission: "Manual",
      category: "Sports",
      availability: "Limited",
      location: "Marina",
      description: "High-performance sports car for thrilling driving experiences.",
      features: ["Convertible Roof", "Sport Suspension", "Racing Seats", "Performance Tires"],
      specifications: {
        engine: "3.0L Turbo V6",
        mileage: "10 km/l",
        year: "2024",
        color: "Red"
      }
    },
    {
      id: 5,
      name: "Electric Hatchback",
      price: "$45",
      image: carCompactImage,
      rating: 4.6,
      passengers: 4,
      fuel: "Electric",
      transmission: "Automatic",
      category: "Electric",
      availability: "Available",
      location: "Tech District",
      description: "Eco-friendly electric vehicle with modern technology.",
      features: ["Fast Charging", "Digital Dashboard", "Regenerative Braking", "App Connectivity"],
      specifications: {
        engine: "Electric Motor",
        mileage: "150 km/charge",
        year: "2024",
        color: "Blue"
      }
    },
    {
      id: 6,
      name: "Premium Crossover",
      price: "$65",
      image: carSuvImage,
      rating: 4.8,
      passengers: 5,
      fuel: "Hybrid",
      transmission: "Automatic",
      category: "Crossover",
      availability: "Available",
      location: "Business District",
      description: "Perfect blend of luxury and utility for modern lifestyle.",
      features: ["Panoramic Sunroof", "Ambient Lighting", "Wireless Charging", "360° Camera"],
      specifications: {
        engine: "2.0L Hybrid",
        mileage: "16 km/l",
        year: "2024",
        color: "Grey"
      }
    }
  ];

  const categories = ["all", "Economy", "Luxury", "SUV", "Sports", "Electric", "Crossover"];

  const allCars = cars.length > 0 ? cars : staticCars;
  const filteredCars = selectedCategory === "all" 
    ? allCars 
    : allCars.filter(car => car.category === selectedCategory);

  const handleRentNow = (car: any) => {
    navigate(`/car/${car.id}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
            Our Fleet
          </h1>

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize gradient-card border-border ${selectedCategory === category ? 'text-black dark:text-white' : ''}`}
                >
                  {category === "all" ? "All Cars" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Cars Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <Card 
              key={car.id} 
              className="group hover:shadow-strong transition-smooth hover:-translate-y-2 border-0 shadow-soft gradient-card overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Car Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-smooth"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="gradient-secondary text-secondary-foreground">
                      {car.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      <span className="text-xs font-medium">{car.rating}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge 
                      variant={car.availability === "Available" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {car.availability}
                    </Badge>
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{car.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">₹{car.price_per_day || car.price}</div>
                        <div className="text-xs text-muted-foreground">per day</div>
                      </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {car.description}
                  </p>

                  {/* Quick Features */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{car.passengers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Fuel className="h-3 w-3" />
                      <span>{car.fuel_type || car.fuel}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Settings className="h-3 w-3" />
                      <span>{car.transmission}</span>
                    </div>
                  </div>

                  {/* Location & Year */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{car.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{car.year || car.specifications?.year}</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  {car.features && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {car.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {car.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{car.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {car.specifications && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Specifications:</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Engine:</span>
                          <span>{car.specifications.engine}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mileage:</span>
                          <span>{car.specifications.mileage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Color:</span>
                          <span>{car.specifications.color}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    variant="default" 
                    className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                    onClick={() => handleRentNow(car)}
                    disabled={!car.available && car.availability !== "Available"}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {(car.available !== false && car.availability !== "Limited") ? "Book Now" : "Not Available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cars found in this category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cars;