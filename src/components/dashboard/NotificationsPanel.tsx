import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  bookingId?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
}

const NotificationsPanel = ({ notifications }: NotificationsPanelProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (notification: Notification) => {
    if (notification.bookingId) {
      // Navigate to the specific booking page
      navigate('/booking-register', { state: { searchBookingId: notification.bookingId } });
      toast.info(`Opening booking ${notification.bookingId}`);
    }
  };

  const handleResolve = (notificationId: string) => {
    toast.success("Notification resolved successfully");
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base lg:text-lg flex items-center gap-2">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            Notifications
          </CardTitle>
          {notifications.length > 0 && (
            <Badge variant="destructive" className="rounded-full h-5 w-5 lg:h-6 lg:w-6 p-0 flex items-center justify-center text-xs">
              {notifications.length}
            </Badge>
          )}
        </div>
        <p className="text-xs lg:text-sm text-muted-foreground">Pending actions and alerts</p>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 pt-0">
        <ScrollArea className="h-[300px] lg:h-[400px] pr-2 lg:pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-6 lg:py-8 text-muted-foreground">
              <Bell className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-l-4 border-destructive bg-muted/50 p-3 lg:p-4 rounded-r-lg">
                  <div className="flex items-start gap-2 lg:gap-3">
                    <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 lg:space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs lg:text-sm">{notification.title}</h4>
                        <span className="text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                      </div>
                      <p className="text-xs lg:text-sm text-muted-foreground break-words">{notification.message}</p>
                      {notification.bookingId && (
                        <div className="flex items-center gap-1.5 lg:gap-2 text-xs">
                          <span className="text-muted-foreground">#</span>
                          <span className="text-primary font-medium truncate">{notification.bookingId}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7 flex-1 sm:flex-none"
                          onClick={() => handleViewDetails(notification)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs h-7 flex-1 sm:flex-none"
                          onClick={() => handleResolve(notification.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
