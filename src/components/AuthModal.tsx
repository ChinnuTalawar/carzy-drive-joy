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
import { User, Shield, Car } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

const AuthModal = ({ isOpen, onClose, initialTab = "login" }: AuthModalProps) => {
  const [userType, setUserType] = useState<string>("");

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
        
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gradient-card">
            <TabsTrigger value="login" className="text-foreground">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-foreground">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-type">Login as</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="gradient-card border-border">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent className="gradient-card border-border">
                    <SelectItem value="user" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="car-owner" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Car Owner
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-primary hover:shadow-glow hover:scale-105">
                {getUserTypeIcon(userType)}
                Login
              </Button>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  className="gradient-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  className="gradient-card border-border"
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
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-primary hover:shadow-glow hover:scale-105">
                {getUserTypeIcon(userType)}
                Sign Up
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;