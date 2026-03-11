import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { FillLevelBar } from "@/components/FillLevelBar";
import { Plus, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminPage() {
  const [bins, setBins] = useState<any[]>([]);
  const [newBin, setNewBin] = useState({ bin_id: "", location: "", lat: "", lng: "", waste_type: "Mixed" });
  const [open, setOpen] = useState(false);

  const fetchBins = async () => {
    const { data } = await supabase.from("waste_bins").select("*").order("bin_id");
    if (data) setBins(data);
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const addBin = async () => {
    if (!newBin.bin_id || !newBin.location) {
      toast.error("Bin ID and Location are required");
      return;
    }
    const { error } = await supabase.from("waste_bins").insert({
      bin_id: newBin.bin_id,
      location: newBin.location,
      lat: parseFloat(newBin.lat) || 28.61 + Math.random() * 0.04,
      lng: parseFloat(newBin.lng) || 77.19 + Math.random() * 0.05,
      waste_type: newBin.waste_type,
      fill_level: 0,
      status: "Empty",
    });
    if (error) {
      toast.error(error.message);
    } else {
      setNewBin({ bin_id: "", location: "", lat: "", lng: "", waste_type: "Mixed" });
      setOpen(false);
      toast.success("Smart bin added successfully");
      fetchBins();
    }
  };

  const removeBin = async (id: string) => {
    const { error } = await supabase.from("waste_bins").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bin removed");
      fetchBins();
    }
  };

  const exportData = () => {
    const csv = ["ID,Location,Fill Level,Status,Waste Type,Lat,Lng"]
      .concat(bins.map((b) => `${b.bin_id},${b.location},${b.fill_level}%,${b.status},${b.waste_type},${b.lat},${b.lng}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecosort-bins-report.csv";
    a.click();
    toast.success("Data exported successfully");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage smart bins and system settings</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow gradient-eco border-0 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Add Bin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add New Smart Bin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Bin ID</Label>
                  <Input value={newBin.bin_id} onChange={(e) => setNewBin({ ...newBin, bin_id: e.target.value })} placeholder="BIN-009" className="mt-1" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={newBin.location} onChange={(e) => setNewBin({ ...newBin, location: e.target.value })} placeholder="Central Park" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Latitude</Label>
                    <Input value={newBin.lat} onChange={(e) => setNewBin({ ...newBin, lat: e.target.value })} placeholder="28.6139" className="mt-1" />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input value={newBin.lng} onChange={(e) => setNewBin({ ...newBin, lng: e.target.value })} placeholder="77.2090" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Waste Type</Label>
                  <Select value={newBin.waste_type} onValueChange={(v) => setNewBin({ ...newBin, waste_type: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Mixed", "Plastic", "Paper", "Metal", "Organic"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addBin} className="w-full btn-glow gradient-eco border-0 text-primary-foreground">Add Smart Bin</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card border text-center">
          <p className="text-2xl font-display font-bold">{bins.length}</p>
          <p className="text-xs text-muted-foreground">Total Bins</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border text-center">
          <p className="text-2xl font-display font-bold text-destructive">{bins.filter((b) => b.status === "Full").length}</p>
          <p className="text-xs text-muted-foreground">Bins Full</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border text-center">
          <p className="text-2xl font-display font-bold text-success">{bins.filter((b) => b.status === "Empty").length}</p>
          <p className="text-xs text-muted-foreground">Bins Empty</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bin ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Fill Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waste</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bins yet. Click "Add Bin" to get started.</TableCell>
              </TableRow>
            ) : (
              bins.map((bin) => (
                <TableRow key={bin.id}>
                  <TableCell className="font-medium">{bin.bin_id}</TableCell>
                  <TableCell>{bin.location}</TableCell>
                  <TableCell className="w-40"><FillLevelBar level={bin.fill_level} size="sm" /></TableCell>
                  <TableCell><StatusBadge status={bin.status as "Full" | "Medium" | "Empty"} /></TableCell>
                  <TableCell className="text-muted-foreground">{bin.waste_type}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeBin(bin.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
