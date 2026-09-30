import DashboardLayout from "@/components/DashboardLayout";
import fs from "fs";
import path from "path";

export default function App() {
  // Bypassed NextAuth session for static GitHub Pages deployment
  const mockSession = {
    user: {
      name: "Admin User",
      role: "admin",
      permissions: ["dashboard", "geographic-map", "indicators", "data", "case-stories", "archive", "uncdf", "users"]
    }
  };

  // Fetch ultra-fast decoupled static data
  let dashboardData = { indicators: [], districtStats: {}, globalStats: {} };
  try {
    const jsonStr = fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'dashboard-data.json'), 'utf8');
    dashboardData = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Dashboard data not found");
  }

  return (
    <DashboardLayout 
        role={mockSession.user.role} 
        permissions={mockSession.user.permissions} 
        userName={mockSession.user.name} 
        initialIndicators={dashboardData.indicators}
        districtStats={dashboardData.districtStats}
        globalStats={dashboardData.globalStats}
    />
  );
}
