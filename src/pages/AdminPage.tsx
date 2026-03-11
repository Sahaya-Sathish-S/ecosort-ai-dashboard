import { useState } from "react";
import { wasteBins } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { FillLevelBar } from "@/components/FillLevelBar";
import { Plus, Download, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminPage() {
  const [bins, setBins] = useState(wasteBins);
  const [newBin, setNewBin] = useState({ id: "", location: "" });
  const [open, setOpen] = useState(false);

  const addBin = () => {
    if (!newBin.id || !newBin.location) return;
    setBins([...bins, {
      ...newBin,
      lat: 28.61 + Math.random() * 0.04,
      lng: 77.19 + Math.random() * 0.05,
      fillLevel: 0,
      wasteType: "Empty",
      status: "Empty" as const,
      lastUpdated: "Just now",
      temperature: 25,
    }]);
    setNewBin({ id: "", location: "" });
    setOpen(false);
    toast.success("Smart bin added successfully");
  };

  const removeBin = (id: string) => {
    setBins(bins.filter((b) => b.id !== id));
    toast.success("Bin removed");
  };

  const exportData = () => {
    const csv = ["ID,Location,Fill Level,Status,Waste Type"]
      .concat(bins.map((b) => `${b.id},${b.location},${b.fillLevel}%,${b.status},${b.wasteType}`))
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
              <Button className="gradient-eco border-0 text-primary-foreground">
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
                  <Input value={newBin.id} onChange={(e) => setNewBin({ ...newBin, id: e.target.value })} placeholder="BIN-009" className="mt-1" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={newBin.location} onChange={(e) => setNewBin({ ...newBin, location: e.target.value })} placeholder="Central Park" className="mt-1" />
                </div>
                <Button onClick={addBin} className="w-full gradient-eco border-0 text-primary-foreground">Add Smart Bin</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Summary */}
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

      {/* Table */}
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
            {bins.map((bin) => (
              <TableRow key={bin.id}>
                <TableCell className="font-medium">{bin.id}</TableCell>
                <TableCell>{bin.location}</TableCell>
                <TableCell className="w-40"><FillLevelBar level={bin.fillLevel} size="sm" /></TableCell>
                <TableCell><StatusBadge status={bin.status} /></TableCell>
                <TableCell className="text-muted-foreground">{bin.wasteType}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeBin(bin.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
