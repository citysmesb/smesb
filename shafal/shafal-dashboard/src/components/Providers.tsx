"use client";

import { SessionProvider } from "next-auth/react";
import { DashboardProvider } from "@/lib/DashboardContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </SessionProvider>
  );
}
