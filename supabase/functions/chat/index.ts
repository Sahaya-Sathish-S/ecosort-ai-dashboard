import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language === "hi" 
      ? "You MUST reply in Hindi (Devanagari script). Do not reply in English unless the user writes in English." 
      : language === "ta" 
      ? "You MUST reply in Tamil (Tamil script). Do not reply in English unless the user writes in English." 
      : "Reply in English.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are EcoSort AI Assistant — a friendly, knowledgeable, and helpful chatbot for a smart waste management platform called EcoSort AI.

You can help with ANY topic the user asks about, but you specialize in:
- Waste classification, recycling guidance, and environmental tips
- How to use EcoSort AI (scanning waste with camera, earning green credits, QR codes, leaderboard)
- General knowledge questions, math, science, history, etc.
- Sustainability, climate change, and eco-friendly practices

IMPORTANT RULES:
1. ${langInstruction}
2. Be helpful and answer ALL questions - never say "I can't understand" or "I don't know what you mean"
3. If the question is unclear, make your best guess and ask for clarification
4. Keep responses concise (2-4 sentences) unless the user asks for detail
5. Use emojis occasionally to be friendly 🌱
6. If you detect the user's message is in Hindi or Tamil, respond in that language regardless of the language setting
7. For voice messages that may have transcription errors, try to understand the intent

ABOUT ECOSORT AI:
- Users scan waste with their phone camera → AI classifies the waste type
- Proper disposal earns Green Credits (Plastic: 10, Paper: 8, Metal: 15, Organic: 5, Glass: 12, E-Waste: 20)
- Top credit earners win cash prizes (₹5000 Gold, ₹3000 Silver, ₹1500 Bronze)
- Smart bins with IoT sensors track fill levels and temperature in real-time
- QR codes are generated after each scan for claiming bonus points`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Fallback: return a helpful message
      return new Response(JSON.stringify({ 
        fallback: true,
        content: "I'm experiencing a temporary issue. Please try again in a moment! 🌱" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
