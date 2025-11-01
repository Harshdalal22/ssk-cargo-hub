import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Truck, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface NewEntry {
  id: string;
  booking_id: string;
  type: "booking" | "vehicle";
  party_name?: string;
  owner_name?: string;
  date: string;
  from_location: string;
  to_location: string;
  freight: number;
  payment_status: string;
  created_at: string;
}

interface AnalyticsStats {
  todayBookings: number;
  todayVehicles: number;
  todayRevenue: number;
  pendingPayments: number;
}

const Analytics = () => {
  const [newEntries, setNewEntries] = useState<NewEntry[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    todayBookings: 0,
    todayVehicles: 0,
    todayRevenue: 0,
    pendingPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewEntries();

    const bookingChannel = supabase
      .channel('analytics-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_register' }, () => {
        fetchNewEntries();
      })
      .subscribe();

    const vehicleChannel = supabase
      .channel('analytics-vehicles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vehicle_hiring_details' }, () => {
        fetchNewEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(vehicleChannel);
    };
  }, []);

  const fetchNewEntries = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [bookingsData, vehiclesData] = await Promise.all([
        supabase
          .from("booking_register")
          .select("*")
          .gte("created_at", todayISO)
          .order("created_at", { ascending: false }),
        supabase
          .from("vehicle_hiring_details")
          .select("*")
          .gte("created_at", todayISO)
          .order("created_at", { ascending: false }),
      ]);

      const bookings = (bookingsData.data || []).map((b) => ({
        id: b.id,
        booking_id: b.booking_id,
        type: "booking" as const,
        party_name: b.party_name,
        date: b.date,
        from_location: b.from_location,
        to_location: b.to_location,
        freight: Number(b.freight || 0),
        payment_status: b.payment_status,
        created_at: b.created_at,
      }));

      const vehicles = (vehiclesData.data || []).map((v) => ({
        id: v.id,
        booking_id: v.booking_id,
        type: "vehicle" as const,
        owner_name: v.owner_name,
        date: v.date,
        from_location: v.from_location,
        to_location: v.to_location,
        freight: Number(v.freight || 0),
        payment_status: v.payment_status,
        created_at: v.created_at,
      }));

      const allEntries = [...bookings, ...vehicles].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNewEntries(allEntries);

      const todayRevenue = allEntries.reduce((sum, entry) => sum + entry.freight, 0);
      const pendingPayments = allEntries.filter(e => e.payment_status === "Pending").length;

      setStats({
        todayBookings: bookings.length,
        todayVehicles: vehicles.length,
        todayRevenue,
        pendingPayments,
      });
    } catch (error) {
      console.error("Error fetching new entries:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: Package,
      gradient: "from-cyan-400 to-blue-500",
      shadowColor: "shadow-cyan-500/50",
    },
    {
      title: "Today's Vehicles",
      value: stats.todayVehicles,
      icon: Truck,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/50",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      gradient: "from-amber-400 to-orange-500",
      shadowColor: "shadow-amber-500/50",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: TrendingUp,
      gradient: "from-pink-400 to-rose-500",
      shadowColor: "shadow-pink-500/50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-8">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold mb-1 lg:mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-sm lg:text-lg text-muted-foreground">
            Real-time insights of today's new entries and operations
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border rounded-xl p-3 lg:p-6 animate-pulse h-24 lg:h-32"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {statCards.map((card, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-0 shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 transform`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}></div>
                <CardContent className="relative p-3 lg:p-6 text-white">
                  <div className="flex items-center justify-between mb-2 lg:mb-4">
                    <card.icon className="h-6 w-6 lg:h-10 lg:w-10 opacity-80" />
                    <div className="h-8 w-8 lg:h-12 lg:w-12 bg-white/20 rounded-full blur-xl absolute -top-2 -right-2"></div>
                  </div>
                  <div className="space-y-0.5 lg:space-y-1">
                    <p className="text-xs lg:text-sm font-medium opacity-90 truncate">{card.title}</p>
                    <p className="text-lg lg:text-3xl font-bold drop-shadow-lg truncate">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-2 border-blue-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b p-4 lg:p-6">
            <CardTitle className="text-lg lg:text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              New Entries Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {newEntries.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <Package className="h-12 w-12 lg:h-16 lg:w-16 mx-auto text-muted-foreground/40 mb-3 lg:mb-4" />
                <p className="text-sm lg:text-lg text-muted-foreground">No new entries today</p>
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {newEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 lg:p-5 rounded-xl border-2 border-gray-100 hover:border-blue-200 bg-gradient-to-r from-white to-blue-50/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                          <Badge
                            className={`text-xs lg:text-sm ${
                              entry.type === "booking"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            } text-white shadow-md`}
                          >
                            {entry.type === "booking" ? "Booking" : "Vehicle Hiring"}
                          </Badge>
                          <span className="text-base lg:text-xl font-bold text-gray-800">{entry.booking_id}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm">
                          <div>
                            <span className="text-muted-foreground font-medium">
                              {entry.type === "booking" ? "Party:" : "Owner:"}
                            </span>
                            <span className="ml-2 font-semibold text-gray-700">
                              {entry.party_name || entry.owner_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-medium">Date:</span>
                            <span className="ml-2 font-semibold text-gray-700">
                              {new Date(entry.date).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground font-medium">Route:</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {entry.from_location} → {entry.to_location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start lg:text-right gap-2">
                        <div className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                          ₹{entry.freight.toLocaleString("en-IN")}
                        </div>
                        <Badge
                          variant={entry.payment_status === "Completed" ? "secondary" : "destructive"}
                          className="shadow-md text-xs lg:text-sm"
                        >
                          {entry.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
