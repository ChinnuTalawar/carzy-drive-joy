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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Car, Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getPrimaryRole, addUserRole, type AppRole } from "@/lib/roleService";
import { z } from "zod";

// ============================================
// VALIDATION SCHEMAS
// ============================================
const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(1, { message: "Password is required" }),
  userType: z.enum(["user", "car-owner", "admin"], { message: "Please select account type" })
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  userType: z.enum(["user", "car-owner"], { message: "Please select account type" })
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" })
});

// ============================================
// TYPES
// ============================================
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup" | "forgot";
}

const AuthModal = ({ isOpen, onClose, initialTab = "login" }: AuthModalProps) => {
  // ============================================
  // STATE
  // ============================================
  const { toast } = useToast();
  const [userType, setUserType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    forgotEmail: "",
    signupPassword: ""
  });

  // ============================================
  // HELPERS
  // ============================================
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ============================================
  // LOGIN HANDLER
  // ============================================
  const handleLogin = async () => {
    // Validate input
    const validation = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
      userType
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      // Verify user role matches the selected type
      if (authData.user) {
        const primaryRole = await getPrimaryRole(authData.user.id);
        
        if (primaryRole !== userType) {
          await supabase.auth.signOut();
          const getRoleName = (role: string) => 
            role === 'user' ? 'Customer' : role === 'car-owner' ? 'Car Owner' : 'Admin';
          
          toast({
            title: "Error",
            description: `You cannot login as ${getRoleName(userType)}. Your account type is ${getRoleName(primaryRole)}.`,
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Logged in successfully!"
      });
      onClose();
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

  // ============================================
  // FORGOT PASSWORD HANDLER
  // ============================================
  const handleForgotPassword = async () => {
    // Validate input
    const validation = forgotPasswordSchema.safeParse({
      email: formData.forgotEmail
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
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
          description: "If an account with this email exists, a password reset link has been sent"
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

  // ============================================
  // GOOGLE OAUTH HANDLER
  // ============================================
  const handleGoogleAuth = async () => {
    if (!userType) {
      toast({
        title: "Error",
        description: "Please select your account type first",
        variant: "destructive"
      });
      return;
    }

    // Don't allow admin signup via Google
    if (userType === "admin" && currentTab === "signup") {
      toast({
        title: "Error",
        description: "Admin accounts cannot be created through signup",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Encode role in OAuth state parameter (more secure than localStorage)
      const stateData = {
        role: userType,
        timestamp: Date.now()
      };
      const encodedState = btoa(JSON.stringify(stateData));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            state: encodedState
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to authenticate with Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SIGNUP HANDLER
  // ============================================
  const handleSignup = async () => {
    // Validate input
    const validation = signupSchema.safeParse({
      email: formData.email,
      fullName: formData.fullName,
      password: formData.signupPassword,
      userType
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
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
      // Create auth user first
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validation.data.fullName
          }
        }
      });

      if (signupError) {
        toast({
          title: "Error",
          description: signupError.message,
          variant: "destructive"
        });
        return;
      }

      // Add user role (handled by trigger for profile creation)
      if (authData.user) {
        // The role will be added after email confirmation
        // For now, we store it in user metadata
        await supabase.auth.updateUser({
          data: { pending_role: userType }
        });
      }

      toast({
        title: "Check your email",
        description: "We sent you a verification link to complete your signup"
      });
      setCurrentTab("login");
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

  // ============================================
  // RENDER
  // ============================================
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
          
          {/* ========== LOGIN TAB ========== */}
          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-type" className="text-foreground">Login as</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="gradient-card border-border text-foreground">
                    <SelectValue placeholder="Select user type" className="text-foreground" />
                  </SelectTrigger>
                  <SelectContent className="gradient-card border-border">
                    <SelectItem value="user" className="text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="car-owner" className="text-foreground">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Car Owner
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="text-foreground">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="gradient-card border-border text-foreground placeholder:text-muted-foreground pr-10"
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
              
              <Button
                className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                onClick={handleLogin}
                disabled={loading}
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-border"
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
              >
                <Chrome className="h-4 w-4 mr-2" />
                Continue with Google
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
          
          {/* ========== SIGNUP TAB ========== */}
          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-type" className="text-foreground">Sign up as</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="gradient-card border-border text-foreground">
                    <SelectValue placeholder="Select user type" className="text-foreground" />
                  </SelectTrigger>
                  <SelectContent className="gradient-card border-border">
                    <SelectItem value="user" className="text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="car-owner" className="text-foreground">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Car Owner
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  className="gradient-card border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                    className="gradient-card border-border text-foreground placeholder:text-muted-foreground pr-10"
                    value={formData.signupPassword}
                    onChange={(e) => handleInputChange("signupPassword", e.target.value)}
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
              
              <Button
                className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                onClick={handleSignup}
                disabled={loading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Creating Account..." : "Sign Up with Email"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-border"
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
              >
                <Chrome className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>
            </div>
          </TabsContent>
          
          {/* ========== FORGOT PASSWORD TAB ========== */}
          <TabsContent value="forgot" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Reset Password</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-foreground">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border text-foreground placeholder:text-muted-foreground"
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