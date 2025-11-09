import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LRForm } from "@/components/forms/LRForm";
import { LRList } from "@/components/lr/LRList";

const LRManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedLR, setSelectedLR] = useState<any>(null);

  const handleAddNew = () => {
    setSelectedLR(null);
    setShowForm(true);
  };

  const handleEdit = (lr: any) => {
    setSelectedLR(lr);
    setShowForm(true);
  };

  const handleFormClose = async () => {
    setShowForm(false);
    setSelectedLR(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">LR Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and share Lorry Receipts
            </p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New LR
          </Button>
        </div>

        {showForm ? (
          <LRForm
            lr={selectedLR}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        ) : (
          <LRList onEdit={handleEdit} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default LRManagement;
