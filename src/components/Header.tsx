// ============================================
// IMPORTS
// ============================================
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Car, ArrowLeft, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "./ThemeProvider";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu";
import SearchModal from "./SearchModal";

const Header = () => {
  // ============================================
  // STATE & HOOKS
  // ============================================
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { theme, setTheme } = useTheme();
  
  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  
  // Modal State
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    initialTab: "login" | "signup";
  }>({ isOpen: false, initialTab: "login" });
  const [searchModal, setSearchModal] = useState(false);

  // ============================================
  // AUTO-HIDE HEADER (for non-home pages)
  // ============================================
  useEffect(() => {
    // Always show header on homepage
    if (isHomePage) {
      setIsHeaderVisible(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is near the top (within 100px)
      if (e.clientY <= 100) {
        setIsHeaderVisible(true);
        
        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Hide after 3 seconds of no mouse movement at top
        timeoutId = setTimeout(() => {
          if (e.clientY > 100) {
            setIsHeaderVisible(false);
          }
        }, 3000);
      } else if (e.clientY > 150) {
        // Hide header when mouse moves away from top
        setIsHeaderVisible(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    setIsHeaderVisible(false); // Initially hide header on non-home pages

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isHomePage]);

  // ============================================
  // AUTHENTICATION STATE
  // ============================================
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

  // ============================================
  // NAVIGATION CONFIG
  // ============================================
  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Cars", href: "#cars" },
    { name: "Contact", href: "#contact" },
  ];

  // ============================================
  // EVENT HANDLERS
  // ============================================
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft transition-transform duration-300 ease-in-out ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo or Back Button */}
          {isHomePage ? (
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
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="backdrop-blur-sm bg-background/80 border border-border hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
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
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Dark Mode
                    </>
                  )}
                </Button>
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