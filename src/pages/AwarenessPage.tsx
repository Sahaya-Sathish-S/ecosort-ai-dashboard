import { recyclingTips } from "@/lib/mockData";
import { Leaf, BookOpen, Recycle, Globe } from "lucide-react";
import { motion } from "framer-motion";

const guides = [
  { icon: "🟢", title: "Organic Waste", items: ["Food scraps", "Yard waste", "Coffee grounds", "Eggshells"], color: "bg-success/10 border-success/20" },
  { icon: "🔵", title: "Recyclables", items: ["Plastic bottles", "Paper/cardboard", "Glass jars", "Metal cans"], color: "bg-info/10 border-info/20" },
  { icon: "🔴", title: "Non-Recyclable", items: ["Styrofoam", "Chip bags", "Diapers", "Ceramics"], color: "bg-destructive/10 border-destructive/20" },
  { icon: "🟡", title: "Hazardous", items: ["Batteries", "Paint", "Electronics", "Light bulbs"], color: "bg-warning/10 border-warning/20" },
];

export default function AwarenessPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold">Eco Awareness</h1>
        <p className="text-sm text-muted-foreground">Learn about proper waste segregation and recycling</p>
      </div>

      {/* Segregation Guide */}
      <section>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Waste Segregation Guide
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guides.map((g, i) => (
            <motion.div
              key={g.title}
              className={`rounded-xl p-5 border ${g.color}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-3xl">{g.icon}</span>
              <h3 className="font-display font-semibold mt-2">{g.title}</h3>
              <ul className="mt-3 space-y-1">
                {g.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-current flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Recycle className="h-5 w-5 text-primary" /> Recycling Tips
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recyclingTips.map((tip) => (
            <div key={tip.title} className="bg-card rounded-xl p-5 shadow-card border">
              <span className="text-3xl">{tip.icon}</span>
              <h3 className="font-display font-semibold mt-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="gradient-hero rounded-xl p-6">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Environmental Impact
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 mt-4 text-center">
          <div>
            <p className="text-3xl font-display font-bold text-primary">8M tons</p>
            <p className="text-sm text-muted-foreground mt-1">Plastic enters oceans yearly</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-primary">91%</p>
            <p className="text-sm text-muted-foreground mt-1">Of plastic isn't recycled</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-primary">450 yrs</p>
            <p className="text-sm text-muted-foreground mt-1">For plastic bottle to decompose</p>
          </div>
        </div>
      </section>
    </div>
  );
}
