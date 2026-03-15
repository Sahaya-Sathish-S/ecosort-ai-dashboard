import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Globe, Volume2, Minimize2, Maximize2 } from "lucide-react";
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
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
  if (match) utterance.voice = match;
  window.speechSynthesis.speak(utterance);
}

export function ChatBotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} floating />}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-eco shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
        },
        body: JSON.stringify({ messages: allMessages, language: lang }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

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
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}` }]);
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
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRecording(false);
      send(transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const containerClass = floating
    ? "fixed bottom-6 right-6 z-50 w-[380px] h-[560px] rounded-2xl shadow-elevated border bg-card flex flex-col overflow-hidden"
    : "w-full h-full rounded-2xl shadow-elevated border bg-card flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-eco flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold">EcoSort Assistant</p>
            <p className="text-[10px] text-muted-foreground">AI-powered help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="text-xs bg-transparent border border-border rounded-md px-1.5 py-1 text-foreground"
          >
            {Object.entries(LANG_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVoiceEnabled(!voiceEnabled)} title={voiceEnabled ? "Mute" : "Unmute"}>
            <Volume2 className={`h-3.5 w-3.5 ${voiceEnabled ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full gradient-eco flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="font-display font-semibold text-sm">Hi! I'm EcoSort Assistant 🌱</p>
            <p className="text-xs text-muted-foreground mt-1">Ask me about waste management, recycling, or green credits!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["How do I earn green credits?", "Tips for recycling plastic", "What is EcoSort AI?"].map((q) => (
                <button key={q} onClick={() => send(q)} className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
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
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3 flex items-center gap-2">
        <Button
          variant={recording ? "destructive" : "outline"}
          size="icon"
          className="h-9 w-9 flex-shrink-0"
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
          className="h-9 text-sm"
          disabled={recording}
        />
        <Button
          size="icon"
          className="h-9 w-9 flex-shrink-0 gradient-eco border-0 text-primary-foreground"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
