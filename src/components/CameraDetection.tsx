import { useState, useRef, useCallback } from "react";
import { Camera, X, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DetectionResult {
  wasteType: string;
  confidence: number;
  description: string;
}

export function CameraDetection() {
  const [isOpen, setIsOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setCapturing(true);
      setResult(null);
      setIsOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCapturing(false);
    setIsOpen(false);
    setResult(null);
  }, [stream]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-waste", {
        body: { image: imageDataUrl },
      });

      if (error) throw error;

      const detection: DetectionResult = data;
      setResult(detection);

      // Save to detection history
      if (user) {
        await supabase.from("detection_history").insert({
          user_id: user.id,
          waste_type: detection.wasteType,
          confidence: detection.confidence,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze waste");
    } finally {
      setAnalyzing(false);
    }
  }, [user]);

  if (!isOpen) {
    return (
      <Button onClick={startCamera} size="lg" className="btn-glow gradient-eco border-0 text-primary-foreground gap-2">
        <Camera className="h-5 w-5" />
        Scan Waste with AI
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-elevated border max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Scan className="h-4 w-4 text-primary" />
            AI Waste Scanner
          </h3>
          <Button variant="ghost" size="icon" onClick={stopCamera}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          {capturing && (
            <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {analyzing && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">AI is analyzing...</p>
            </div>
          )}
        </div>

        {result && (
          <div className="p-5 space-y-3 border-t">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">
                  {result.wasteType === "No Waste" ? "❌" : "♻️"}
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-lg">{result.wasteType}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: <span className="text-primary font-semibold">{result.confidence}%</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.description}</p>
          </div>
        )}

        <div className="p-4 border-t flex gap-2">
          <Button onClick={captureAndAnalyze} disabled={analyzing} className="flex-1 btn-glow gradient-eco border-0 text-primary-foreground">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
            {result ? "Scan Again" : "Capture & Analyze"}
          </Button>
          <Button variant="outline" onClick={stopCamera}>Close</Button>
        </div>
      </div>
    </div>
  );
}
