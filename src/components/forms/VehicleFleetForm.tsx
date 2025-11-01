import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleFleetFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

export const VehicleFleetForm = ({ isOpen, onClose, editData }: VehicleFleetFormProps) => {
  const [formData, setFormData] = useState({
    vehicle_id: "",
    lorry_number: "",
    lorry_type: "",
    capacity_tons: "",
    owner_name: "",
    owner_phone: "",
    registration_date: "",
    insurance_expiry: "",
    fitness_expiry: "",
    status: "Available",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        vehicle_id: editData.vehicle_id || "",
        lorry_number: editData.lorry_number || "",
        lorry_type: editData.lorry_type || "",
        capacity_tons: editData.capacity_tons || "",
        owner_name: editData.owner_name || "",
        owner_phone: editData.owner_phone || "",
        registration_date: editData.registration_date || "",
        insurance_expiry: editData.insurance_expiry || "",
        fitness_expiry: editData.fitness_expiry || "",
        status: editData.status || "Available",
      });
    } else {
      generateVehicleId();
    }
  }, [editData, isOpen]);

  const generateVehicleId = async () => {
    const { count } = await supabase
      .from('vehicle_fleet')
      .select('*', { count: 'exact', head: true });
    
    const newId = `VEH${String((count || 0) + 1).padStart(6, '0')}`;
    setFormData(prev => ({ ...prev, vehicle_id: newId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const dataToSubmit = {
        ...formData,
        capacity_tons: formData.capacity_tons ? parseFloat(formData.capacity_tons) : null,
        created_by: user.id,
      };

      if (editData) {
        const { error } = await supabase
          .from('vehicle_fleet')
          .update(dataToSubmit)
          .eq('id', editData.id);

        if (error) throw error;
        toast.success("Vehicle updated successfully");
      } else {
        const { error } = await supabase
          .from('vehicle_fleet')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Vehicle added successfully");
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
          <DialogTitle>{editData ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehicle ID</Label>
              <Input value={formData.vehicle_id} disabled />
            </div>
            <div>
              <Label>Lorry Number *</Label>
              <Input
                required
                value={formData.lorry_number}
                onChange={(e) => setFormData({ ...formData, lorry_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Lorry Type *</Label>
              <Input
                required
                value={formData.lorry_type}
                onChange={(e) => setFormData({ ...formData, lorry_type: e.target.value })}
              />
            </div>
            <div>
              <Label>Capacity (Tons)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.capacity_tons}
                onChange={(e) => setFormData({ ...formData, capacity_tons: e.target.value })}
              />
            </div>
            <div>
              <Label>Owner Name *</Label>
              <Input
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Owner Phone</Label>
              <Input
                value={formData.owner_phone}
                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Registration Date</Label>
              <Input
                type="date"
                value={formData.registration_date}
                onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Insurance Expiry</Label>
              <Input
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
              />
            </div>
            <div>
              <Label>Fitness Expiry</Label>
              <Input
                type="date"
                value={formData.fitness_expiry}
                onChange={(e) => setFormData({ ...formData, fitness_expiry: e.target.value })}
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
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
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