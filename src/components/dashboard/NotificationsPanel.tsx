import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          {notifications.length > 0 && (
            <Badge variant="destructive" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">
              {notifications.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Pending actions and alerts</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-l-4 border-destructive bg-muted/50 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {notification.bookingId && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">#</span>
                          <span className="text-primary font-medium">{notification.bookingId}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          View Details
                        </Button>
                        <Button size="sm" className="text-xs h-7">
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
