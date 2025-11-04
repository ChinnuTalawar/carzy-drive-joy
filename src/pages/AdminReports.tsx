import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { hasRole } from "@/lib/roleService";
import { Download, FileSpreadsheet, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";

const AdminReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const adminStatus = await hasRole(user.id, "admin");
      if (!adminStatus) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Fetch all bookings for the selected month
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch related data for each booking
      const bookingsWithDetails = await Promise.all(
        (bookings || []).map(async (booking) => {
          // Fetch car details
          const { data: carData } = await supabase
            .from("cars")
            .select("*")
            .eq("id", booking.car_id)
            .single();

          // Fetch user details
          const { data: userData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", booking.user_id)
            .single();

          // Fetch car owner details
          const { data: ownerData } = await supabase
            .from("car_owners")
            .select("*")
            .eq("car_id", booking.car_id)
            .single();

          return {
            ...booking,
            car: carData,
            user: userData,
            car_owner: ownerData,
          };
        })
      );

      // Prepare data for Excel
      const reportData = bookingsWithDetails.map((booking) => {
        const userDetails = typeof booking.user_details === 'object' && booking.user_details !== null 
          ? booking.user_details as any 
          : {};

        return {
          "Booking ID": booking.id.substring(0, 8).toUpperCase(),
          "Booking Date": new Date(booking.created_at).toLocaleDateString(),
          "Status": booking.status.toUpperCase(),
          
          "Customer Name": booking.user?.full_name || "N/A",
          "Customer Email": booking.user?.email || "N/A",
          "Customer Phone": booking.user?.mobile_number || userDetails.phone || "N/A",
          
          "Car Name": booking.car?.name || "N/A",
          "Car Brand": booking.car?.brand || "N/A",
          "Car Model": booking.car?.model || "N/A",
          "Car Category": booking.car?.category || "N/A",
          
          "Owner Name": booking.car_owner?.owner_name || "N/A",
          "Owner Email": booking.car_owner?.owner_email || "N/A",
          "Owner Phone": booking.car_owner?.owner_phone || "N/A",
          
          "Start Date": new Date(booking.start_date).toLocaleDateString(),
          "End Date": new Date(booking.end_date).toLocaleDateString(),
          "Duration (Days)": Math.ceil(
            (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 
            (1000 * 60 * 60 * 24)
          ),
          
          "Total Amount (₹)": booking.total_amount,
        };
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(reportData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Booking ID
        { wch: 15 }, // Booking Date
        { wch: 12 }, // Status
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Customer Email
        { wch: 15 }, // Customer Phone
        { wch: 25 }, // Car Name
        { wch: 15 }, // Car Brand
        { wch: 15 }, // Car Model
        { wch: 12 }, // Car Category
        { wch: 20 }, // Owner Name
        { wch: 25 }, // Owner Email
        { wch: 15 }, // Owner Phone
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 15 }, // Duration
        { wch: 15 }, // Total Amount
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Bookings Report");

      // Generate file name
      const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
      const fileName = `CARzy_Bookings_Report_${monthName}_${year}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Report Generated",
        description: `Report for ${monthName} ${year} has been downloaded successfully`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                Admin Reports - Monthly Bookings
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Generate comprehensive reports of all booking activities, including customer and car owner details
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select Month
                  </label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select Year
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Report Includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All booking details and status</li>
                  <li>Customer information (name, email, phone)</li>
                  <li>Car details (name, brand, model, category)</li>
                  <li>Car owner contact information</li>
                  <li>Rental dates and duration</li>
                  <li>Payment amounts</li>
                </ul>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={generating}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {generating ? "Generating Report..." : "Download Excel Report"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
