import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

export const CustomerDetailsForm = ({ isOpen, onClose, editData }: CustomerDetailsFormProps) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    company_name: "",
    phone_number: "",
    email: "",
    address: "",
    gst_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        customer_id: editData.customer_id || "",
        customer_name: editData.customer_name || "",
        company_name: editData.company_name || "",
        phone_number: editData.phone_number || "",
        email: editData.email || "",
        address: editData.address || "",
        gst_number: editData.gst_number || "",
      });
    } else {
      generateCustomerId();
    }
  }, [editData, isOpen]);

  const generateCustomerId = async () => {
    const { count } = await supabase
      .from('customer_details')
      .select('*', { count: 'exact', head: true });
    
    const newId = `CUST${String((count || 0) + 1).padStart(6, '0')}`;
    setFormData(prev => ({ ...prev, customer_id: newId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const dataToSubmit = {
        ...formData,
        created_by: user.id,
      };

      if (editData) {
        const { error } = await supabase
          .from('customer_details')
          .update(dataToSubmit)
          .eq('id', editData.id);

        if (error) throw error;
        toast.success("Customer updated successfully");
      } else {
        const { error } = await supabase
          .from('customer_details')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Customer added successfully");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer ID</Label>
              <Input value={formData.customer_id} disabled />
            </div>
            <div>
              <Label>Customer Name *</Label>
              <Input
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>GST Number</Label>
              <Input
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editData ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};