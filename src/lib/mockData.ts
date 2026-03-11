// Mock data for the entire EcoSort AI application

export const wasteBins = [
  { id: "BIN-001", location: "Main Street Park", lat: 28.6139, lng: 77.209, fillLevel: 85, wasteType: "Mixed", status: "Full" as const, lastUpdated: "2 min ago", temperature: 32 },
  { id: "BIN-002", location: "City Mall Entrance", lat: 28.6229, lng: 77.219, fillLevel: 45, wasteType: "Plastic", status: "Medium" as const, lastUpdated: "5 min ago", temperature: 28 },
  { id: "BIN-003", location: "University Campus", lat: 28.6339, lng: 77.199, fillLevel: 12, wasteType: "Paper", status: "Empty" as const, lastUpdated: "1 min ago", temperature: 26 },
  { id: "BIN-004", location: "Hospital Zone", lat: 28.6049, lng: 77.229, fillLevel: 92, wasteType: "Organic", status: "Full" as const, lastUpdated: "8 min ago", temperature: 35 },
  { id: "BIN-005", location: "Railway Station", lat: 28.6429, lng: 77.189, fillLevel: 30, wasteType: "Metal", status: "Empty" as const, lastUpdated: "3 min ago", temperature: 29 },
  { id: "BIN-006", location: "Market Square", lat: 28.6189, lng: 77.239, fillLevel: 67, wasteType: "Plastic", status: "Medium" as const, lastUpdated: "12 min ago", temperature: 31 },
  { id: "BIN-007", location: "Residential Block A", lat: 28.6089, lng: 77.204, fillLevel: 55, wasteType: "Organic", status: "Medium" as const, lastUpdated: "6 min ago", temperature: 27 },
  { id: "BIN-008", location: "Tech Park", lat: 28.6259, lng: 77.214, fillLevel: 8, wasteType: "Paper", status: "Empty" as const, lastUpdated: "15 min ago", temperature: 25 },
];

export const wasteDistribution = [
  { name: "Plastic", value: 35, color: "hsl(200, 80%, 50%)" },
  { name: "Paper", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "Metal", value: 15, color: "hsl(260, 60%, 55%)" },
  { name: "Organic", value: 25, color: "hsl(152, 60%, 36%)" },
];

export const dailyCollection = [
  { day: "Mon", plastic: 45, paper: 30, metal: 12, organic: 38 },
  { day: "Tue", plastic: 52, paper: 28, metal: 18, organic: 42 },
  { day: "Wed", plastic: 38, paper: 35, metal: 14, organic: 30 },
  { day: "Thu", plastic: 60, paper: 32, metal: 20, organic: 45 },
  { day: "Fri", plastic: 48, paper: 40, metal: 16, organic: 35 },
  { day: "Sat", plastic: 55, paper: 38, metal: 22, organic: 50 },
  { day: "Sun", plastic: 30, paper: 20, metal: 10, organic: 25 },
];

export const detectionHistory = [
  { id: 1, image: "🥤", wasteType: "Plastic Bottle", confidence: 97.5, timestamp: "2026-03-11 10:23:45" },
  { id: 2, image: "📰", wasteType: "Newspaper", confidence: 94.2, timestamp: "2026-03-11 10:20:12" },
  { id: 3, image: "🥫", wasteType: "Aluminum Can", confidence: 98.1, timestamp: "2026-03-11 10:15:33" },
  { id: 4, image: "🍌", wasteType: "Banana Peel", confidence: 96.8, timestamp: "2026-03-11 10:10:05" },
  { id: 5, image: "📦", wasteType: "Cardboard Box", confidence: 99.2, timestamp: "2026-03-11 10:05:18" },
  { id: 6, image: "🔩", wasteType: "Metal Scrap", confidence: 91.3, timestamp: "2026-03-11 09:58:42" },
];

export const notifications = [
  { id: 1, type: "full" as const, message: "BIN-001 at Main Street Park is 85% full", time: "2 min ago", read: false },
  { id: 2, type: "full" as const, message: "BIN-004 at Hospital Zone is 92% full", time: "8 min ago", read: false },
  { id: 3, type: "maintenance" as const, message: "BIN-006 requires sensor calibration", time: "1 hour ago", read: false },
  { id: 4, type: "temperature" as const, message: "BIN-004 temperature above threshold (35°C)", time: "8 min ago", read: true },
  { id: 5, type: "maintenance" as const, message: "BIN-002 scheduled maintenance tomorrow", time: "3 hours ago", read: true },
  { id: 6, type: "full" as const, message: "BIN-007 collection completed successfully", time: "5 hours ago", read: true },
];

export const recyclingTips = [
  { title: "Rinse Before Recycling", description: "Clean containers to prevent contamination of recyclable materials.", icon: "💧" },
  { title: "Flatten Cardboard", description: "Break down boxes to save space and improve recycling efficiency.", icon: "📦" },
  { title: "Separate Materials", description: "Keep plastic, paper, metal, and organic waste in different bins.", icon: "♻️" },
  { title: "Avoid Plastic Bags", description: "Use reusable bags. Plastic bags jam recycling machinery.", icon: "🛍️" },
  { title: "Compost Organic Waste", description: "Turn food scraps into nutrient-rich soil for gardens.", icon: "🌱" },
  { title: "E-Waste Disposal", description: "Take electronics to certified e-waste collection points.", icon: "🔌" },
];
