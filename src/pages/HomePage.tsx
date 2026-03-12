import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, BarChart3, Trash2, Leaf, ArrowRight, Zap, Eye, Recycle, Trophy, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraDetection } from "@/components/CameraDetection";

const features = [
  { icon: Brain, title: "AI-Powered Detection", description: "Computer vision classifies waste types with real AI analysis in real-time.", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: Eye, title: "Smart Monitoring", description: "IoT sensors track fill levels, temperature, and bin health 24/7.", color: "from-purple-500/20 to-pink-500/20" },
  { icon: BarChart3, title: "Data Analytics", description: "Actionable insights on waste patterns, recycling rates, and efficiency.", color: "from-orange-500/20 to-amber-500/20" },
  { icon: Trophy, title: "Green Credits", description: "Earn rewards for proper waste disposal and climb the leaderboard!", color: "from-emerald-500/20 to-green-500/20" },
];

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-16 lg:py-24" style={{
        background: "linear-gradient(135deg, hsl(152 25% 96%), hsl(168 20% 94%), hsl(200 15% 96%))"
      }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, hsl(152 60% 36%) 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Waste Management
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight">
              Smart Waste
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                Sorting with AI
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              EcoSort AI uses computer vision and IoT sensors to automatically detect, classify, and manage waste — making cities cleaner and greener.
            </p>
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              <CameraDetection />
              <Button asChild size="lg" className="btn-glow-outline">
                <Link to="/dashboard">Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 absolute -inset-4 blur-3xl" />
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
          <h2 className="text-2xl font-display font-bold text-center mb-3">How EcoSort AI Works</h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-md mx-auto">Scan waste, earn credits, and help the environment with AI-powered technology</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className={`rounded-xl p-6 shadow-card border text-center hover:shadow-elevated transition-all bg-gradient-to-br ${f.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="h-12 w-12 rounded-xl bg-card flex items-center justify-center mx-auto text-primary shadow-sm">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold mt-4">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild size="lg" className="btn-glow gradient-eco border-0 text-primary-foreground h-14 text-base">
              <Link to="/monitoring"><Trash2 className="mr-2 h-5 w-5" /> Monitor Bins</Link>
            </Button>
            <Button asChild size="lg" className="btn-glow gradient-eco border-0 text-primary-foreground h-14 text-base">
              <Link to="/analytics"><BarChart3 className="mr-2 h-5 w-5" /> View Analytics</Link>
            </Button>
            <Button asChild size="lg" className="btn-glow gradient-eco border-0 text-primary-foreground h-14 text-base">
              <Link to="/map"><Eye className="mr-2 h-5 w-5" /> Smart Map</Link>
            </Button>
            <Button asChild size="lg" className="h-14 text-base bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 border-0 text-white shadow-lg shadow-yellow-500/25">
              <Link to="/leaderboard"><Trophy className="mr-2 h-5 w-5" /> Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Hardware Integration Notice */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Hardware Integration Required</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Smart bin monitoring, fill-level sensors, temperature tracking, and automated waste sorting require IoT hardware integration. 
                  Connect your ESP32/Arduino-based smart bins via our REST API to enable real-time monitoring, automated notifications, and live map tracking.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Fill-Level Sensors", "Temperature Sensors", "GPS Modules", "Servo Motors", "ESP32/Arduino"].map((hw) => (
                    <span key={hw} className="px-2.5 py-1 text-[11px] rounded-full bg-primary/10 text-primary font-medium">{hw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
