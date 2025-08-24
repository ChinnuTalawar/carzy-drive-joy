import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Fuel, Settings } from "lucide-react";
import carCompactImage from "@/assets/car-compact.jpg";
import carLuxuryImage from "@/assets/car-luxury.jpg";
import carSuvImage from "@/assets/car-suv.jpg";
import carSportsImage from "@/assets/car-sports.jpg";

const CarsShowcase = () => {
  const cars = [
    {
      id: 1,
      name: "Compact Hatchback",
      price: "$25",
      image: carCompactImage,
      rating: 4.8,
      passengers: 4,
      fuel: "Petrol",
      transmission: "Manual",
      category: "Economy"
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
      category: "Luxury"
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
      category: "SUV"
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
      category: "Sports"
    }
  ];

  return (
    <section id="cars" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Perfect{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Ride
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From budget-friendly options to luxury vehicles, find the perfect car for your journey
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car) => (
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
                  />
                  <div className="absolute top-3 left-3">
                    <span className="gradient-secondary px-3 py-1 rounded-full text-xs font-semibold text-secondary-foreground">
                      {car.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      <span className="text-xs font-medium">{car.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{car.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{car.price}</div>
                      <div className="text-xs text-muted-foreground">per day</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-2 mb-6 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{car.passengers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Fuel className="h-3 w-3" />
                      <span>{car.fuel}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Settings className="h-3 w-3" />
                      <span>{car.transmission}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button variant="default" className="w-full">
                    Rent Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Cars Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CarsShowcase;