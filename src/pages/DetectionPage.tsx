import { detectionHistory } from "@/lib/mockData";
import { Brain, Camera, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DetectionPage() {
  const latest = detectionHistory[0];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">AI Waste Detection</h1>
        <p className="text-sm text-muted-foreground">Computer vision waste classification results</p>
      </div>

      {/* Latest Detection */}
      <motion.div
        className="bg-card rounded-xl p-6 shadow-card border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          Latest Detection
        </h3>
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-40 h-40 rounded-2xl bg-muted flex items-center justify-center text-6xl">
            {latest.image}
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-xl">{latest.wasteType}</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm">Confidence: <strong>{latest.confidence}%</strong></span>
            </div>
            <p className="text-xs text-muted-foreground">{latest.timestamp}</p>
            <div className="h-2 w-48 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${latest.confidence}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* History Table */}
      <div className="bg-card rounded-xl shadow-card border overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-display font-semibold">Detection History</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Waste Type</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detectionHistory.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-2xl">{d.image}</TableCell>
                <TableCell className="font-medium">{d.wasteType}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {d.confidence}%
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{d.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
