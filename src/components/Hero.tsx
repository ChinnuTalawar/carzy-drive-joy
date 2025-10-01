import { Button } from "@/components/ui/button";
import { Star, Users, Car, Shield } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";

const Hero = () => {
  return (
    <section id="home" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 gradient-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="gradient-primary bg-clip-text text-transparent font-extrabold">
                  Drive Your Dream with CARzy
                </span>
              </h1>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-smooth shadow-glow"
                onClick={() => window.location.href = "/cars"}
              >
                Start Booking
              </Button>
            </div>

          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-glow">
              <img 
                src={heroImage} 
                alt="Premium car rental" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative space elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 gradient-secondary rounded-full opacity-30 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 gradient-primary rounded-full opacity-30 blur-xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 gradient-hero rounded-full opacity-10 blur-3xl"></div>
          </div>
        </div>
        
        {/* Stats moved to bottom */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Cars Available</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Star className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">4.9</div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;