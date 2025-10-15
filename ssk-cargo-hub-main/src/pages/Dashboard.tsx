import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, CircleCheck as CheckCircle, IndianRupee, TriangleAlert as AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  openBookings: number;
  completedBookings: number;
  totalPaymentsDue: number;
  overduePOD: number;
}

interface ActivityRecord {
  id: string;
  type: string;
  party_owner: string;
  date: string;
  amount: number;
  status: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  bookingId?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    openBookings: 0,
    completedBookings: 0,
    totalPaymentsDue: 0,
    overduePOD: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    fetchUserProfile();
    fetchDashboardStats();

    // Set up real-time subscriptions
    const vehicleChannel = supabase
      .channel('vehicle-hiring-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_hiring_details'
        },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    const bookingChannel = supabase
      .channel('booking-register-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_register'
        },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vehicleChannel);
      supabase.removeChannel(bookingChannel);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [vehicleHiringData, bookingsData] = await Promise.all([
        supabase.from("vehicle_hiring_details").select("*"),
        supabase.from("booking_register").select("*"),
      ]);

      const vehicleHiring = vehicleHiringData.data || [];
      const bookings = bookingsData.data || [];

      // Calculate stats
      const openBookings = bookings.filter((b) => b.payment_status === "Pending").length;
      const completedBookings = bookings.filter((b) => b.payment_status === "Completed").length;
      
      const totalPaymentsDue =
        vehicleHiring
          .filter((v) => v.payment_status === "Pending")
          .reduce((sum, v) => sum + Number(v.balance || 0), 0) +
        bookings
          .filter((b) => b.payment_status === "Pending")
          .reduce((sum, b) => sum + Number(b.balance || 0), 0);

      const overduePOD = vehicleHiring.filter(
        (v) => v.pod_status === "Pending"
      ).length;

      setStats({
        openBookings,
        completedBookings,
        totalPaymentsDue,
        overduePOD,
      });

      // Prepare recent activity
      const activities: ActivityRecord[] = [
        ...vehicleHiring.slice(0, 5).map((v) => ({
          id: v.booking_id,
          type: "Vehicle Hiring",
          party_owner: v.owner_name,
          date: new Date(v.date).toLocaleDateString('en-IN'),
          amount: Number(v.freight || 0),
          status: v.payment_status,
        })),
        ...bookings.slice(0, 5).map((b) => ({
          id: b.booking_id,
          type: "Booking",
          party_owner: b.party_name,
          date: new Date(b.date).toLocaleDateString('en-IN'),
          amount: Number(b.freight || 0),
          status: b.payment_status,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      setRecentActivity(activities);

      // Create notifications for overdue payments
      const overdueNotifications: Notification[] = vehicleHiring
        .filter((v) => v.payment_status === "Pending" && v.pod_status === "Pending")
        .slice(0, 5)
        .map((v) => ({
          id: v.id,
          title: "Payment Overdue",
          message: `Payment for booking ${v.booking_id} is overdue. Please process the payment.`,
          time: "2h ago",
          bookingId: v.booking_id,
        }));

      setNotifications(overdueNotifications);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Open Bookings",
      value: stats.openBookings,
      change: 12,
      icon: BookOpen,
      iconColor: "text-primary-foreground",
      iconBgColor: "bg-primary",
      onClick: () => navigate("/booking-register"),
    },
    {
      title: "Completed Bookings",
      value: stats.completedBookings,
      change: 8,
      icon: CheckCircle,
      iconColor: "text-accent-foreground",
      iconBgColor: "bg-accent",
      onClick: () => navigate("/booking-register"),
    },
    {
      title: "Total Payments Due",
      value: `₹${stats.totalPaymentsDue.toLocaleString("en-IN")}`,
      change: -5,
      icon: IndianRupee,
      iconColor: "text-warning-foreground",
      iconBgColor: "bg-warning",
      onClick: () => navigate("/vehicle-hiring"),
    },
    {
      title: "Overdue POD Status",
      value: stats.overduePOD,
      change: 2,
      icon: AlertTriangle,
      iconColor: "text-destructive-foreground",
      iconBgColor: "bg-destructive",
      onClick: () => navigate("/vehicle-hiring"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 lg:mb-2">Dashboard Overview</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Welcome back, {userName}. Here's what's happening today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            <Button 
              onClick={() => navigate("/vehicle-hiring")}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm lg:text-base h-9 lg:h-10"
            >
              <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" />
              Add Vehicle Hiring
            </Button>
            <Button 
              onClick={() => navigate("/booking-register")}
              variant="outline"
              className="w-full sm:w-auto text-sm lg:text-base h-9 lg:h-10"
            >
              <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" />
              Add Booking Register
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-3 lg:p-6 animate-pulse">
                <div className="h-8 w-8 lg:h-12 lg:w-12 bg-muted rounded-lg mb-2 lg:mb-4"></div>
                <div className="h-6 lg:h-8 bg-muted rounded w-12 lg:w-20 mb-1 lg:mb-2"></div>
                <div className="h-3 lg:h-4 bg-muted rounded w-20 lg:w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {statCards.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                value={card.value}
                change={card.change}
                icon={card.icon}
                iconColor={card.iconColor}
                iconBgColor={card.iconBgColor}
                onClick={card.onClick}
              />
            ))}
          </div>
        )}

        {/* Recent Activity and Notifications */}
        <div className="space-y-4 lg:space-y-6">
          <RecentActivityTable activities={recentActivity} />
          <NotificationsPanel notifications={notifications} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
