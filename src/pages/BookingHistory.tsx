import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import BackButton from "@/components/BackButton";
import { 
  Calendar, 
  Car, 
  DollarSign, 
  User, 
  Eye, 
  Download,
  Filter,
  Search
} from "lucide-react";

interface Booking {
  id: string;
  car_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_details: any;
  car?: {
    name: string;
    brand: string;
    model: string;
    image: string;
  };
  user?: {
    full_name: string;
    email: string;
  };
}

const BookingHistory = () => {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
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

      // Get user profile to determine user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        setUserType(profile.user_type);
        await fetchBookings(profile.user_type, session.user.id);
      }
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

  const fetchBookings = async (type: string, userId: string) => {
    try {
      if (type === 'admin') {
        // Admin sees all bookings - get bookings and join data separately
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (allBookings) {
          const bookingsWithDetails = await Promise.all(
            allBookings.map(async (booking) => {
              const [carResult, userResult] = await Promise.all([
                supabase.from('cars').select('name, brand, model, image').eq('id', booking.car_id).single(),
                supabase.from('profiles').select('full_name, email').eq('user_id', booking.user_id).single()
              ]);
              
              return {
                ...booking,
                car: carResult.data || { name: 'Unknown', brand: '', model: '', image: '' },
                user: userResult.data || { full_name: 'Unknown', email: 'Unknown' }
              };
            })
          );
          
          setBookings(bookingsWithDetails);
          
          // Separate customer and owner bookings
          const customers = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_type', 'user');
          
          const customerIds = customers.data?.map(p => p.user_id) || [];
          
          setCustomerBookings(bookingsWithDetails.filter(b => customerIds.includes(b.user_id)));
          setOwnerBookings(bookingsWithDetails.filter(b => !customerIds.includes(b.user_id)));
        }

      } else if (type === 'car-owner') {
        // Car owner sees bookings for their cars
        const { data: cars } = await supabase
          .from('cars')
          .select('id')
          .eq('owner_id', userId);

        const carIds = cars?.map(car => car.id) || [];
        
        const { data: ownerBookingsData } = await supabase
          .from('bookings')
          .select('*')
          .in('car_id', carIds)
          .order('created_at', { ascending: false });

        if (ownerBookingsData) {
          const bookingsWithDetails = await Promise.all(
            ownerBookingsData.map(async (booking) => {
              const [carResult, userResult] = await Promise.all([
                supabase.from('cars').select('name, brand, model, image').eq('id', booking.car_id).single(),
                supabase.from('profiles').select('full_name, email').eq('user_id', booking.user_id).single()
              ]);
              
              return {
                ...booking,
                car: carResult.data || { name: 'Unknown', brand: '', model: '', image: '' },
                user: userResult.data || { full_name: 'Unknown', email: 'Unknown' }
              };
            })
          );
          setBookings(bookingsWithDetails);
        }

      } else {
        // Regular user sees their bookings
        const { data: userBookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (userBookings) {
          const bookingsWithDetails = await Promise.all(
            userBookings.map(async (booking) => {
              const carResult = await supabase
                .from('cars')
                .select('name, brand, model, image')
                .eq('id', booking.car_id)
                .single();
              
              return {
                ...booking,
                car: carResult.data || { name: 'Unknown', brand: '', model: '', image: '' }
              };
            })
          );
          setBookings(bookingsWithDetails);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load booking history",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="gradient-card border-border hover:shadow-glow transition-smooth">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Car Image */}
          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted/20">
            {booking.car?.image ? (
              <img 
                src={booking.car.image} 
                alt={booking.car.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold text-lg">{booking.car?.name || 'Unknown Car'}</h3>
                <p className="text-muted-foreground">{booking.car?.brand} {booking.car?.model}</p>
                {userType !== 'user' && booking.user && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    {booking.user.full_name || booking.user.email}
                  </p>
                )}
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground">
                    {new Date(booking.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-muted-foreground">
                    {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p className="text-muted-foreground">₹{booking.total_amount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-muted-foreground">
                Booked on {new Date(booking.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/car/${booking.car_id}`)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Car
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen gradient-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-card">
      <BackButton />
      <div className="container mx-auto px-4 py-8 pt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Booking History
            </h1>
            <p className="text-muted-foreground">
              {userType === 'admin' 
                ? 'Manage all bookings across the platform'
                : userType === 'car-owner'
                ? 'View bookings for your cars'
                : 'Track your rental history and upcoming bookings'
              }
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {userType === 'admin' ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="gradient-card border-border">
              <TabsTrigger value="all">All Bookings ({bookings.length})</TabsTrigger>
              <TabsTrigger value="customers">Customer Bookings ({customerBookings.length})</TabsTrigger>
              <TabsTrigger value="owners">Owner Sales ({ownerBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="gradient-card border-border">
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">There are no bookings to display.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              {customerBookings.length > 0 ? (
                customerBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="gradient-card border-border">
                  <CardContent className="p-12 text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No customer bookings</h3>
                    <p className="text-muted-foreground">No customer bookings to display.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="owners" className="space-y-4">
              {ownerBookings.length > 0 ? (
                ownerBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="gradient-card border-border">
                  <CardContent className="p-12 text-center">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No owner sales</h3>
                    <p className="text-muted-foreground">No car owner sales to display.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="gradient-card border-border">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {userType === 'car-owner' 
                      ? "You haven't received any bookings for your cars yet."
                      : "You haven't made any bookings yet. Start exploring our amazing cars!"
                    }
                  </p>
                  <Button 
                    onClick={() => navigate(userType === 'car-owner' ? '/my-cars' : '/cars')}
                    className="gradient-primary"
                  >
                    {userType === 'car-owner' ? 'Manage My Cars' : 'Browse Cars'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;