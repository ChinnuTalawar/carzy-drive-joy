import { DollarSign, Calendar, Car, Headphones } from "lucide-react";

const WhyChoose = () => {
  const features = [
    {
      icon: DollarSign,
      title: "Affordable Pricing",
      description: "Competitive rates with no hidden fees. Get the best value for your money with our transparent pricing.",
      color: "gradient-primary"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book your car in just a few clicks. Our streamlined process makes reserving your perfect ride effortless.",
      color: "gradient-secondary"
    },
    {
      icon: Car,
      title: "Wide Variety",
      description: "Choose from our extensive fleet of vehicles. From economy to luxury, we have the perfect car for every need.",
      color: "gradient-hero"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you. Our dedicated team is always here to help you.",
      color: "gradient-primary"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 gradient-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              CARzy?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing you with the best car rental experience possible
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center hover:-translate-y-2 transition-smooth"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`${feature.color} p-4 rounded-2xl shadow-soft group-hover:shadow-glow transition-smooth`}>
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="gradient-card p-8 rounded-2xl shadow-medium max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Hit the Road?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of satisfied customers who trust CARzy for their transportation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:shadow-glow hover:scale-105 transition-smooth shadow-soft">
                Start Booking
              </button>
              <button className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:gradient-primary hover:text-primary-foreground hover:scale-105 transition-smooth">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;