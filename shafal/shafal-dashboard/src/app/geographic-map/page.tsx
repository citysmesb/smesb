

import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import fs from "fs";
import path from "path";

export default async function App() {
  const session = { user: { name: "Admin User", role: "Admin", permissions: ["dashboard", "geographic-map", "indicators", "data", "case-stories", "archive", "uncdf", "users"] } };

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
        role={(session?.user as any)?.role || "Unknown"} permissions={(session?.user as any)?.permissions} 
        userName={session?.user?.name || "User"} 
        initialIndicators={dashboardData.indicators}
        districtStats={dashboardData.districtStats}
        globalStats={dashboardData.globalStats}
    />
  );
}


