import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  History,
  LogOut,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  user: any;
  onSearch: () => void;
}

const UserMenu = ({ user, onSearch }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      icon: User,
      label: "Account",
      action: () => navigate("/account"),
    },
    {
      icon: History,
      label: "Booking History",
      action: () => navigate("/booking-history"),
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => navigate("/settings"),
    },
  ];

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Search Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onSearch}
        className="gradient-card border-border hover:gradient-primary hover:text-primary-foreground"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* User Menu */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 gradient-card border border-border">
              <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                {getUserInitials(user?.user_metadata?.full_name || user?.email || "U")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 gradient-card border-border" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={item.action}
              className="cursor-pointer hover:gradient-secondary hover:text-secondary-foreground"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;