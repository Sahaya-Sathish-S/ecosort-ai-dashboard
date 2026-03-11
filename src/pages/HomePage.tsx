import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, BarChart3, Trash2, Leaf, ArrowRight, Zap, Eye, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "AI-Powered Detection", description: "Computer vision classifies waste types with 97%+ accuracy in real-time." },
  { icon: Eye, title: "Smart Monitoring", description: "IoT sensors track fill levels, temperature, and bin health 24/7." },
  { icon: BarChart3, title: "Data Analytics", description: "Actionable insights on waste patterns, recycling rates, and efficiency." },
  { icon: Recycle, title: "Eco Impact", description: "Track your environmental contribution with carbon offset metrics." },
];

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="gradient-hero px-6 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Waste Management
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight">
              Smart Waste
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
                Sorting with AI
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              EcoSort AI uses computer vision and IoT sensors to automatically detect, classify, and manage waste — making cities cleaner and greener.
            </p>
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              <Button asChild size="lg" className="gradient-eco border-0 text-primary-foreground shadow-elevated">
                <Link to="/dashboard">Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/awareness">Learn More</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl gradient-eco opacity-10 absolute -inset-4 blur-3xl" />
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-card shadow-elevated border flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl lg:text-8xl animate-float">🗑️</div>
                  <div className="flex items-center justify-center gap-1 mt-4">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="text-sm font-display font-semibold text-primary">AI Scanning...</span>
                  </div>
                  <div className="flex gap-1 justify-center mt-3">
                    {["Plastic", "Paper", "Metal", "Organic"].map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-10">How EcoSort AI Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-card rounded-xl p-6 shadow-card border text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold mt-4">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 bg-muted/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { val: "2,450", label: "Tons Collected" },
            { val: "87%", label: "Recycling Rate" },
            { val: "156", label: "Smart Bins" },
            { val: "12", label: "Cities Covered" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold text-primary">{s.val}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
