import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { FillLevelBar } from "@/components/FillLevelBar";
import { Plus, Download, Trash2, MapPin, Thermometer, BarChart3, Users, Trash, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [bins, setBins] = useState<any[]>([]);
  const [detections, setDetections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newBin, setNewBin] = useState({ bin_id: "", location: "", lat: "", lng: "", waste_type: "Mixed" });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    const [binsRes, detectionsRes, usersRes] = await Promise.all([
      supabase.from("waste_bins").select("*").order("bin_id"),
      supabase.from("detection_history").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("green_credits").select("user_id, credits, waste_type, created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    if (binsRes.data) setBins(binsRes.data);
    if (detectionsRes.data) setDetections(detectionsRes.data);
    if (usersRes.data) setUsers(usersRes.data);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase.channel("admin-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "waste_bins" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "detection_history" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
      fetchAll();
    }
  };

  const removeBin = async (id: string) => {
    const { error } = await supabase.from("waste_bins").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Bin removed"); fetchAll(); }
  };

  const updateFillLevel = async (id: string, fill_level: number) => {
    const status = fill_level >= 80 ? "Full" : fill_level >= 40 ? "Medium" : "Empty";
    const { error } = await supabase.from("waste_bins").update({ fill_level, status }).eq("id", id);
    if (error) toast.error(error.message);
    else fetchAll();
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

  const filteredBins = bins.filter((b) =>
    b.bin_id.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  const fullBins = bins.filter((b) => b.status === "Full").length;
  const emptyBins = bins.filter((b) => b.status === "Empty").length;
  const totalCreditsAwarded = users.reduce((a, b) => a + b.credits, 0);
  const uniqueUsers = new Set(users.map((u) => u.user_id)).size;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Control Center</h1>
          <p className="text-sm text-muted-foreground">Manage bins, monitor activity, and view system analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Bins", value: bins.length, icon: Trash, color: "text-primary" },
          { label: "Full Bins", value: fullBins, icon: Trash2, color: "text-destructive" },
          { label: "Empty Bins", value: emptyBins, icon: Trash, color: "text-green-500" },
          { label: "AI Detections", value: detections.length, icon: BarChart3, color: "text-blue-500" },
          { label: "Active Users", value: uniqueUsers, icon: Users, color: "text-purple-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-card border"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-2xl font-display font-bold">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="bins" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="bins">🗑️ Bin Management</TabsTrigger>
          <TabsTrigger value="detections">🧠 AI Detections</TabsTrigger>
          <TabsTrigger value="credits">💰 Green Credits</TabsTrigger>
          <TabsTrigger value="locations">📍 Locations</TabsTrigger>
        </TabsList>

        {/* Bins Tab */}
        <TabsContent value="bins" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bins by ID or location..."
                className="pl-9"
              />
            </div>
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
                    <Input value={newBin.bin_id} onChange={(e) => setNewBin({ ...newBin, bin_id: e.target.value })} placeholder="BIN-001" className="mt-1" />
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
                        {["Mixed", "Plastic", "Paper", "Metal", "Organic", "Glass", "E-Waste"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addBin} className="w-full btn-glow gradient-eco border-0 text-primary-foreground">Add Smart Bin</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Fill Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {bins.length === 0 ? "No bins added yet. Click 'Add Bin' to get started." : "No bins match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBins.map((bin) => (
                    <TableRow key={bin.id}>
                      <TableCell className="font-medium font-display">{bin.bin_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {bin.location}
                        </div>
                      </TableCell>
                      <TableCell className="w-36">
                        <div className="flex items-center gap-2">
                          <FillLevelBar level={bin.fill_level} size="sm" />
                          <select
                            value={bin.fill_level}
                            onChange={(e) => updateFillLevel(bin.id, parseInt(e.target.value))}
                            className="text-xs bg-transparent border border-border rounded px-1 py-0.5 w-16"
                          >
                            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
                              <option key={v} value={v}>{v}%</option>
                            ))}
                          </select>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={bin.status as "Full" | "Medium" | "Empty"} /></TableCell>
                      <TableCell className="text-muted-foreground">{bin.waste_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Thermometer className="h-3 w-3" />
                          <span className="text-xs">{bin.temperature || 25}°C</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeBin(bin.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Detections Tab */}
        <TabsContent value="detections">
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-display font-semibold">Recent AI Detections</h3>
              <p className="text-xs text-muted-foreground">{detections.length} total scans recorded</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No detections recorded yet.</TableCell>
                  </TableRow>
                ) : (
                  detections.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.waste_type}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{d.confidence}%</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{d.user_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card rounded-xl p-5 shadow-card border text-center">
              <p className="text-3xl font-display font-bold text-primary">{totalCreditsAwarded}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Credits Awarded</p>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-card border text-center">
              <p className="text-3xl font-display font-bold text-purple-500">{uniqueUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">Unique Participants</p>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No credits awarded yet.</TableCell>
                  </TableRow>
                ) : (
                  users.map((u, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-mono text-muted-foreground">{u.user_id?.slice(0, 8)}...</TableCell>
                      <TableCell>{u.waste_type}</TableCell>
                      <TableCell className="font-semibold text-primary">+{u.credits}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations">
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-display font-semibold">Bin Locations</h3>
            </div>
            {bins.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No bins deployed yet. Add bins to see their locations.</p>
              </div>
            ) : (
              <div className="divide-y">
                {bins.map((bin) => (
                  <div key={bin.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{bin.bin_id} — {bin.location}</p>
                        <p className="text-xs text-muted-foreground">
                          Lat: {bin.lat.toFixed(4)}, Lng: {bin.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={bin.status as "Full" | "Medium" | "Empty"} />
                      <p className="text-xs text-muted-foreground mt-1">{bin.fill_level}% full</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
