// ============================================
// IMPORTS
// ============================================
import { Button } from "@/components/ui/button";
import { Star, Users, Car, Shield } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section id="home" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 gradient-card">
      <div className="max-w-7xl mx-auto">
        {/* ============================================ */}
        {/* HERO CONTENT GRID */}
        {/* ============================================ */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ========== Left Content: Heading & CTA ========== */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="gradient-primary bg-clip-text text-transparent font-extrabold">
                  Drive Your Dream with CARzy
                </span>
              </h1>
            </div>

            {/* CTA Button */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-smooth shadow-glow"
                onClick={() => window.location.href = "/cars"}
              >
                Start Booking
              </Button>
            </motion.div>
          </motion.div>

          {/* ========== Right Content: Hero Image ========== */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-glow">
              <motion.img 
                src={heroImage} 
                alt="Premium car rental" 
                className="w-full h-auto object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {/* Decorative space elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-20 h-20 gradient-secondary rounded-full opacity-30 blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -bottom-4 -left-4 w-32 h-32 gradient-primary rounded-full opacity-30 blur-xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 gradient-hero rounded-full opacity-10 blur-3xl"></div>
          </motion.div>
        </div>
        
        {/* ============================================ */}
        {/* STATS SECTION */}
        {/* ============================================ */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { icon: Car, value: "500+", label: "Cars Available" },
            { icon: Users, value: "10K+", label: "Happy Customers" },
            { icon: Star, value: "4.9", label: "Rating" },
            { icon: Shield, value: "24/7", label: "Support" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center glass rounded-xl p-4"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center mb-2">
                <div className="gradient-primary p-2 rounded-lg">
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;