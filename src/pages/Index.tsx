import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Truck, Package, BarChart3, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const features = [
    {
      icon: Package,
      title: "Booking Management",
      description: "Track and manage all cargo bookings with ease",
    },
    {
      icon: Truck,
      title: "Vehicle Tracking",
      description: "Monitor vehicle hiring details and routes",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Get insights into your operations with real-time data",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Role-based access control for your team",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Truck className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">SSK Cargo Management</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Modern database management system for vehicle hiring and cargo booking operations
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-border"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
