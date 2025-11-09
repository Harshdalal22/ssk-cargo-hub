import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, FileText, Share2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateLRPDF } from "@/lib/lrPdfGenerator";
import { Card } from "@/components/ui/card";

interface LRListProps {
  onEdit: (lr: any) => void;
}

export const LRList = ({ onEdit }: LRListProps) => {
  const [lrs, setLRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadLRs();
    
    // Real-time subscription
    const channel = supabase
      .channel('lr-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lr_details' }, (payload) => {
        console.log('Real-time LR update received:', payload);
        loadLRs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLRs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lr_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Loaded LRs:", data);
      setLRs(data || []);
    } catch (error: any) {
      toast({ title: "Error loading LRs", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this LR?")) return;

    try {
      const { error } = await supabase
        .from("lr_details")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "LR deleted successfully" });
      loadLRs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDownloadPDF = async (lr: any) => {
    try {
      console.log("Generating PDF for LR:", lr);
      await generateLRPDF(lr);
      toast({ title: "PDF generated successfully" });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({ title: "Error generating PDF", description: error.message, variant: "destructive" });
    }
  };

  const handleShareWhatsApp = async (lr: any) => {
    try {
      const message = `LR Details:\nLR No: ${lr.lr_no}\nTruck: ${lr.truck_no}\nFrom: ${lr.from_place}\nTo: ${lr.to_place}\nWeight: ${lr.weight} MT\nFreight: ₹${lr.freight}`;
      const phone = lr.consignee_contact || lr.consignor_contact;
      if (!phone) {
        toast({ title: "No contact number found", variant: "destructive" });
        return;
      }
      const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      // Update sharing log
      await supabase
        .from("lr_details")
        .update({ whatsapp_sent: true, whatsapp_sent_at: new Date().toISOString() })
        .eq("id", lr.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredLRs = lrs.filter(lr =>
    lr.lr_no?.toLowerCase().includes(search.toLowerCase()) ||
    lr.truck_no?.toLowerCase().includes(search.toLowerCase()) ||
    lr.from_place?.toLowerCase().includes(search.toLowerCase()) ||
    lr.to_place?.toLowerCase().includes(search.toLowerCase()) ||
    lr.consignor_name?.toLowerCase().includes(search.toLowerCase()) ||
    lr.consignee_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">View LR Details</h2>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Show</span>
            <select className="border rounded px-2 py-1">
              <option>50</option>
              <option>100</option>
              <option>200</option>
            </select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SR.NO</TableHead>
                <TableHead>LR NO</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>TRUCK NO</TableHead>
                <TableHead>FROM</TableHead>
                <TableHead>TO</TableHead>
                <TableHead>CONSIGNOR</TableHead>
                <TableHead>CONSIGNEE</TableHead>
                <TableHead>AGENT</TableHead>
                <TableHead>WEIGHT</TableHead>
                <TableHead>FREIGHT</TableHead>
                <TableHead>CREATED BY</TableHead>
                <TableHead>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8">
                    NO DATA AVAILABLE IN TABLE
                  </TableCell>
                </TableRow>
              ) : (
                filteredLRs.map((lr, idx) => (
                  <TableRow key={lr.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="text-primary font-medium">{lr.lr_no}</TableCell>
                    <TableCell>{new Date(lr.date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>{lr.truck_no}</TableCell>
                    <TableCell>{lr.from_place}</TableCell>
                    <TableCell>{lr.to_place}</TableCell>
                    <TableCell>{lr.consignor_name}</TableCell>
                    <TableCell>{lr.consignee_name}</TableCell>
                    <TableCell>{lr.agent || '-'}</TableCell>
                    <TableCell>{lr.weight}</TableCell>
                    <TableCell>{lr.freight?.toFixed(2)}</TableCell>
                    <TableCell>SSK</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => onEdit(lr)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleShareWhatsApp(lr)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleDownloadPDF(lr)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(lr.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing 0 to 0 of 0 entries</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
