import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Search, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface VehicleHiring {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllRecords();

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

    return () => {
      supabase.removeChannel(vehicleChannel);
      supabase.removeChannel(bookingChannel);
    };
  }, []);

  const fetchAllRecords = async () => {
    await Promise.all([fetchVehicleRecords(), fetchBookingRecords()]);
    setIsLoading(false);
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
              <td className="border p-2 text-sm text-center">{record.pod_status}</td>
              <td className="border p-2 text-sm text-center">{record.payment_status}</td>
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
              <td className="border p-2 text-sm text-center">{record.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="vehicle">Vehicle Hiring Details</TabsTrigger>
            <TabsTrigger value="booking">Booking Register</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicle" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vehicle Hiring Records ({vehicleRecords.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportToExcel('vehicle')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToPDF('vehicle')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <label>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Excel
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
                <div className="flex items-center justify-between">
                  <CardTitle>Booking Records ({bookingRecords.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportToExcel('booking')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToPDF('booking')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <label>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Excel
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DataManagement;
