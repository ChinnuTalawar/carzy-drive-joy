import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu";
import SearchModal from "./SearchModal";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    initialTab: "login" | "signup";
  }>({ isOpen: false, initialTab: "login" });
  const [searchModal, setSearchModal] = useState(false);

  // Authentication state management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Cars", href: "#cars" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    if (href === "#cars") {
      window.location.href = "/cars";
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center space-x-2 hover:opacity-80 transition-smooth"
          >
            <div className="gradient-primary p-2 rounded-xl shadow-soft">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold gradient-primary bg-clip-text text-transparent tracking-wider">
              CARzy
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <UserMenu user={user} onSearch={() => setSearchModal(true)} />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setAuthModal({ isOpen: true, initialTab: "login" })}
                >
                  Login
                </Button>
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => setAuthModal({ isOpen: true, initialTab: "signup" })}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 gradient-card rounded-xl mt-2 shadow-medium">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                >
                  {item.name}
                </button>
              ))}
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <UserMenu user={user} onSearch={() => setSearchModal(true)} />
                  </div>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setAuthModal({ isOpen: true, initialTab: "login" })}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => setAuthModal({ isOpen: true, initialTab: "signup" })}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialTab={authModal.initialTab}
      />
      
      <SearchModal
        isOpen={searchModal}
        onClose={() => setSearchModal(false)}
      />
    </header>
  );
};

export default Header;