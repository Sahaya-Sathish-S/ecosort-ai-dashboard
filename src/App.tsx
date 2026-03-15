import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatBotWidget } from "@/components/ChatBot";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import DashboardPage from "@/pages/DashboardPage";
import MonitoringPage from "@/pages/MonitoringPage";
import DetectionPage from "@/pages/DetectionPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import MapPage from "@/pages/MapPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AwarenessPage from "@/pages/AwarenessPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import AdminPage from "@/pages/AdminPage";
import { ChatPage } from "@/components/ChatBot";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/monitoring" element={<MonitoringPage />} />
                    <Route path="/detection" element={<DetectionPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/awareness" element={<AwarenessPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <ChatBotWidget />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
