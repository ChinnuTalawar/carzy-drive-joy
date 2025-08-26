import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Car, Users, Fuel, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  price_per_day: number;
  image: string;
  passengers: number;
  fuel_type: string;
  transmission: string;
  category: string;
  available: boolean;
  rating: number;
  location: string;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const navigate = useNavigate();

  // Fetch all cars on component mount
  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("available", true);
      
      if (data && !error) {
        setAllCars(data);
        setSearchResults(data);
      }
    };

    if (isOpen) {
      fetchCars();
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults(allCars);
      return;
    }

    const filtered = allCars.filter((car) =>
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
  }, [searchQuery, allCars]);

  const handleCarSelect = (car: Car) => {
    navigate(`/car/${car.id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Search Cars
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by car name, brand, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 gradient-card border-border"
            />
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No cars found matching your search.
              </div>
            ) : (
              searchResults.map((car) => (
                <Card 
                  key={car.id} 
                  className="cursor-pointer gradient-card border-border hover:gradient-secondary transition-smooth"
                  onClick={() => handleCarSelect(car)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {car.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {car.brand} • {car.location}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span className="text-xs">{car.passengers}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Fuel className="h-4 w-4" />
                            <span className="text-xs">{car.fuel_type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Settings className="h-4 w-4" />
                            <span className="text-xs">{car.transmission}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                          ₹{car.price_per_day}
                        </p>
                        <p className="text-xs text-muted-foreground">per day</p>
                        <Badge variant="outline" className="mt-1">
                          {car.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;