"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

type DashboardState = {
  component: "All" | "DFL" | "DFS";
  district: string;
  gender: string;
  indicator: string;
  setComponent: (val: "All" | "DFL" | "DFS") => void;
  setDistrict: (val: string) => void;
  setGender: (val: string) => void;
  setIndicator: (val: string) => void;
  beneficiaries: any[];
  indicators: any[];
  geoData: any;
};

const DashboardContext = createContext<DashboardState | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [component, setComponent] = useState<"All" | "DFL" | "DFS">("All");
  const [district, setDistrict] = useState("All");
  const [gender, setGender] = useState("All");
  const [indicator, setIndicator] = useState("All");
  
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.beneficiaries) setBeneficiaries(data.beneficiaries);
        if (data.indicators) setIndicators(data.indicators);
        if (data.geoData) setGeoData(data.geoData);
      })
      .catch(console.error);
  }, []);

  return (
    <DashboardContext.Provider value={{
      component, district, gender, indicator,
      setComponent, setDistrict, setGender, setIndicator,
      beneficiaries, indicators, geoData
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
