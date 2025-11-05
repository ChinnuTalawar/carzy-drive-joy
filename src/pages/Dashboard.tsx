import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getPrimaryRole, type AppRole } from "@/lib/roleService";
import BackButton from "@/components/BackButton";

import { 
  Car, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Settings,
  Plus,
  Eye,
  FileSpreadsheet
} from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalCars: number;
  totalUsers: number;
  activeBookings?: number;
  pendingBookings?: number;
  completedBookings?: number;
  upcomingBookings?: number;
}

interface RecentBooking {
  id: string;
  car_name: string;
  user_email: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<AppRole>("user");
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    totalCars: 0,
    totalUsers: 0,
    activeBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      setUser(session.user);

      // Get user's primary role from user_roles table
      const primaryRole = await getPrimaryRole(session.user.id);
      setUserType(primaryRole);
      await fetchDashboardData(primaryRole, session.user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (type: AppRole, userId: string) => {
    try {
      if (type === 'admin') {
        // Admin sees all data
        const { data: bookings } = await supabase.from('bookings').select('*');
        const { data: cars } = await supabase.from('cars').select('*');
        const { data: profiles } = await supabase.from('profiles').select('*');

        const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;
        const activeBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.end_date) >= new Date()).length || 0;
        const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
        const completedBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.end_date) < new Date()).length || 0;
        
        setStats({
          totalBookings: bookings?.length || 0,
          totalRevenue,
          totalCars: cars?.length || 0,
          totalUsers: profiles?.length || 0,
          activeBookings,
          pendingBookings,
          completedBookings
        });

        // Recent bookings with car and user details
        const { data: recentData } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentData) {
          const bookingsWithDetails = await Promise.all(
            recentData.map(async (booking) => {
              const [carResult, userResult] = await Promise.all([
                supabase.from('cars').select('name').eq('id', booking.car_id).single(),
                supabase.from('profiles').select('email').eq('user_id', booking.user_id).single()
              ]);
              
              return {
                id: booking.id,
                car_name: carResult.data?.name || 'Unknown Car',
                user_email: userResult.data?.email || 'Unknown User',
                start_date: booking.start_date,
                end_date: booking.end_date,
                total_amount: booking.total_amount,
                status: booking.status
              };
            })
          );
          setRecentBookings(bookingsWithDetails);
        }

      } else if (type === 'car-owner') {
        // Car owner sees their cars and bookings
        const { data: cars } = await supabase
          .from('cars')
          .select('*')
          .eq('owner_id', userId);

        const carIds = cars?.map(car => car.id) || [];
        
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .in('car_id', carIds);

        const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;
        const activeBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.end_date) >= new Date()).length || 0;
        const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
        const completedBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.end_date) < new Date()).length || 0;

        setStats({
          totalBookings: bookings?.length || 0,
          totalRevenue,
          totalCars: cars?.length || 0,
          totalUsers: 0,
          activeBookings,
          pendingBookings,
          completedBookings
        });

        // Recent bookings for owner's cars
        const { data: recentData } = await supabase
          .from('bookings')
          .select('*')
          .in('car_id', carIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentData) {
          const bookingsWithDetails = await Promise.all(
            recentData.map(async (booking) => {
              const [carResult, userResult] = await Promise.all([
                supabase.from('cars').select('name').eq('id', booking.car_id).single(),
                supabase.from('profiles').select('email').eq('user_id', booking.user_id).single()
              ]);
              
              return {
                id: booking.id,
                car_name: carResult.data?.name || 'Unknown Car',
                user_email: userResult.data?.email || 'Unknown User',
                start_date: booking.start_date,
                end_date: booking.end_date,
                total_amount: booking.total_amount,
                status: booking.status
              };
            })
          );
          setRecentBookings(bookingsWithDetails);
        }

      } else {
        // Regular user sees their bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            cars!inner(name)
          `)
          .eq('user_id', userId);

        const totalSpent = bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;
        const activeBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.end_date) >= new Date()).length || 0;
        const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.start_date) > new Date()).length || 0;
        const completedBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.end_date) < new Date()).length || 0;

        setStats({
          totalBookings: bookings?.length || 0,
          totalRevenue: totalSpent,
          totalCars: 0,
          totalUsers: 0,
          activeBookings,
          upcomingBookings,
          completedBookings
        });

        if (bookings) {
          setRecentBookings(bookings.map(booking => ({
            id: booking.id,
            car_name: booking.cars.name,
            user_email: user?.email || '',
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            status: booking.status
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatsCards = () => {
    if (userType === 'admin') {
      return [
        { title: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-blue-500" },
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
        { title: "Total Cars", value: stats.totalCars, icon: Car, color: "text-purple-500" },
        { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-orange-500" }
      ];
    } else if (userType === 'car-owner') {
      return [
        { title: "My Cars", value: stats.totalCars, icon: Car, color: "text-purple-500" },
        { title: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-blue-500" },
        { title: "Total Earnings", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
        { title: "Growth", value: "+12%", icon: TrendingUp, color: "text-green-500" }
      ];
    } else {
      return [
        { title: "My Bookings", value: stats.totalBookings, icon: Calendar, color: "text-blue-500" },
        { title: "Total Spent", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
        { title: "Favorite Cars", value: "3", icon: Car, color: "text-purple-500" },
        { title: "Saved", value: "₹2,400", icon: TrendingUp, color: "text-green-500" }
      ];
    }
  };

  const getDashboardTitle = () => {
    switch (userType) {
      case 'admin':
        return 'Admin Dashboard';
      case 'car-owner':
        return 'Car Owner Dashboard';
      default:
        return 'Customer Dashboard';
    }
  };

  return (
    <div className="min-h-screen gradient-card">
      <div className="container mx-auto px-4 py-8 pt-16">
        <BackButton />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              {getDashboardTitle()}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {userType === 'car-owner' && (
              <Button onClick={() => navigate('/add-car')} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat, index) => (
            <Card key={index} className="gradient-card border-border hover:shadow-glow transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role-Based Detailed Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {userType === 'admin' ? 'System Overview' : userType === 'car-owner' ? 'Business Insights' : 'Your Activity'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userType === 'admin' && (
              <>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Active Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.activeBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently ongoing rentals</p>
                  </CardContent>
                </Card>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.pendingBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
                  </CardContent>
                </Card>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.completedBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total finished rentals</p>
                  </CardContent>
                </Card>
              </>
            )}
            {userType === 'car-owner' && (
              <>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Active Rentals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.activeBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Cars currently rented</p>
                  </CardContent>
                </Card>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Pending Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.pendingBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Bookings to review</p>
                  </CardContent>
                </Card>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Completed Trips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.completedBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
                  </CardContent>
                </Card>
              </>
            )}
            {userType === 'user' && (
              <>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Active Rentals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.activeBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently rented cars</p>
                  </CardContent>
                </Card>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Upcoming Trips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.upcomingBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Future bookings</p>
                  </CardContent>
                </Card>
                <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Completed Trips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.completedBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total trips taken</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent {userType === 'user' ? 'My Bookings' : 'Bookings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium text-foreground">{booking.car_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {userType !== 'user' ? booking.user_email : 'Your booking'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">₹{booking.total_amount.toLocaleString()}</p>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent bookings</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userType === 'admin' && (
                  <>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/cars')}
                    >
                      <Eye className="h-6 w-6 mb-2" />
                      View All Cars
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/booking-history')}
                    >
                      <Calendar className="h-6 w-6 mb-2" />
                      All Bookings
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/admin/reports')}
                    >
                      <FileSpreadsheet className="h-6 w-6 mb-2" />
                      Download Reports
                    </Button>
                  </>
                )}
                {userType === 'car-owner' && (
                  <>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/my-cars')}
                    >
                      <Car className="h-6 w-6 mb-2" />
                      My Cars
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/add-car')}
                    >
                      <Plus className="h-6 w-6 mb-2" />
                      Add New Car
                    </Button>
                  </>
                )}
                {userType === 'user' && (
                  <>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/cars')}
                    >
                      <Car className="h-6 w-6 mb-2" />
                      Browse Cars
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate('/booking-history')}
                    >
                      <Calendar className="h-6 w-6 mb-2" />
                      My Bookings
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/account')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  My Account
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;