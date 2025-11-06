import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import BackButton from "@/components/BackButton";
import { Car, Upload, Plus, User, Phone, Mail } from "lucide-react";

const carSchema = z.object({
  name: z.string().min(1, "Car name is required").max(100, "Name too long"),
  brand: z.string().min(1, "Brand is required").max(50, "Brand name too long"),
  model: z.string().min(1, "Model is required").max(50, "Model name too long"),
  year: z.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  price_per_day: z.number().min(1, "Price must be at least ₹1"),
  passengers: z.number().min(1, "Must have at least 1 passenger").max(20, "Maximum 20 passengers"),
  fuel_type: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission type is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required").max(200, "Location too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  image: z.string().url("Must be a valid image URL"),
  features: z.array(z.string()).min(1, "Select at least one feature"),
  owner_name: z.string().min(1, "Your name is required").max(100, "Name too long"),
  owner_phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone number too long"),
  owner_email: z.string().email("Invalid email address").max(255, "Email too long"),
});

type CarFormData = z.infer<typeof carSchema>;

const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const TRANSMISSION_TYPES = ["Manual", "Automatic", "Semi-Automatic"];
const CATEGORIES = ["Compact", "SUV", "Luxury", "Sports", "Van", "Sedan"];
const AVAILABLE_FEATURES = [
  "Air Conditioning",
  "GPS Navigation",
  "Bluetooth",
  "Backup Camera",
  "Parking Sensors",
  "Sunroof",
  "Leather Seats",
  "Heated Seats",
  "USB Ports",
  "Apple CarPlay",
  "Android Auto",
  "Cruise Control",
];

const AddCar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      features: [],
      year: new Date().getFullYear(),
    },
  });

  const toggleFeature = (feature: string) => {
    const updated = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(updated);
    setValue("features", updated);
  };

  const onSubmit = async (data: CarFormData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add a car",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Insert car details
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .insert({
          name: data.name,
          brand: data.brand,
          model: data.model,
          year: data.year,
          price_per_day: data.price_per_day,
          passengers: data.passengers,
          fuel_type: data.fuel_type,
          transmission: data.transmission,
          category: data.category,
          location: data.location,
          description: data.description,
          image: data.image,
          features: data.features,
          owner_id: session.user.id,
          available: true,
        })
        .select()
        .single();

      if (carError) throw carError;

      // Insert owner contact information
      const { error: ownerError } = await supabase
        .from("car_owners")
        .insert({
          car_id: carData.id,
          owner_name: data.owner_name,
          owner_phone: data.owner_phone,
          owner_email: data.owner_email,
        });

      if (ownerError) throw ownerError;

      toast({
        title: "Success!",
        description: "Your car has been added successfully with contact details",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add car",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-card">
      <div className="container mx-auto px-4 py-8 pt-16 max-w-4xl">
        <BackButton />

        <div className="mt-4">
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Add New Car
          </h1>
          <p className="text-muted-foreground mb-8">
            List your car for rental and start earning
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Car Information
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your car
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Car Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Car Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Honda City VX"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Brand and Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Honda"
                      {...register("brand")}
                    />
                    {errors.brand && (
                      <p className="text-sm text-destructive">{errors.brand.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      placeholder="e.g., City"
                      {...register("model")}
                    />
                    {errors.model && (
                      <p className="text-sm text-destructive">{errors.model.message}</p>
                    )}
                  </div>
                </div>

                {/* Year and Passengers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      {...register("year", { valueAsNumber: true })}
                    />
                    {errors.year && (
                      <p className="text-sm text-destructive">{errors.year.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers">Passengers *</Label>
                    <Input
                      id="passengers"
                      type="number"
                      placeholder="5"
                      {...register("passengers", { valueAsNumber: true })}
                    />
                    {errors.passengers && (
                      <p className="text-sm text-destructive">{errors.passengers.message}</p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price_per_day">Price Per Day (₹) *</Label>
                  <Input
                    id="price_per_day"
                    type="number"
                    placeholder="2000"
                    {...register("price_per_day", { valueAsNumber: true })}
                  />
                  {errors.price_per_day && (
                    <p className="text-sm text-destructive">{errors.price_per_day.message}</p>
                  )}
                </div>

                {/* Fuel Type and Transmission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Fuel Type *</Label>
                    <Select onValueChange={(value) => setValue("fuel_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuel_type && (
                      <p className="text-sm text-destructive">{errors.fuel_type.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select onValueChange={(value) => setValue("transmission", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSMISSION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transmission && (
                      <p className="text-sm text-destructive">{errors.transmission.message}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      placeholder="https://example.com/car-image.jpg"
                      {...register("image")}
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Provide a direct URL to your car's image
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your car, its condition, and any special features..."
                    rows={4}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label>Features *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border rounded-lg">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <label
                          htmlFor={feature}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.features && (
                    <p className="text-sm text-destructive">{errors.features.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Contact Information */}
            <Card className="gradient-card border-border shadow-soft mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Contact Information
                </CardTitle>
                <CardDescription>
                  Customers will use this to contact you about bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Owner Name */}
                <div className="space-y-2">
                  <Label htmlFor="owner_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Your Name *
                  </Label>
                  <Input
                    id="owner_name"
                    placeholder="e.g., John Doe"
                    {...register("owner_name")}
                  />
                  {errors.owner_name && (
                    <p className="text-sm text-destructive">{errors.owner_name.message}</p>
                  )}
                </div>

                {/* Owner Phone */}
                <div className="space-y-2">
                  <Label htmlFor="owner_phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="owner_phone"
                    type="tel"
                    placeholder="e.g., +91 9876543210"
                    {...register("owner_phone")}
                  />
                  {errors.owner_phone && (
                    <p className="text-sm text-destructive">{errors.owner_phone.message}</p>
                  )}
                </div>

                {/* Owner Email */}
                <div className="space-y-2">
                  <Label htmlFor="owner_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="owner_email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    {...register("owner_email")}
                  />
                  {errors.owner_email && (
                    <p className="text-sm text-destructive">{errors.owner_email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-primary flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Adding Car...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Car
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
