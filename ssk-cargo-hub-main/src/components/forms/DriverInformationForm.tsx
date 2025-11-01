import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DriverInformationFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

export const DriverInformationForm = ({ isOpen, onClose, editData }: DriverInformationFormProps) => {
  const [formData, setFormData] = useState({
    driver_id: "",
    driver_name: "",
    phone_number: "",
    license_number: "",
    license_expiry: "",
    experience_years: "",
    current_vehicle: "",
    status: "Available",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        driver_id: editData.driver_id || "",
        driver_name: editData.driver_name || "",
        phone_number: editData.phone_number || "",
        license_number: editData.license_number || "",
        license_expiry: editData.license_expiry || "",
        experience_years: editData.experience_years || "",
        current_vehicle: editData.current_vehicle || "",
        status: editData.status || "Available",
        address: editData.address || "",
      });
    } else {
      generateDriverId();
    }
  }, [editData, isOpen]);

  const generateDriverId = async () => {
    const { count } = await supabase
      .from('driver_information')
      .select('*', { count: 'exact', head: true });
    
    const newId = `DRV${String((count || 0) + 1).padStart(6, '0')}`;
    setFormData(prev => ({ ...prev, driver_id: newId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const dataToSubmit = {
        driver_id: formData.driver_id,
        driver_name: formData.driver_name,
        phone_number: formData.phone_number,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry,
        experience_years: formData.experience_years ? parseFloat(formData.experience_years) : null,
        current_vehicle: formData.current_vehicle || null,
        status: formData.status,
        address: formData.address || null,
        created_by: user.id,
      };

      if (editData) {
        const { error } = await supabase
          .from('driver_information')
          .update(dataToSubmit)
          .eq('id', editData.id);

        if (error) throw error;
        toast.success("Driver updated successfully");
      } else {
        const { error } = await supabase
          .from('driver_information')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Driver added successfully");
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
          <DialogTitle>{editData ? "Edit Driver" : "Add Driver"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Driver ID</Label>
              <Input value={formData.driver_id} disabled />
            </div>
            <div>
              <Label>Driver Name *</Label>
              <Input
                required
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
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
              <Label>License Number *</Label>
              <Input
                required
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              />
            </div>
            <div>
              <Label>License Expiry *</Label>
              <Input
                required
                type="date"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </div>
            <div>
              <Label>Current Vehicle</Label>
              <Input
                value={formData.current_vehicle}
                onChange={(e) => setFormData({ ...formData, current_vehicle: e.target.value })}
              />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="On Duty">On Duty</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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