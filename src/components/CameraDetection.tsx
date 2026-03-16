import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Loader2, Scan, Volume2, VolumeX, Coins, Globe, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface DetectionResult {
  wasteType: string;
  confidence: number;
  description: string;
}

type Lang = "en" | "hi" | "ta";
const LANG_LABELS: Record<Lang, string> = { en: "English", hi: "हिन्दी", ta: "தமிழ்" };

const CREDIT_MAP: Record<string, number> = {
  Plastic: 10, Paper: 8, Metal: 15, Organic: 5, Glass: 12, "E-Waste": 20, Hazardous: 25,
};

// Preload voices
if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

function speakResult(result: DetectionResult, credits: number, lang: Lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  let text: string;
  if (lang === "hi") {
    text = result.wasteType === "No Waste"
      ? "छवि में कोई कचरा नहीं मिला। कृपया कचरे की वस्तु के साथ पुनः स्कैन करें।"
      : `${result.wasteType} कचरा पाया गया, ${result.confidence} प्रतिशत विश्वसनीयता। ${result.description}। आपने ${credits} ग्रीन क्रेडिट अर्जित किए!`;
  } else if (lang === "ta") {
    text = result.wasteType === "No Waste"
      ? "படத்தில் கழிவுகள் கண்டறியப்படவில்லை. கழிவுப் பொருளுடன் மீண்டும் ஸ்கேன் செய்யவும்."
      : `${result.wasteType} கழிவு கண்டறியப்பட்டது, ${result.confidence} சதவீத நம்பகத்தன்மை. ${result.description}. நீங்கள் ${credits} பசுமை கிரெடிட்களை பெற்றீர்கள்!`;
  } else {
    text = result.wasteType === "No Waste"
      ? "No waste was detected. Please try scanning again with a waste item visible."
      : `Detected ${result.wasteType} waste with ${result.confidence}% confidence. ${result.description}. You earned ${credits} green credits!`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.volume = 1;
  utterance.pitch = 1;
  const langCode = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";
  utterance.lang = langCode;
  
  // Wait briefly for voices to load, then find match
  const voices = window.speechSynthesis.getVoices();
  const exactMatch = voices.find((v) => v.lang === langCode);
  const partialMatch = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
  if (exactMatch) utterance.voice = exactMatch;
  else if (partialMatch) utterance.voice = partialMatch;
  
  window.speechSynthesis.speak(utterance);
}

export function CameraDetection() {
  const [isOpen, setIsOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [earnedCredits, setEarnedCredits] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lang, setLang] = useState<Lang>("en");
  const [qrData, setQrData] = useState<string | null>(null);
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
      setEarnedCredits(0);
      setQrData(null);
      setIsOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 100);
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    window.speechSynthesis?.cancel();
    setStream(null);
    setCapturing(false);
    setIsOpen(false);
    setResult(null);
    setEarnedCredits(0);
    setQrData(null);
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

      const credits = detection.wasteType !== "No Waste" ? (CREDIT_MAP[detection.wasteType] || 7) : 0;
      setEarnedCredits(credits);

      if (voiceEnabled) speakResult(detection, credits, lang);

      if (user && detection.wasteType !== "No Waste") {
        const { data: detectionRow } = await supabase.from("detection_history").insert({
          user_id: user.id,
          waste_type: detection.wasteType,
          confidence: detection.confidence,
        }).select("id").single();

        if (credits > 0) {
          await supabase.from("green_credits").insert({
            user_id: user.id,
            credits,
            waste_type: detection.wasteType,
            detection_id: detectionRow?.id || null,
          });
          toast.success(`+${credits} Green Credits earned! 🌱`);

          const qrPayload = JSON.stringify({
            userId: user.id,
            credits,
            wasteType: detection.wasteType,
            detectionId: detectionRow?.id,
            timestamp: Date.now(),
          });
          setQrData(btoa(qrPayload));
        }

        // Create notification for the detection
        await supabase.from("notifications").insert({
          type: "detection",
          message: `AI detected ${detection.wasteType} waste (${detection.confidence}% confidence). +${credits} green credits earned!`,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze waste");
    } finally {
      setAnalyzing(false);
    }
  }, [user, voiceEnabled, lang]);

  if (!isOpen) {
    return (
      <Button onClick={startCamera} size="lg" className="btn-glow gradient-eco border-0 text-primary-foreground gap-2 hover:scale-105 transition-transform">
        <Camera className="h-5 w-5" />
        Scan Waste with AI
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-elevated border max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b gradient-eco">
          <h3 className="font-display font-semibold flex items-center gap-2 text-primary-foreground">
            <Scan className="h-4 w-4" />
            AI Waste Scanner
          </h3>
          <div className="flex items-center gap-1">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="text-xs bg-primary-foreground/20 backdrop-blur border-0 rounded-lg px-2 py-1 text-primary-foreground font-medium cursor-pointer"
            >
              {Object.entries(LANG_LABELS).map(([k, v]) => (
                <option key={k} value={k} className="text-foreground bg-card">{v}</option>
              ))}
            </select>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) window.speechSynthesis?.cancel(); }}>
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={stopCamera}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="relative">
          {capturing && <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />}
          <canvas ref={canvasRef} className="hidden" />
          {analyzing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="h-16 w-16 rounded-2xl gradient-eco flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
              </div>
              <p className="text-sm font-display font-semibold">AI is analyzing...</p>
              <p className="text-xs text-muted-foreground">Classifying waste type</p>
            </div>
          )}
        </div>

        {result && (
          <div className="p-5 space-y-3 border-t">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-eco flex items-center justify-center shadow-md">
                <span className="text-2xl">{result.wasteType === "No Waste" ? "❌" : "♻️"}</span>
              </div>
              <div>
                <p className="font-display font-bold text-lg">{result.wasteType}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: <span className="text-primary font-semibold">{result.confidence}%</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.description}</p>

            {earnedCredits > 0 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 animate-in fade-in duration-500">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-700">+{earnedCredits} Green Credits Earned!</span>
              </div>
            )}

            {qrData && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-b from-primary/5 to-accent/5 border border-primary/10">
                <div className="flex items-center gap-2 text-sm font-display font-semibold text-primary">
                  <QrCode className="h-4 w-4" /> Your Reward QR Code
                </div>
                <QRCodeSVG value={qrData} size={140} bgColor="transparent" fgColor="hsl(152, 60%, 36%)" level="M" />
                <p className="text-[11px] text-muted-foreground text-center">
                  Show this QR code at any EcoSort collection point to claim bonus points!
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> Voice: {LANG_LABELS[lang]}
              {voiceEnabled && <Volume2 className="h-3 w-3 text-primary ml-1" />}
            </p>
          </div>
        )}

        <div className="p-4 border-t flex gap-2">
          <Button onClick={captureAndAnalyze} disabled={analyzing} className="flex-1 btn-glow gradient-eco border-0 text-primary-foreground hover:scale-[1.02] transition-transform">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
            {result ? "Scan Again" : "Capture & Analyze"}
          </Button>
          <Button variant="outline" onClick={stopCamera} className="hover:border-primary/30 hover:text-primary transition-colors">Close</Button>
        </div>
      </div>
    </div>
  );
}
