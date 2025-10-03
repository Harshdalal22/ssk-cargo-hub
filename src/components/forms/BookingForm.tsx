import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

const BookingForm = ({ isOpen, onClose, editData }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    payment_status: "Pending",
  });

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
        payment_status: editData.payment_status || "Pending",
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
        advance: parseFloat(formData.advance) || 0,
        other_expenses: parseFloat(formData.other_expenses) || 0,
        payment_status: formData.payment_status,
        created_by: user.id,
      };

      if (editData) {
        const { error } = await supabase
          .from("booking_register")
          .update(dataToSubmit)
          .eq("id", editData.id);

        if (error) throw error;
        toast.success("Booking updated successfully");
      } else {
        const { error } = await supabase
          .from("booking_register")
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Booking added successfully");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Add"} Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_id">Booking ID *</Label>
              <Input
                id="booking_id"
                value={formData.booking_id}
                onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                required
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
              <Input
                id="lorry_number"
                value={formData.lorry_number}
                onChange={(e) => setFormData({ ...formData, lorry_number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lorry_type">Lorry Type *</Label>
              <Select value={formData.lorry_type} onValueChange={(value) => setFormData({ ...formData, lorry_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="advance">Advance (₹) *</Label>
              <Input
                id="advance"
                type="number"
                step="0.01"
                value={formData.advance}
                onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
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
