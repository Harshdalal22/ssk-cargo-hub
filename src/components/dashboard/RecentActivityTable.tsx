import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ActivityRecord {
  id: string;
  type: string;
  party_owner: string;
  date: string;
  amount: number;
  status: string;
}

interface RecentActivityTableProps {
  activities: ActivityRecord[];
}

const RecentActivityTable = ({ activities }: RecentActivityTableProps) => {
  const exportToCSV = () => {
    const headers = ['Booking ID', 'Type', 'Party/Owner', 'Date', 'Amount', 'Status'];
    const csvData = activities.map(a => [a.id, a.type, a.party_owner, a.date, a.amount, a.status]);
    
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recent-activity.csv';
    a.click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      activities.map(a => ({
        'Booking ID': a.id,
        'Type': a.type,
        'Party/Owner': a.party_owner,
        'Date': a.date,
        'Amount': a.amount,
        'Status': a.status
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Activity');
    XLSX.writeFile(workbook, 'recent-activity.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Recent Activity', 14, 15);
    
    autoTable(doc, {
      startY: 20,
      head: [['Booking ID', 'Type', 'Party/Owner', 'Date', 'Amount', 'Status']],
      body: activities.map(a => [a.id, a.type, a.party_owner, a.date, `₹${a.amount.toLocaleString('en-IN')}`, a.status]),
    });
    
    doc.save('recent-activity.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Recent Activity</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">Latest bookings and vehicle hiring records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="text-xs lg:text-sm">
            <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel} className="text-xs lg:text-sm">
            <Download className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF} className="text-xs lg:text-sm">
            <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            PDF
          </Button>
        </div>
      </div>
      
      <div className="hidden lg:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Booking ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Party/Owner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No recent activity found
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{activity.id}</TableCell>
                  <TableCell>
                    <Badge variant={activity.type === 'Booking' ? 'default' : 'secondary'}>
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.party_owner}</TableCell>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell>₹{activity.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={
                      activity.status === 'Pending' ? 'warning' :
                      activity.status === 'Completed' ? 'default' : 'secondary'
                    }>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {activities.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No recent activity found
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Booking ID</p>
                    <p className="text-sm font-medium">{activity.id}</p>
                  </div>
                  <Badge variant={activity.type === 'Booking' ? 'default' : 'secondary'}>
                    {activity.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Party/Owner</p>
                    <p className="text-sm font-medium">{activity.party_owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{activity.date}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-semibold">₹{activity.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <Badge variant={
                    activity.status === 'Pending' ? 'warning' :
                    activity.status === 'Completed' ? 'default' : 'secondary'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivityTable;
