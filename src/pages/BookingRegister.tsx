import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BookingForm from "@/components/forms/BookingForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  booking_id: string;
  party_name: string;
  date: string;
  gr_number: string;
  bill_number: string | null;
  lorry_number: string;
  lorry_type: string;
  weight: number;
  from_location: string;
  to_location: string;
  freight: number;
  advance: number;
  balance: number;
  other_expenses: number;
  total_balance: number;
  payment_status: string;
  pod_received_status: string;
  pod_received_date: string | null;
}

const BookingRegister = () => {
  const [records, setRecords] = useState<Booking[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Booking | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchRecords();
    checkUserRole();

    // Real-time subscription
    const channel = supabase
      .channel('booking-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_register' }, () => {
        fetchRecords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      setUserRole(data?.role || "staff");
    }
  };

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_register")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error: any) {
      toast.error("Error fetching records");
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchTerm) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(
      (record) =>
        record.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.gr_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.lorry_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("booking_register")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Record deleted successfully");
      fetchRecords();
    } catch (error: any) {
      toast.error("Error deleting record");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (record: Booking) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
    fetchRecords();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 lg:mb-2">Booking Register</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Manage cargo bookings and track shipments
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Booking
          </Button>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Booking ID, Party Name, GR Number, or Lorry Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </Card>
        ) : filteredRecords.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No records found</p>
          </Card>
        ) : (
          <div className="hidden lg:block overflow-x-auto">
            <Card>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Booking ID</th>
                    <th className="p-3 text-left text-sm font-medium">Party Name</th>
                    <th className="p-3 text-left text-sm font-medium">Date</th>
                    <th className="p-3 text-left text-sm font-medium">GR Number</th>
                    <th className="p-3 text-left text-sm font-medium">Lorry</th>
                    <th className="p-3 text-left text-sm font-medium">Route</th>
                    <th className="p-3 text-right text-sm font-medium">Weight (kg)</th>
                    <th className="p-3 text-right text-sm font-medium">Freight</th>
                    <th className="p-3 text-right text-sm font-medium">Total Balance</th>
                    <th className="p-3 text-center text-sm font-medium">POD Status</th>
                    <th className="p-3 text-center text-sm font-medium">Payment</th>
                    <th className="p-3 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3 text-sm font-medium">{record.booking_id}</td>
                      <td className="p-3 text-sm">{record.party_name}</td>
                      <td className="p-3 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{record.gr_number}</td>
                      <td className="p-3 text-sm">
                        {record.lorry_number}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {record.lorry_type}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {record.from_location} → {record.to_location}
                      </td>
                      <td className="p-3 text-sm text-right">{record.weight.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right">₹{record.freight.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right font-medium">
                        ₹{record.total_balance.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={record.pod_received_status === "Received" ? "secondary" : "destructive"}>
                          {record.pod_received_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={record.payment_status === "Completed" ? "secondary" : "destructive"}>
                          {record.payment_status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {userRole === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(record.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Mobile Card View */}
        {!isLoading && filteredRecords.length > 0 && (
          <div className="lg:hidden space-y-3">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                      <p className="text-base font-bold">{record.booking_id}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={record.pod_received_status === "Received" ? "secondary" : "destructive"}>
                        POD: {record.pod_received_status}
                      </Badge>
                      <Badge variant={record.payment_status === "Completed" ? "secondary" : "destructive"}>
                        {record.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Party Name</p>
                      <p className="text-sm font-medium">{record.party_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">GR Number</p>
                      <p className="text-sm font-medium">{record.gr_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lorry</p>
                      <p className="text-sm font-medium">{record.lorry_number}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Route</p>
                    <p className="text-sm font-medium">{record.from_location} → {record.to_location}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-sm font-medium">{record.weight.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Freight</p>
                      <p className="text-sm font-medium">₹{record.freight.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-sm font-bold">₹{record.total_balance.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {userRole === "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(record.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {isFormOpen && (
          <BookingForm
            isOpen={isFormOpen}
            onClose={handleFormClose}
            editData={editingRecord}
          />
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the booking record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default BookingRegister;
