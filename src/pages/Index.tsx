import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CarsShowcase from "@/components/CarsShowcase";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CarsShowcase />
        <WhyChoose />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
