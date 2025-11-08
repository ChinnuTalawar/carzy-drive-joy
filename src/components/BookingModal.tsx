// ============================================
// IMPORTS
// ============================================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn, formatIndianDate } from "@/lib/utils";
import {
  CalendarIcon,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Car as CarIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

// ============================================
// VALIDATION SCHEMA
// ============================================
const bookingDetailsSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  phone: z.string().trim().min(10, { message: "Phone number must be at least 10 digits" }).max(15, { message: "Phone number must be less than 15 digits" }).regex(/^[0-9+\-\s()]+$/, { message: "Invalid phone number format" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  drivingLicense: z.string().trim().min(5, { message: "Driving license number is required" }).max(50, { message: "License number must be less than 50 characters" }),
  address: z.string().trim().max(500, { message: "Address must be less than 500 characters" }).optional(),
  emergencyContact: z.string().trim().max(15, { message: "Emergency contact must be less than 15 digits" }).regex(/^[0-9+\-\s()]*$/, { message: "Invalid phone number format" }).optional(),
  specialRequests: z.string().trim().max(500, { message: "Special requests must be less than 500 characters" }).optional()
});

// ============================================
// TYPES
// ============================================
interface BookingModalProps {
  car: any;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ car, isOpen, onClose }: BookingModalProps) => {
  // ============================================
  // STATE
  // ============================================
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: User Details, 2: Booking Details, 3: Payment
  const [loading, setLoading] = useState(false);
  
  // Booking Dates
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // User Form Data
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    drivingLicense: "",
    emergencyContact: "",
    specialRequests: "",
  });

  // ============================================
  // HELPERS
  // ============================================
  const calculateTotalAmount = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * car.price_per_day;
  };

  const handleInputChange = (field: string, value: string) => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  };

  // ============================================
  // NAVIGATION BETWEEN STEPS
  // ============================================
  const handleNext = () => {
    if (step === 1) {
      // Validate user details with zod schema
      const validation = bookingDetailsSchema.safeParse(userDetails);
      
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate booking details
      if (!startDate || !endDate) {
        toast({
          title: "Missing Dates",
          description: "Please select start and end dates",
          variant: "destructive",
        });
        return;
      }
      if (startDate >= endDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  // ============================================
  // SUBMIT BOOKING
  // ============================================
  const handleBooking = async () => {
    setLoading(true);
    try {
      // Final validation before submission
      const validation = bookingDetailsSchema.safeParse(userDetails);
      
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please login to continue",
          variant: "destructive",
        });
        return;
      }

      const bookingData = {
        user_id: user.id,
        car_id: car.id,
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        total_amount: calculateTotalAmount(),
        status: 'confirmed',
        user_details: validation.data, // Use validated data
      };

      const { error } = await supabase
        .from("bookings")
        .insert([bookingData]);

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your car has been successfully booked",
      });
      
      onClose();
      
      // Open payment in new tab (simulate Indian payment gateway)
      const paymentUrl = `https://payments.example.com/pay?amount=${calculateTotalAmount()}&currency=INR&booking=${Date.now()}`;
      window.open(paymentUrl, '_blank');
      
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER STEP CONTENT
  // ============================================
  const renderStepContent = () => {
    switch (step) {
      // ========== STEP 1: User Details ==========
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={userDetails.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={userDetails.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={userDetails.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drivingLicense">Driving License *</Label>
                <Input
                  id="drivingLicense"
                  placeholder="Enter your license number"
                  value={userDetails.drivingLicense}
                  onChange={(e) => handleInputChange("drivingLicense", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your address"
                  value={userDetails.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Emergency contact number"
                  value={userDetails.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Input
                  id="specialRequests"
                  placeholder="Any special requests"
                  value={userDetails.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  className="gradient-card border-border"
                />
              </div>
            </div>
          </div>
        );

      // ========== STEP 2: Booking Dates ==========
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Booking Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal gradient-card border-border",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatIndianDate(startDate) : <span>Pick start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal gradient-card border-border",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatIndianDate(endDate) : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < new Date() || (startDate && date <= startDate)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Booking Summary */}
            {startDate && endDate && (
              <Card className="gradient-card border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Car:</span>
                      <span>{car.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per day:</span>
                      <span>₹{car.price_per_day.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span className="gradient-primary bg-clip-text text-transparent">
                        ₹{calculateTotalAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      // ========== STEP 3: Payment & Confirmation ==========
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment & Confirmation</h3>
            
            {/* Payment Options */}
            <Card className="gradient-card border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Indian Payment Options</h4>
                <div className="space-y-3">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    UPI (Google Pay, PhonePe, Paytm)
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                    Net Banking
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    Credit/Debit Cards
                  </Badge>
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                    Wallets (Paytm, Amazon Pay)
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Booking Confirmation Details */}
            <Card className="gradient-card border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Booking Confirmation</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm">{userDetails.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{userDetails.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{userDetails.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CarIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{car.name}</span>
                  </div>
                  {startDate && endDate && (
                    <>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {formatIndianDate(startDate)} - {formatIndianDate(endDate)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">
                          Total: ₹{calculateTotalAmount().toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Book {car.name}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                stepNum === step
                  ? "gradient-primary text-primary-foreground"
                  : stepNum < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {stepNum}
            </div>
          ))}
        </div>

        {renderStepContent()}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="gradient-card border-border"
          >
            {step > 1 ? "Previous" : "Cancel"}
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext} className="gradient-primary">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleBooking}
              disabled={loading}
              className="gradient-primary"
            >
              {loading ? "Booking..." : "Confirm & Pay"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;