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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Car, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup" | "forgot";
}

const AuthModal = ({ isOpen, onClose, initialTab = "login" }: AuthModalProps) => {
  const [userType, setUserType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    forgotEmail: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password || !userType) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!"
        });
        onClose();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.forgotEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset link sent to your email"
        });
        setCurrentTab("login");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send reset link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.email || !formData.fullName || !userType) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    // Don't allow admin signup
    if (userType === "admin") {
      toast({
        title: "Error",
        description: "Admin accounts cannot be created through signup",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: "temp_password", // Will be set via email verification
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            user_type: userType
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a verification link to complete your signup"
        });
        setCurrentTab("login");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Welcome to CARzy
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "login" | "signup" | "forgot")} className="w-full">
          {currentTab !== "forgot" && (
            <TabsList className="grid w-full grid-cols-2 gradient-card">
              <TabsTrigger value="login" className="text-foreground">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-foreground">Sign Up</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="gradient-card border-border pr-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-type">Login as</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="gradient-card border-border">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent className="gradient-card border-border">
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="car-owner">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Car Owner
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                onClick={handleLogin}
                disabled={loading}
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setCurrentTab("forgot")}
                  className="text-sm text-muted-foreground"
                >
                  Forgot Password?
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  className="gradient-card border-border"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-type">Sign up as</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="gradient-card border-border">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent className="gradient-card border-border">
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="car-owner">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Car Owner
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                onClick={handleSignup}
                disabled={loading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Creating Account..." : "Sign Up with Email"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="forgot" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Reset Password</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border"
                  value={formData.forgotEmail}
                  onChange={(e) => handleInputChange("forgotEmail", e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentTab("login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;