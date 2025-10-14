import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

import { 
  Car, 
  Users, 
  Shield, 
  Star, 
  Award, 
  Globe,
  Zap,
  Heart,
  Target,
  TrendingUp,
  CheckCircle
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Car,
      title: "Wide Vehicle Selection",
      description: "Choose from hundreds of well-maintained vehicles across all categories"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All vehicles are insured and undergo regular safety inspections"
    },
    {
      icon: Star,
      title: "Top-Rated Service",
      description: "4.9/5 customer rating with 24/7 premium support"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book your perfect car in under 2 minutes with our streamlined process"
    }
  ];

  const stats = [
    { icon: Car, value: "500+", label: "Vehicles Available" },
    { icon: Users, value: "10K+", label: "Happy Customers" },
    { icon: Globe, value: "50+", label: "Cities Covered" },
    { icon: Award, value: "99%", label: "Customer Satisfaction" }
  ];

  const milestones = [
    { year: "2020", title: "CARzy Founded", description: "Started with a vision to revolutionize car rentals in India" },
    { year: "2021", title: "100 Cars", description: "Reached our first major milestone with 100 vehicles" },
    { year: "2022", title: "10 Cities", description: "Expanded to 10 major cities across India" },
    { year: "2023", title: "Premium Service", description: "Launched our premium car rental service" },
    { year: "2024", title: "10K+ Customers", description: "Serving over 10,000 satisfied customers nationwide" }
  ];

  const reviews = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      comment: "Excellent service! The car was spotless and the booking process was incredibly smooth. Will definitely use CARzy again."
    },
    {
      name: "Rahul Verma",
      location: "Delhi",
      rating: 5,
      comment: "Best car rental experience I've had. Great variety of cars and transparent pricing. Highly recommended!"
    },
    {
      name: "Anjali Patel",
      location: "Bangalore",
      rating: 5,
      comment: "Professional service with amazing customer support. The car was delivered on time and in perfect condition."
    }
  ];

  return (
    <div className="min-h-screen gradient-card">
      <div className="container mx-auto px-4 py-8 pt-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-primary bg-clip-text text-transparent mb-6">
            About CARzy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're passionate about making car rentals simple, affordable, and accessible for everyone. 
            Since 2020, we've been transforming the way India travels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/cars')}
              className="gradient-primary hover:shadow-glow hover:scale-105 transition-smooth"
              size="lg"
            >
              Browse Our Fleet
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/contact')}
              size="lg"
            >
              Contact Us
            </Button>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To provide India with the most convenient, reliable, and affordable car rental service, 
                empowering people to explore their world with freedom and confidence. We believe 
                transportation should never be a barrier to your dreams.
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted car rental platform, known for exceptional service, 
                innovative technology, and sustainable transportation solutions that connect communities 
                and create unforgettable experiences.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">CARzy by the Numbers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="gradient-card border-border text-center hover:shadow-glow transition-smooth">
                <CardContent className="p-6">
                  <div className="gradient-primary p-3 rounded-full w-fit mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Why Choose CARzy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card border-border hover:shadow-glow transition-smooth group">
                <CardContent className="p-6 text-center">
                  <div className="gradient-primary p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:shadow-glow transition-smooth">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <Card key={index} className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <Badge className="gradient-primary text-primary-foreground text-lg px-3 py-1">
                          {milestone.year}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <Card key={index} className="gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.comment}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="gradient-card border-border max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Experience CARzy?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of satisfied customers who trust CARzy for their transportation needs. 
                Book your perfect car today and start your journey with us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/cars')}
                  className="gradient-primary hover:shadow-glow hover:scale-105 transition-smooth"
                  size="lg"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Start Booking
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/contact')}
                  size="lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;