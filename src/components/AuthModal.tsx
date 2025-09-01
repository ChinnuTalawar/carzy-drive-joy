import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Car, Eye, EyeOff, Mail, Smartphone, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup" | "forgot" | "otp";
}

const AuthModal = ({ isOpen, onClose, initialTab = "login" }: AuthModalProps) => {
  const [userType, setUserType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [contactMethod, setContactMethod] = useState<"email" | "mobile">("email");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    fullName: "",
    forgotEmail: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkOtpUsage = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_and_increment_otp_usage', {
        user_email_param: email
      });
      
      if (error) {
        console.error('Error checking OTP usage:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking OTP usage:', error);
      return false;
    }
  };

  const sendOtp = async () => {
    const email = contactMethod === "email" ? formData.email : `${formData.mobile}@temp.com`;
    
    if (!email || (contactMethod === "mobile" && !formData.mobile)) {
      toast({
        title: "Error",
        description: `Please enter your ${contactMethod}`,
        variant: "destructive"
      });
      return;
    }

    // Check OTP usage limit
    const canSendOtp = await checkOtpUsage(email);
    if (!canSendOtp) {
      toast({
        title: "OTP Limit Reached",
        description: "You have reached the maximum of 5 OTP requests per day. Please try again tomorrow.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: contactMethod === "email" ? formData.email : undefined,
        phone: contactMethod === "mobile" ? formData.mobile : undefined,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setOtpSent(true);
        setCurrentTab("otp");
        setResendTimer(60);
        toast({
          title: "OTP Sent",
          description: `Check your ${contactMethod} for the verification code`
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const verifyParams = contactMethod === "email" 
        ? {
            email: formData.email,
            token: otp,
            type: "email" as const
          }
        : {
            phone: formData.mobile,
            token: otp,
            type: "sms" as const
          };

      const { error } = await supabase.auth.verifyOtp(verifyParams);

      if (error) {
        toast({
          title: "Invalid OTP",
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
        description: "Failed to verify OTP",
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

  const handleLogin = () => {
    // Since we're using OTP, redirect to OTP flow
    if (!userType) {
      toast({
        title: "Error",
        description: "Please select user type",
        variant: "destructive"
      });
      return;
    }
    sendOtp();
  };

  const handleSignup = () => {
    const contact = contactMethod === "email" ? formData.email : formData.mobile;
    
    if (!contact || !formData.fullName || !userType) {
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

    sendOtp();
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "car-owner":
        return <Car className="h-4 w-4" />;
      default:
        return null;
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
        
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "login" | "signup" | "forgot" | "otp")} className="w-full">
          {currentTab !== "otp" && currentTab !== "forgot" && (
            <TabsList className="grid w-full grid-cols-2 gradient-card">
              <TabsTrigger value="login" className="text-foreground">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-foreground">Sign Up</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Method</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={contactMethod === "email" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContactMethod("email")}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={contactMethod === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContactMethod("mobile")}
                    className="flex-1"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
              
              {contactMethod === "email" ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="login-mobile">Mobile Number</Label>
                  <Input
                    id="login-mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    className="gradient-card border-border"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                  />
                </div>
              )}
              
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
                <KeyRound className="h-4 w-4 mr-2" />
                {loading ? "Sending OTP..." : "Send OTP"}
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
                <Label>Contact Method</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={contactMethod === "email" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContactMethod("email")}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={contactMethod === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContactMethod("mobile")}
                    className="flex-1"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
              
              {contactMethod === "email" ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="signup-mobile">Mobile Number</Label>
                  <Input
                    id="signup-mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    className="gradient-card border-border"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                  />
                </div>
              )}
              
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
                <KeyRound className="h-4 w-4 mr-2" />
                {loading ? "Sending OTP..." : "Sign Up with OTP"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4 mt-6">
            <div className="space-y-4 text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to your {contactMethod}
                </p>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="gradient-card border-border" />
                    <InputOTPSlot index={1} className="gradient-card border-border" />
                    <InputOTPSlot index={2} className="gradient-card border-border" />
                    <InputOTPSlot index={3} className="gradient-card border-border" />
                    <InputOTPSlot index={4} className="gradient-card border-border" />
                    <InputOTPSlot index={5} className="gradient-card border-border" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button 
                className="w-full gradient-primary hover:shadow-glow hover:scale-105"
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="w-full"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCurrentTab("login");
                    setOtp("");
                    setOtpSent(false);
                  }}
                >
                  Back to Login
                </Button>
              </div>
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