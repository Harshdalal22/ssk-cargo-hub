import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface LRFormProps {
  lr?: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  id: string;
  description: string;
  pcs: string;
  weight: string;
}

export const LRForm = ({ lr, onClose, onSuccess }: LRFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<ItemRow[]>([{ id: '1', description: '', pcs: '', weight: '' }]);

  useEffect(() => {
    loadCustomers();
    if (lr) {
      // Populate form with existing LR data
      Object.keys(lr).forEach(key => {
        if (key === 'date' || key === 'invoice_date' || key === 'po_date' || key === 'eway_bill_date' || key === 'eway_ex_date') {
          // Format dates for input fields
          if (lr[key]) {
            setValue(key, new Date(lr[key]).toISOString().split('T')[0]);
          }
        } else {
          setValue(key, lr[key]);
        }
      });
      if (lr.items && Array.isArray(lr.items)) {
        setItems(lr.items.map((item: any, idx: number) => ({ ...item, id: String(idx + 1) })));
      }
    } else {
      // For new LR, set placeholder text only
      setValue("lr_no", "Auto-generated on save");
    }
  }, [lr]);

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customer_details")
      .select("*")
      .order("customer_name");
    if (data) setCustomers(data);
  };

  const addItem = () => {
    setItems([...items, { id: String(items.length + 1), description: '', pcs: '', weight: '' }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemRow, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert empty strings to null for numeric and date fields
      const numericFields = ['invoice_amount', 'charged_weight', 'weight', 'freight', 'rate'];
      const dateFields = ['date', 'invoice_date', 'po_date', 'eway_bill_date', 'eway_ex_date'];
      const cleanedData = { ...data };
      
      numericFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === undefined) {
          cleanedData[field] = null;
        } else if (cleanedData[field]) {
          cleanedData[field] = parseFloat(cleanedData[field]);
        }
      });

      dateFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === undefined) {
          cleanedData[field] = null;
        }
      });

      // Remove lr_no from cleanedData - we'll handle it separately
      const { lr_no, ...dataWithoutLrNo } = cleanedData;

      const lrData = {
        ...dataWithoutLrNo,
        items: items.filter(item => item.description || item.pcs || item.weight),
        created_by: user.id,
      };

      if (lr?.id) {
        // When updating, use existing lr_no
        const { error } = await supabase
          .from("lr_details")
          .update(lrData)
          .eq("id", lr.id);
        if (error) throw error;
        console.log("LR updated successfully, ID:", lr.id);
        toast({ title: "LR updated successfully" });
      } else {
        // When creating new, generate fresh LR number at submission time
        const { data: newLRNo, error: lrNoError } = await supabase.rpc("generate_lr_number");
        if (lrNoError) throw lrNoError;
        console.log("Generated new LR number:", newLRNo);
        
        const { error } = await supabase
          .from("lr_details")
          .insert([{ ...lrData, lr_no: newLRNo }]);
        if (error) throw error;
        console.log("LR created successfully with number:", newLRNo);
        toast({ title: "LR created successfully", description: `LR Number: ${newLRNo}` });
      }
      
      // Small delay to ensure real-time update has propagated
      await new Promise(resolve => setTimeout(resolve, 300));
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>LR Type *</Label>
              <RadioGroup defaultValue="Original" onValueChange={(val) => setValue("lr_type", val)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Dummy" id="dummy" />
                  <Label htmlFor="dummy">Dummy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Original" id="original" />
                  <Label htmlFor="original">Original</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_no">Truck No *</Label>
              <Input id="truck_no" {...register("truck_no", { required: true })} placeholder="TRUCK NO" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lr_no">LR No *</Label>
              <Input 
                id="lr_no" 
                value={lr?.lr_no || "Auto-generated on save"} 
                placeholder="LR NO" 
                readOnly 
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input type="date" id="date" {...register("date", { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_logo_url">Company Logo (Optional)</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    id="company_logo_url"
                    {...register("company_logo_url")}
                    placeholder="https://example.com/logo.png or upload below"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a logo URL or upload a file below
                  </p>
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Convert to base64 for embedding in PDF
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setValue("company_logo_url", reader.result as string);
                          toast({ title: "Logo uploaded successfully" });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload logo image (JPG, PNG)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_place">From Place *</Label>
              <Input id="from_place" {...register("from_place", { required: true })} placeholder="FROM PLACE" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_place">To Place *</Label>
              <Input id="to_place" {...register("to_place", { required: true })} placeholder="TO PLACE" />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_no">Invoice</Label>
              <Input id="invoice_no" {...register("invoice_no")} placeholder="INVOICE" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_amount">Invoice Amount</Label>
              <Input type="number" id="invoice_amount" {...register("invoice_amount")} placeholder="INVOICE AMOUNT" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Input type="date" id="invoice_date" {...register("invoice_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eway_bill_no">Eway Bill No</Label>
              <Input id="eway_bill_no" {...register("eway_bill_no")} placeholder="EWAY BILL NO" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eway_bill_date">Eway Bill Date</Label>
              <Input type="date" id="eway_bill_date" {...register("eway_bill_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eway_ex_date">Eway Ex. Date</Label>
              <Input type="date" id="eway_ex_date" {...register("eway_ex_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="po_no">P.O. No</Label>
              <Input id="po_no" {...register("po_no")} placeholder="P.O. NO" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po_date">P.O. Date</Label>
              <Input type="date" id="po_date" {...register("po_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method_of_packing">Method of Packing</Label>
              <Input id="method_of_packing" {...register("method_of_packing")} placeholder="METHOD OF PACKING" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_of_delivery">Address of Delivery</Label>
              <Input id="address_of_delivery" {...register("address_of_delivery")} placeholder="ADDRESS OF DELIVERY" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="charged_weight">Charged Weight</Label>
              <Input type="number" id="charged_weight" {...register("charged_weight")} placeholder="CHARGED WEIGHT" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lorry_type">Lorry Type</Label>
              <Input id="lorry_type" {...register("lorry_type")} placeholder="LORRY TYPE" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_party">Billing Party</Label>
              <Input id="billing_party" {...register("billing_party")} placeholder="BILLING PARTY" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_paid_by">GST Paid By</Label>
            <Input id="gst_paid_by" {...register("gst_paid_by")} placeholder="GST PAID BY" />
          </div>

          {/* Consignor Section */}
          <div className="bg-destructive/10 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Consignor</h3>
            <div className="space-y-2">
              <Label htmlFor="consignor_name">Name *</Label>
              <Input 
                {...register("consignor_name", { required: true })} 
                placeholder="Enter or select consignor name"
                list="consignor-list"
              />
              <datalist id="consignor-list">
                {customers.map(c => (
                  <option key={c.id} value={c.customer_name} />
                ))}
              </datalist>
            </div>
            <Textarea {...register("consignor_address")} placeholder="Address" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("consignor_city")} placeholder="CITY" />
              <Input {...register("consignor_contact")} placeholder="CONTACT" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("consignor_pan")} placeholder="PAN" />
              <Input {...register("consignor_gst")} placeholder="GST" />
            </div>
          </div>

          {/* Consignee Section */}
          <div className="bg-destructive/10 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Consignee</h3>
            <div className="space-y-2">
              <Label htmlFor="consignee_name">Name *</Label>
              <Input 
                {...register("consignee_name", { required: true })} 
                placeholder="Enter or select consignee name"
                list="consignee-list"
              />
              <datalist id="consignee-list">
                {customers.map(c => (
                  <option key={c.id} value={c.customer_name} />
                ))}
              </datalist>
            </div>
            <Textarea {...register("consignee_address")} placeholder="Address" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("consignee_city")} placeholder="CITY" />
              <Input {...register("consignee_contact")} placeholder="CONTACT" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("consignee_pan")} placeholder="PAN" />
              <Input {...register("consignee_gst")} placeholder="GST" />
            </div>
          </div>

          {/* Billing To Section */}
          <div className="bg-destructive/10 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Billing To</h3>
            <div className="space-y-2">
              <Label htmlFor="billing_party_name">Name</Label>
              <Input 
                {...register("billing_party_name")} 
                placeholder="Enter or select billing party name"
                list="billing-list"
              />
              <datalist id="billing-list">
                {customers.map(c => (
                  <option key={c.id} value={c.customer_name} />
                ))}
              </datalist>
            </div>
            <Textarea {...register("billing_party_address")} placeholder="Address" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("billing_party_city")} placeholder="CITY" />
              <Input {...register("billing_party_contact")} placeholder="CONTACT" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("billing_party_pan")} placeholder="PAN" />
              <Input {...register("billing_party_gst")} placeholder="GST" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent">Agent</Label>
            <Input id="agent" {...register("agent")} placeholder="AGENT" />
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Items</Label>
              <Button type="button" size="sm" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">PCS</th>
                    <th className="p-2 text-left">Weight</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.pcs}
                          onChange={(e) => updateItem(item.id, 'pcs', e.target.value)}
                          placeholder="PCS"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.weight}
                          onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                          placeholder="Weight"
                        />
                      </td>
                      <td className="p-2">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weight and Freight */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (MT) *</Label>
              <Input type="number" step="0.01" id="weight" {...register("weight", { required: true })} placeholder="WEIGHT(MT)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freight">Freight *</Label>
              <Input type="number" step="0.01" id="freight" {...register("freight", { required: true })} placeholder="FREIGHT" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate</Label>
              <Input type="number" step="0.01" id="rate" {...register("rate")} placeholder="RATE" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_on">Rate On</Label>
              <Input id="rate_on" {...register("rate_on")} placeholder="RATE ON" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Input id="employee" {...register("employee")} placeholder="EMPLOYEE" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="truck_driver_no">Truck Driver No</Label>
              <Input id="truck_driver_no" {...register("truck_driver_no")} placeholder="TRUCK DRIVER NO" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea id="remark" {...register("remark")} placeholder="REMARK" rows={3} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : lr ? "Update & Save" : "Create & Save"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
};
