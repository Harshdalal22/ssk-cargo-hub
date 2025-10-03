import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import VehicleHiringForm from "@/components/forms/VehicleHiringForm";
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

interface VehicleHiring {
  id: string;
  booking_id: string;
  date: string;
  gr_number: string;
  bill_number: string | null;
  lorry_number: string;
  driver_number: string | null;
  owner_name: string;
  from_location: string;
  to_location: string;
  freight: number;
  advance: number;
  balance: number;
  other_expenses: number;
  total_balance: number;
  pod_status: string;
  payment_status: string;
}

const VehicleHiring = () => {
  const [records, setRecords] = useState<VehicleHiring[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VehicleHiring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleHiring | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchRecords();
    checkUserRole();
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
        .from("vehicle_hiring_details")
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
        record.gr_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.lorry_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("vehicle_hiring_details")
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

  const handleEdit = (record: VehicleHiring) => {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vehicle Hiring Details</h1>
            <p className="text-muted-foreground">
              Manage vehicle hiring records and payments
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Record
          </Button>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Booking ID, GR Number, or Lorry Number..."
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
          <div className="overflow-x-auto">
            <Card>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Booking ID</th>
                    <th className="p-3 text-left text-sm font-medium">Date</th>
                    <th className="p-3 text-left text-sm font-medium">GR Number</th>
                    <th className="p-3 text-left text-sm font-medium">Lorry Number</th>
                    <th className="p-3 text-left text-sm font-medium">Route</th>
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
                      <td className="p-3 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{record.gr_number}</td>
                      <td className="p-3 text-sm">{record.lorry_number}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {record.from_location} → {record.to_location}
                      </td>
                      <td className="p-3 text-sm text-right">₹{record.freight.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right font-medium">
                        ₹{record.total_balance.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={record.pod_status === "Completed" ? "secondary" : "destructive"}>
                          {record.pod_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={record.payment_status === "Completed" ? "secondary" : "destructive"}>
                          {record.payment_status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {userRole === "admin" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(record)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(record.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
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

        {isFormOpen && (
          <VehicleHiringForm
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
                This action cannot be undone. This will permanently delete the record.
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

export default VehicleHiring;
