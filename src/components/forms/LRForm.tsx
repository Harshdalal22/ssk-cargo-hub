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
      generateLRNumber();
    }
  }, [lr]);

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customer_details")
      .select("*")
      .order("customer_name");
    if (data) setCustomers(data);
  };

  const generateLRNumber = async () => {
    const { data, error } = await supabase.rpc("generate_lr_number");
    if (data && !error) {
      setValue("lr_no", data);
    }
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

      const lrData = {
        ...data,
        items: items.filter(item => item.description || item.pcs || item.weight),
        created_by: user.id,
      };

      if (lr?.id) {
        const { error } = await supabase
          .from("lr_details")
          .update(lrData)
          .eq("id", lr.id);
        if (error) throw error;
        toast({ title: "LR updated successfully" });
      } else {
        const { error } = await supabase
          .from("lr_details")
          .insert([lrData]);
        if (error) throw error;
        toast({ title: "LR created successfully" });
      }
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
              <Input id="lr_no" {...register("lr_no", { required: true })} placeholder="LR NO" readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input type="date" id="date" {...register("date", { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_logo_url">Company Logo URL (Optional)</Label>
              <Input
                id="company_logo_url"
                {...register("company_logo_url")}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to your company logo to display on the PDF
              </p>
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
              <Select onValueChange={(val) => {
                const customer = customers.find(c => c.customer_name === val);
                if (customer) {
                  setValue("consignor_name", customer.customer_name);
                  setValue("consignor_address", customer.address || '');
                  setValue("consignor_city", '');
                  setValue("consignor_contact", customer.phone_number || '');
                  setValue("consignor_pan", '');
                  setValue("consignor_gst", customer.gst_number || '');
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Consignor" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.customer_name}>{c.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={(val) => {
                const customer = customers.find(c => c.customer_name === val);
                if (customer) {
                  setValue("consignee_name", customer.customer_name);
                  setValue("consignee_address", customer.address || '');
                  setValue("consignee_city", '');
                  setValue("consignee_contact", customer.phone_number || '');
                  setValue("consignee_pan", '');
                  setValue("consignee_gst", customer.gst_number || '');
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Consignee" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.customer_name}>{c.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select onValueChange={(val) => {
                const customer = customers.find(c => c.customer_name === val);
                if (customer) {
                  setValue("billing_party_name", customer.customer_name);
                  setValue("billing_party_address", customer.address || '');
                  setValue("billing_party_city", '');
                  setValue("billing_party_contact", customer.phone_number || '');
                  setValue("billing_party_pan", '');
                  setValue("billing_party_gst", customer.gst_number || '');
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Billing Party" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.customer_name}>{c.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
