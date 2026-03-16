import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "en" | "hi" | "ta";

const LANG_LABELS: Record<Lang, string> = { en: "English", hi: "हिन्दी", ta: "தமிழ்" };
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function speakText(text: string, lang: Lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, ""));
  utterance.rate = 0.95;
  utterance.volume = 1;
  const langCode = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";
  utterance.lang = langCode;
  
  // Try to find matching voice
  const voices = window.speechSynthesis.getVoices();
  const exactMatch = voices.find((v) => v.lang === langCode);
  const partialMatch = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
  if (exactMatch) utterance.voice = exactMatch;
  else if (partialMatch) utterance.voice = partialMatch;
  
  window.speechSynthesis.speak(utterance);
}

// Preload voices
if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

export function ChatBotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} floating />}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-eco shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-all duration-300 btn-glow"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}
    </>
  );
}

export function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <ChatPanel fullPage />
    </div>
  );
}

function ChatPanel({ onClose, floating, fullPage }: { onClose?: () => void; floating?: boolean; fullPage?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [recording, setRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Recording timer
  useEffect(() => {
    if (recording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: allMessages, language: lang }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const contentType = resp.headers.get("content-type") || "";
      
      // Handle non-streaming fallback response
      if (contentType.includes("application/json")) {
        const data = await resp.json();
        const content = data.content || data.fallback || "Sorry, I couldn't process that. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content }]);
        if (voiceEnabled) speakText(content, lang);
        return;
      }

      // Handle streaming response
      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {}
        }
      }

      if (voiceEnabled && assistantSoFar) {
        speakText(assistantSoFar, lang);
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong. Please try again! 🌱` }]);
    } finally {
      setLoading(false);
    }
  }, [messages, lang, voiceEnabled]);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRecording(false);
      if (transcript.trim()) send(transcript);
    };
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error);
      setRecording(false);
      if (e.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone permissions.");
      }
    };
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const containerClass = floating
    ? "fixed bottom-6 right-6 z-50 w-[400px] h-[580px] rounded-2xl shadow-elevated border bg-card flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
    : "w-full h-full rounded-2xl shadow-elevated border bg-card flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b gradient-eco">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-primary-foreground">EcoSort Assistant</p>
            <p className="text-[10px] text-primary-foreground/70">AI-powered • Always ready to help</p>
          </div>
        </div>
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
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) window.speechSynthesis?.cancel(); }}>
            {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-2xl gradient-eco flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="font-display font-bold text-base">Hi! I'm EcoSort Assistant 🌱</p>
            <p className="text-xs text-muted-foreground mt-1">Ask me anything about waste management, recycling, or green credits!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["How do I earn green credits?", "Tips for recycling plastic", "What is EcoSort AI?"].map((q) => (
                <button key={q} onClick={() => send(q)} className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all hover:scale-105 border border-primary/20">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 duration-300`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
              msg.role === "user"
                ? "gradient-eco text-primary-foreground rounded-br-sm shadow-sm"
                : "bg-muted rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-green max-w-none [&_p]:my-0.5 [&_ul]:my-1 [&_li]:my-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        {recording && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 animate-pulse">
            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium text-destructive">Recording... {recordingTime}s</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{LANG_LABELS[lang]}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant={recording ? "destructive" : "outline"}
            size="icon"
            className={`h-10 w-10 flex-shrink-0 rounded-xl transition-all ${recording ? "animate-pulse shadow-lg shadow-destructive/30" : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"}`}
            onClick={toggleRecording}
            title={recording ? "Stop recording" : "Voice input"}
          >
            {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && send(input)}
            placeholder={recording ? "Listening..." : "Type a message..."}
            className="h-10 text-sm rounded-xl border-border/50 focus-visible:ring-primary/30"
            disabled={recording}
          />
          <Button
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-xl gradient-eco border-0 text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 transition-all"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
