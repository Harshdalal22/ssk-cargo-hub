import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, FileText, DollarSign, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalVehicleHiring: number;
  totalBookings: number;
  pendingPayments: number;
  pendingPOD: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicleHiring: 0,
    totalBookings: 0,
    pendingPayments: 0,
    pendingPOD: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [vehicleHiringData, bookingsData] = await Promise.all([
        supabase.from("vehicle_hiring_details").select("*"),
        supabase.from("booking_register").select("*"),
      ]);

      const vehicleHiring = vehicleHiringData.data || [];
      const bookings = bookingsData.data || [];

      const pendingPayments =
        vehicleHiring.filter((v) => v.payment_status === "Pending").length +
        bookings.filter((b) => b.payment_status === "Pending").length;

      const pendingPOD = vehicleHiring.filter(
        (v) => v.pod_status === "Pending"
      ).length;

      const totalRevenue =
        vehicleHiring.reduce((sum, v) => sum + Number(v.freight), 0) +
        bookings.reduce((sum, b) => sum + Number(b.freight), 0);

      setStats({
        totalVehicleHiring: vehicleHiring.length,
        totalBookings: bookings.length,
        pendingPayments,
        pendingPOD,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Vehicle Hiring Records",
      value: stats.totalVehicleHiring,
      icon: Truck,
      color: "text-primary",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: FileText,
      color: "text-accent",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: AlertCircle,
      color: "text-warning",
      badge: stats.pendingPayments > 0 ? "Attention" : null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your cargo management operations
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{card.value}</div>
                    {card.badge && (
                      <Badge variant="destructive">{card.badge}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending POD</span>
                <Badge variant={stats.pendingPOD > 0 ? "destructive" : "secondary"}>
                  {stats.pendingPOD}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed Payments</span>
                <Badge variant="secondary">
                  {stats.totalVehicleHiring + stats.totalBookings - stats.pendingPayments}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>All systems operational</p>
              <p>Database synced</p>
              <p>Last updated: {new Date().toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
