import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: `You are an expert waste classification AI with extensive training data. Analyze the image carefully and classify the PRIMARY waste type visible.

CLASSIFICATION RULES:
1. Focus on the MAIN waste item, not background objects
2. If multiple waste items are visible, classify the most prominent one
3. Common items and their categories:
   - PLASTIC: bottles, bags, containers, packaging, straws, cups, wrappers, food containers, PET bottles, HDPE containers, polystyrene, bubble wrap
   - PAPER: newspapers, cardboard, books, envelopes, paper bags, tissues, paper plates, magazines, office paper, paper towels
   - METAL: cans, foil, wires, nails, screws, metal lids, aluminum cans, tin cans, steel containers, copper wire
   - ORGANIC: food scraps, fruit peels, vegetable waste, leaves, garden waste, coffee grounds, eggshells, tea bags, flowers, wood chips
   - GLASS: bottles, jars, mirrors, window glass, drinking glasses, glass containers, broken glass
   - E-WASTE: phones, chargers, cables, batteries, circuit boards, keyboards, mice, headphones, old computers, tablets, TVs, monitors, printers, USB drives
   - HAZARDOUS: chemicals, paint, medical waste, syringes, pesticides, cleaning products, motor oil, light bulbs (CFL/fluorescent), aerosol cans
   - MIXED: when multiple distinct waste types are equally visible and cannot be separated

4. IMPORTANT DISTINCTIONS:
   - A phone/tablet/laptop is E-WASTE, not Metal or Plastic
   - A plastic bottle with liquid inside is still Plastic
   - Food in a container: if mostly food → Organic, if mostly container → Plastic/Paper
   - Cardboard boxes are Paper, not Mixed
   - Aluminum cans are Metal, not Plastic
   - Clothes/textiles should be classified as Mixed
   - Batteries are ALWAYS Hazardous, even small ones

5. If NO waste item is visible (e.g., just a person, furniture, landscape), return "No Waste"

Respond ONLY by calling the classify_waste function.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and classify the waste type. Focus on the primary waste item visible. If you see a phone, laptop, or electronic device, classify it as E-Waste. If you see no waste, say 'No Waste'." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_waste",
              description: "Classify waste from image with detailed analysis",
              parameters: {
                type: "object",
                properties: {
                  wasteType: {
                    type: "string",
                    enum: ["Plastic", "Paper", "Metal", "Organic", "Glass", "E-Waste", "Hazardous", "Mixed", "No Waste"],
                    description: "The type of waste detected",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence percentage from 0 to 100",
                  },
                  description: {
                    type: "string",
                    description: "Brief description: what specific item was detected, why it's classified this way, and recycling advice (1-2 sentences)",
                  },
                },
                required: ["wasteType", "confidence", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_waste" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ wasteType: "No Waste", confidence: 0, description: "No waste could be detected in the image." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-waste error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
