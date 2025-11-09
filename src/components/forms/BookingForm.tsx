import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

interface Payment {
  id?: string;
  amount: string;
  payment_date: string;
  notes?: string;
}

const BookingForm = ({ isOpen, onClose, editData }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [formData, setFormData] = useState({
    booking_id: "",
    party_name: "",
    date: "",
    gr_number: "",
    bill_number: "",
    lorry_number: "",
    lorry_type: "Open",
    weight: "",
    from_location: "",
    to_location: "",
    freight: "",
    advance: "",
    other_expenses: "",
    pod_received_status: "Not Received",
    pod_received_date: "",
    payment_status: "Pending",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        booking_id: editData.booking_id || "",
        party_name: editData.party_name || "",
        date: editData.date || "",
        gr_number: editData.gr_number || "",
        bill_number: editData.bill_number || "",
        lorry_number: editData.lorry_number || "",
        lorry_type: editData.lorry_type || "Open",
        weight: editData.weight?.toString() || "",
        from_location: editData.from_location || "",
        to_location: editData.to_location || "",
        freight: editData.freight?.toString() || "",
        advance: editData.advance?.toString() || "",
        other_expenses: editData.other_expenses?.toString() || "",
        pod_received_status: editData.pod_received_status || "Not Received",
        pod_received_date: editData.pod_received_date || "",
        payment_status: editData.payment_status || "Pending",
      });
      fetchPayments(editData.id);
    } else {
      generateBookingId();
      setPayments([{ amount: "", payment_date: new Date().toISOString().split('T')[0], notes: "" }]);
    }
  }, [editData, isOpen]);

  const fetchVehicles = async () => {
    const { data } = await supabase.from('vehicle_fleet').select('*').order('lorry_number');
    if (data) setVehicles(data);
  };

  const fetchPayments = async (recordId: string) => {
    const { data } = await supabase
      .from('advance_payments')
      .select('*')
      .eq('record_type', 'booking')
      .eq('record_id', recordId)
      .order('payment_date', { ascending: false });

    if (data && data.length > 0) {
      setPayments(data.map(p => ({
        id: p.id,
        amount: p.amount.toString(),
        payment_date: p.payment_date,
        notes: p.notes || ""
      })));
    } else {
      setPayments([{ amount: "", payment_date: new Date().toISOString().split('T')[0], notes: "" }]);
    }
  };

  const generateBookingId = async () => {
    const { data, error } = await supabase.rpc('generate_booking_id');
    if (data && !error) {
      setFormData(prev => ({ ...prev, booking_id: data }));
    }
  };

  const addPayment = () => {
    setPayments([...payments, { amount: "", payment_date: new Date().toISOString().split('T')[0], notes: "" }]);
  };

  const removePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: keyof Payment, value: string) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const getTotalPayments = () => {
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const calculatePaymentStatus = () => {
    const freight = parseFloat(formData.freight) || 0;
    const totalPaid = getTotalPayments();
    return totalPaid >= freight ? "Completed" : "Pending";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totalPayments = getTotalPayments();
      const calculatedPaymentStatus = calculatePaymentStatus();

      const dataToSubmit = {
        booking_id: formData.booking_id,
        party_name: formData.party_name,
        date: formData.date,
        gr_number: formData.gr_number,
        bill_number: formData.bill_number || null,
        lorry_number: formData.lorry_number,
        lorry_type: formData.lorry_type,
        weight: parseFloat(formData.weight) || 0,
        from_location: formData.from_location,
        to_location: formData.to_location,
        freight: parseFloat(formData.freight) || 0,
        advance: totalPayments,
        other_expenses: parseFloat(formData.other_expenses) || 0,
        pod_received_status: formData.pod_received_status,
        pod_received_date: formData.pod_received_status === "Received" ? formData.pod_received_date : null,
        payment_status: calculatedPaymentStatus,
        created_by: user.id,
      };

      let recordId: string;

      if (editData) {
        const { error } = await supabase
          .from("booking_register")
          .update(dataToSubmit)
          .eq("id", editData.id);

        if (error) throw error;
        recordId = editData.id;

        await supabase
          .from('advance_payments')
          .delete()
          .eq('record_type', 'booking')
          .eq('record_id', recordId);
      } else {
        const { data: insertedData, error } = await supabase
          .from("booking_register")
          .insert([dataToSubmit])
          .select()
          .single();

        if (error) throw error;
        recordId = insertedData.id;
      }

      const validPayments = payments.filter(p => parseFloat(p.amount) > 0);
      if (validPayments.length > 0) {
        const paymentsToInsert = validPayments.map(p => ({
          record_type: 'booking',
          record_id: recordId,
          amount: parseFloat(p.amount),
          payment_date: p.payment_date,
          notes: p.notes || null,
          created_by: user.id
        }));

        const { error: paymentError } = await supabase
          .from('advance_payments')
          .insert(paymentsToInsert);

        if (paymentError) throw paymentError;
      }

      toast.success(editData ? "Booking updated successfully" : "Booking added successfully");
      
      // Small delay to ensure real-time update has propagated
      await new Promise(resolve => setTimeout(resolve, 300));
      onClose();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Add"} Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_id">Booking ID</Label>
              <Input
                id="booking_id"
                value={formData.booking_id}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party_name">Party Name *</Label>
              <Input
                id="party_name"
                value={formData.party_name}
                onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gr_number">GR Number *</Label>
              <Input
                id="gr_number"
                value={formData.gr_number}
                onChange={(e) => setFormData({ ...formData, gr_number: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill_number">Bill Number</Label>
            <Input
              id="bill_number"
              value={formData.bill_number}
              onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lorry_number">Lorry Number *</Label>
              <Select
                value={formData.lorry_number}
                onValueChange={(value) => {
                  const vehicle = vehicles.find(v => v.lorry_number === value);
                  setFormData({
                    ...formData,
                    lorry_number: value,
                    lorry_type: vehicle?.lorry_type || formData.lorry_type
                  });
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.lorry_number}>
                      {vehicle.lorry_number} ({vehicle.lorry_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lorry_type">Lorry Type</Label>
              <Input
                id="lorry_type"
                value={formData.lorry_type}
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_location">From *</Label>
              <Input
                id="from_location"
                value={formData.from_location}
                onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_location">To *</Label>
              <Input
                id="to_location"
                value={formData.to_location}
                onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="freight">Freight (₹) *</Label>
              <Input
                id="freight"
                type="number"
                step="0.01"
                value={formData.freight}
                onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_expenses">Other Expenses (₹)</Label>
              <Input
                id="other_expenses"
                type="number"
                step="0.01"
                value={formData.other_expenses}
                onChange={(e) => setFormData({ ...formData, other_expenses: e.target.value })}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Advance Payments</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    Total: <span className="font-semibold">₹{getTotalPayments().toLocaleString()}</span>
                  </div>
                  <Button type="button" size="sm" onClick={addPayment} variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Amount (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={payment.amount}
                        onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={payment.payment_date}
                        onChange={(e) => updatePayment(index, 'payment_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Notes</Label>
                      <Input
                        placeholder="Optional notes"
                        value={payment.notes}
                        onChange={(e) => updatePayment(index, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                  {payments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => removePayment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t">
                <Badge variant={calculatePaymentStatus() === "Completed" ? "secondary" : "destructive"}>
                  Payment Status: {calculatePaymentStatus()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pod_received_status">POD Received</Label>
              <Select
                value={formData.pod_received_status}
                onValueChange={(value) => setFormData({
                  ...formData,
                  pod_received_status: value,
                  pod_received_date: value === "Not Received" ? "" : formData.pod_received_date
                })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="Not Received">Not Received</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.pod_received_status === "Received" && (
              <div className="space-y-2">
                <Label htmlFor="pod_received_date">POD Received Date *</Label>
                <Input
                  id="pod_received_date"
                  type="date"
                  value={formData.pod_received_date}
                  onChange={(e) => setFormData({ ...formData, pod_received_date: e.target.value })}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editData ? "Update" : "Add"} Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
