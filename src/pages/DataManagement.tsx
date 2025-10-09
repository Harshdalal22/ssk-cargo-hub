import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Search, FileSpreadsheet, FileText, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import VehicleHiringForm from "@/components/forms/VehicleHiringForm";
import BookingForm from "@/components/forms/BookingForm";
import { CustomerDetailsForm } from "@/components/forms/CustomerDetailsForm";
import { VehicleFleetForm } from "@/components/forms/VehicleFleetForm";
import { DriverInformationForm } from "@/components/forms/DriverInformationForm";
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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
}

const DataManagement = () => {
  const [vehicleRecords, setVehicleRecords] = useState<VehicleHiring[]>([]);
  const [bookingRecords, setBookingRecords] = useState<Booking[]>([]);
  const [customerRecords, setCustomerRecords] = useState<any[]>([]);
  const [fleetRecords, setFleetRecords] = useState<any[]>([]);
  const [driverRecords, setDriverRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isFleetFormOpen, setIsFleetFormOpen] = useState(false);
  const [isDriverFormOpen, setIsDriverFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleHiring | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingFleet, setEditingFleet] = useState<any>(null);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'vehicle' | 'booking' | 'customer' | 'fleet' | 'driver' | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchAllRecords();
    checkUserRole();

    // Real-time subscriptions
    const vehicleChannel = supabase
      .channel('vehicle-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_hiring_details' }, () => {
        fetchVehicleRecords();
      })
      .subscribe();

    const bookingChannel = supabase
      .channel('booking-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_register' }, () => {
        fetchBookingRecords();
      })
      .subscribe();

    const customerChannel = supabase
      .channel('customer-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_details' }, () => {
        fetchCustomerRecords();
      })
      .subscribe();

    const fleetChannel = supabase
      .channel('fleet-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_fleet' }, () => {
        fetchFleetRecords();
      })
      .subscribe();

    const driverChannel = supabase
      .channel('driver-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_information' }, () => {
        fetchDriverRecords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(vehicleChannel);
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(customerChannel);
      supabase.removeChannel(fleetChannel);
      supabase.removeChannel(driverChannel);
    };
  }, []);

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

  const fetchAllRecords = async () => {
    await Promise.all([
      fetchVehicleRecords(), 
      fetchBookingRecords(),
      fetchCustomerRecords(),
      fetchFleetRecords(),
      fetchDriverRecords()
    ]);
    setIsLoading(false);
  };

  const fetchCustomerRecords = async () => {
    const { data } = await supabase
      .from("customer_details")
      .select("*")
      .order("created_at", { ascending: false });
    setCustomerRecords(data || []);
  };

  const fetchFleetRecords = async () => {
    const { data } = await supabase
      .from("vehicle_fleet")
      .select("*")
      .order("created_at", { ascending: false });
    setFleetRecords(data || []);
  };

  const fetchDriverRecords = async () => {
    const { data } = await supabase
      .from("driver_information")
      .select("*")
      .order("created_at", { ascending: false });
    setDriverRecords(data || []);
  };

  const fetchVehicleRecords = async () => {
    const { data, error } = await supabase
      .from("vehicle_hiring_details")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setVehicleRecords(data || []);
  };

  const fetchBookingRecords = async () => {
    const { data, error } = await supabase
      .from("booking_register")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setBookingRecords(data || []);
  };

  const exportToExcel = (type: 'vehicle' | 'booking') => {
    const data = type === 'vehicle' ? vehicleRecords : bookingRecords;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'vehicle' ? 'Vehicle Hiring' : 'Bookings');
    XLSX.writeFile(wb, `${type}_records_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel file downloaded successfully");
  };

  const exportToPDF = (type: 'vehicle' | 'booking') => {
    const doc = new jsPDF('landscape');
    const title = type === 'vehicle' ? 'Vehicle Hiring Details' : 'Booking Register';
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    if (type === 'vehicle') {
      autoTable(doc, {
        head: [['Booking ID', 'Date', 'GR Number', 'Lorry Number', 'From', 'To', 'Freight', 'Total Balance', 'POD Status', 'Payment']],
        body: vehicleRecords.map(r => [
          r.booking_id,
          new Date(r.date).toLocaleDateString(),
          r.gr_number,
          r.lorry_number,
          r.from_location,
          r.to_location,
          `₹${r.freight}`,
          `₹${r.total_balance}`,
          r.pod_status,
          r.payment_status
        ]),
        startY: 25,
      });
    } else {
      autoTable(doc, {
        head: [['Booking ID', 'Party Name', 'Date', 'GR Number', 'Lorry', 'From', 'To', 'Weight', 'Freight', 'Total Balance', 'Payment']],
        body: bookingRecords.map(r => [
          r.booking_id,
          r.party_name,
          new Date(r.date).toLocaleDateString(),
          r.gr_number,
          r.lorry_number,
          r.from_location,
          r.to_location,
          `${r.weight} kg`,
          `₹${r.freight}`,
          `₹${r.total_balance}`,
          r.payment_status
        ]),
        startY: 25,
      });
    }
    
    doc.save(`${type}_records_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF file downloaded successfully");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, type: 'vehicle' | 'booking') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          toast.error("You must be logged in to import data");
          return;
        }

        const table = type === 'vehicle' ? 'vehicle_hiring_details' : 'booking_register';
        const records = jsonData.map((row: any) => ({
          ...row,
          created_by: user.user.id,
          date: new Date(row.date).toISOString().split('T')[0],
        }));

        const { error } = await supabase.from(table).insert(records);
        
        if (error) throw error;
        toast.success(`Successfully imported ${records.length} records`);
        fetchAllRecords();
      } catch (error) {
        toast.error("Error importing data. Please check the file format.");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const filterRecords = (records: any[], term: string) => {
    if (!term) return records;
    return records.filter(r => 
      JSON.stringify(r).toLowerCase().includes(term.toLowerCase())
    );
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      const table = deleteType === 'vehicle' ? 'vehicle_hiring_details' : 'booking_register';
      const { error } = await supabase.from(table).delete().eq("id", deleteId);
      
      if (error) throw error;
      toast.success("Record deleted successfully");
      fetchAllRecords();
    } catch (error) {
      toast.error("Error deleting record");
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleEditVehicle = (record: VehicleHiring) => {
    setEditingVehicle(record);
    setIsVehicleFormOpen(true);
  };

  const handleEditBooking = (record: Booking) => {
    setEditingBooking(record);
    setIsBookingFormOpen(true);
  };

  const handleVehicleFormClose = () => {
    setIsVehicleFormOpen(false);
    setEditingVehicle(null);
    fetchAllRecords();
  };

  const handleBookingFormClose = () => {
    setIsBookingFormOpen(false);
    setEditingBooking(null);
    fetchAllRecords();
  };

  const VehicleTable = ({ data }: { data: VehicleHiring[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-sm font-medium">Booking ID</th>
            <th className="border p-2 text-sm font-medium">Date</th>
            <th className="border p-2 text-sm font-medium">GR Number</th>
            <th className="border p-2 text-sm font-medium">Bill Number</th>
            <th className="border p-2 text-sm font-medium">Lorry Number</th>
            <th className="border p-2 text-sm font-medium">Driver Number</th>
            <th className="border p-2 text-sm font-medium">Owner Name</th>
            <th className="border p-2 text-sm font-medium">From</th>
            <th className="border p-2 text-sm font-medium">To</th>
            <th className="border p-2 text-sm font-medium">Freight</th>
            <th className="border p-2 text-sm font-medium">Advance</th>
            <th className="border p-2 text-sm font-medium">Balance</th>
            <th className="border p-2 text-sm font-medium">Other Expenses</th>
            <th className="border p-2 text-sm font-medium">Total Balance</th>
            <th className="border p-2 text-sm font-medium">POD Status</th>
            <th className="border p-2 text-sm font-medium">Payment Status</th>
            <th className="border p-2 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record, idx) => (
            <tr key={idx} className="hover:bg-muted/30">
              <td className="border p-2 text-sm">{record.booking_id}</td>
              <td className="border p-2 text-sm">{new Date(record.date).toLocaleDateString()}</td>
              <td className="border p-2 text-sm">{record.gr_number}</td>
              <td className="border p-2 text-sm">{record.bill_number || '-'}</td>
              <td className="border p-2 text-sm">{record.lorry_number}</td>
              <td className="border p-2 text-sm">{record.driver_number || '-'}</td>
              <td className="border p-2 text-sm">{record.owner_name}</td>
              <td className="border p-2 text-sm">{record.from_location}</td>
              <td className="border p-2 text-sm">{record.to_location}</td>
              <td className="border p-2 text-sm text-right">₹{record.freight.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right">₹{record.advance.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right">₹{record.balance.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right">₹{record.other_expenses.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right font-medium">₹{record.total_balance.toLocaleString()}</td>
              <td className="border p-2 text-sm text-center">
                <Badge variant={record.pod_status === "Completed" ? "secondary" : "destructive"}>
                  {record.pod_status}
                </Badge>
              </td>
              <td className="border p-2 text-sm text-center">
                <Badge variant={record.payment_status === "Completed" ? "secondary" : "destructive"}>
                  {record.payment_status}
                </Badge>
              </td>
              <td className="border p-2">
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditVehicle(record)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {userRole === "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(record.id);
                        setDeleteType('vehicle');
                      }}
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
    </div>
  );

  const BookingTable = ({ data }: { data: Booking[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-sm font-medium">Booking ID</th>
            <th className="border p-2 text-sm font-medium">Party Name</th>
            <th className="border p-2 text-sm font-medium">Date</th>
            <th className="border p-2 text-sm font-medium">GR Number</th>
            <th className="border p-2 text-sm font-medium">Bill Number</th>
            <th className="border p-2 text-sm font-medium">Lorry Number</th>
            <th className="border p-2 text-sm font-medium">Lorry Type</th>
            <th className="border p-2 text-sm font-medium">Weight</th>
            <th className="border p-2 text-sm font-medium">From</th>
            <th className="border p-2 text-sm font-medium">To</th>
            <th className="border p-2 text-sm font-medium">Freight</th>
            <th className="border p-2 text-sm font-medium">Advance</th>
            <th className="border p-2 text-sm font-medium">Balance</th>
            <th className="border p-2 text-sm font-medium">Other Expenses</th>
            <th className="border p-2 text-sm font-medium">Total Balance</th>
            <th className="border p-2 text-sm font-medium">Payment Status</th>
            <th className="border p-2 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record, idx) => (
            <tr key={idx} className="hover:bg-muted/30">
              <td className="border p-2 text-sm">{record.booking_id}</td>
              <td className="border p-2 text-sm">{record.party_name}</td>
              <td className="border p-2 text-sm">{new Date(record.date).toLocaleDateString()}</td>
              <td className="border p-2 text-sm">{record.gr_number}</td>
              <td className="border p-2 text-sm">{record.bill_number || '-'}</td>
              <td className="border p-2 text-sm">{record.lorry_number}</td>
              <td className="border p-2 text-sm">{record.lorry_type}</td>
              <td className="border p-2 text-sm text-right">{record.weight.toLocaleString()} kg</td>
              <td className="border p-2 text-sm">{record.from_location}</td>
              <td className="border p-2 text-sm">{record.to_location}</td>
              <td className="border p-2 text-sm text-right">₹{record.freight.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right">₹{record.advance.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right">₹{record.balance.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right">₹{record.other_expenses.toLocaleString()}</td>
              <td className="border p-2 text-sm text-right font-medium">₹{record.total_balance.toLocaleString()}</td>
              <td className="border p-2 text-sm text-center">
                <Badge variant={record.payment_status === "Completed" ? "secondary" : "destructive"}>
                  {record.payment_status}
                </Badge>
              </td>
              <td className="border p-2">
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditBooking(record)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {userRole === "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(record.id);
                        setDeleteType('booking');
                      }}
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
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1 lg:mb-2">Data Management</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            View, import, and export all records in Excel-like format
          </p>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Tabs defaultValue="vehicle" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-full lg:grid lg:grid-cols-5 gap-1 lg:gap-2 min-w-max lg:min-w-0">
              <TabsTrigger value="vehicle" className="text-xs lg:text-sm whitespace-nowrap">Vehicle Hiring</TabsTrigger>
              <TabsTrigger value="booking" className="text-xs lg:text-sm whitespace-nowrap">Booking Register</TabsTrigger>
              <TabsTrigger value="customer" className="text-xs lg:text-sm whitespace-nowrap">Customer Details</TabsTrigger>
              <TabsTrigger value="fleet" className="text-xs lg:text-sm whitespace-nowrap">Vehicle Fleet</TabsTrigger>
              <TabsTrigger value="driver" className="text-xs lg:text-sm whitespace-nowrap">Driver Info</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="vehicle" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <CardTitle className="text-lg lg:text-xl">Vehicle Hiring Records ({vehicleRecords.length})</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setIsVehicleFormOpen(true)} className="text-xs lg:text-sm">
                      <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Add New
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToExcel('vehicle')} className="text-xs lg:text-sm">
                      <FileSpreadsheet className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToPDF('vehicle')} className="text-xs lg:text-sm">
                      <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs lg:text-sm">
                      <label>
                        <Upload className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        Import
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleImport(e, 'vehicle')}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <VehicleTable data={filterRecords(vehicleRecords, searchTerm)} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <CardTitle className="text-lg lg:text-xl">Booking Records ({bookingRecords.length})</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setIsBookingFormOpen(true)} className="text-xs lg:text-sm">
                      <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Add New
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToExcel('booking')} className="text-xs lg:text-sm">
                      <FileSpreadsheet className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToPDF('booking')} className="text-xs lg:text-sm">
                      <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs lg:text-sm">
                      <label>
                        <Upload className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        Import
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleImport(e, 'booking')}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <BookingTable data={filterRecords(bookingRecords, searchTerm)} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Details ({customerRecords.length})</CardTitle>
                  <Button size="sm" onClick={() => setIsCustomerFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Customer ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Company</th>
                          <th className="text-left p-2">Phone</th>
                          <th className="text-left p-2">Email</th>
                          {userRole === "admin" && <th className="text-left p-2">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {customerRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{record.customer_id}</td>
                            <td className="p-2">{record.customer_name}</td>
                            <td className="p-2">{record.company_name || '-'}</td>
                            <td className="p-2">{record.phone_number}</td>
                            <td className="p-2">{record.email || '-'}</td>
                            {userRole === "admin" && (
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingCustomer(record);
                                    setIsCustomerFormOpen(true);
                                  }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setDeleteId(record.id);
                                    setDeleteType('customer');
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vehicle Fleet ({fleetRecords.length})</CardTitle>
                  <Button size="sm" onClick={() => setIsFleetFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Vehicle ID</th>
                          <th className="text-left p-2">Lorry Number</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Owner</th>
                          <th className="text-left p-2">Status</th>
                          {userRole === "admin" && <th className="text-left p-2">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {fleetRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{record.vehicle_id}</td>
                            <td className="p-2">{record.lorry_number}</td>
                            <td className="p-2">{record.lorry_type}</td>
                            <td className="p-2">{record.owner_name}</td>
                            <td className="p-2">
                              <Badge variant={record.status === 'Available' ? 'default' : 'secondary'}>
                                {record.status}
                              </Badge>
                            </td>
                            {userRole === "admin" && (
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingFleet(record);
                                    setIsFleetFormOpen(true);
                                  }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setDeleteId(record.id);
                                    setDeleteType('fleet');
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="driver" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Driver Information ({driverRecords.length})</CardTitle>
                  <Button size="sm" onClick={() => setIsDriverFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Driver
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Driver ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Phone</th>
                          <th className="text-left p-2">License</th>
                          <th className="text-left p-2">Status</th>
                          {userRole === "admin" && <th className="text-left p-2">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {driverRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{record.driver_id}</td>
                            <td className="p-2">{record.driver_name}</td>
                            <td className="p-2">{record.phone_number}</td>
                            <td className="p-2">{record.license_number}</td>
                            <td className="p-2">
                              <Badge variant={record.status === 'Available' ? 'default' : 'secondary'}>
                                {record.status}
                              </Badge>
                            </td>
                            {userRole === "admin" && (
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingDriver(record);
                                    setIsDriverFormOpen(true);
                                  }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    setDeleteId(record.id);
                                    setDeleteType('driver');
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isVehicleFormOpen && (
          <VehicleHiringForm
            isOpen={isVehicleFormOpen}
            onClose={handleVehicleFormClose}
            editData={editingVehicle}
          />
        )}

        {isBookingFormOpen && (
          <BookingForm
            isOpen={isBookingFormOpen}
            onClose={handleBookingFormClose}
            editData={editingBooking}
          />
        )}

        {isCustomerFormOpen && (
          <CustomerDetailsForm
            isOpen={isCustomerFormOpen}
            onClose={() => {
              setIsCustomerFormOpen(false);
              setEditingCustomer(null);
              fetchCustomerRecords();
            }}
            editData={editingCustomer}
          />
        )}

        {isFleetFormOpen && (
          <VehicleFleetForm
            isOpen={isFleetFormOpen}
            onClose={() => {
              setIsFleetFormOpen(false);
              setEditingFleet(null);
              fetchFleetRecords();
            }}
            editData={editingFleet}
          />
        )}

        {isDriverFormOpen && (
          <DriverInformationForm
            isOpen={isDriverFormOpen}
            onClose={() => {
              setIsDriverFormOpen(false);
              setEditingDriver(null);
              fetchDriverRecords();
            }}
            editData={editingDriver}
          />
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}>
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

export default DataManagement;
