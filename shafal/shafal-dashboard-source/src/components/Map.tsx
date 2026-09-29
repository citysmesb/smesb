"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../app/map.css";

const SHAFAL_DISTRICTS = ["Chattogram", "Feni", "Cumilla", "Munshiganj", "Tangail", "Narsingdi"];

let cachedGeoData: any = null;

export default function BangladeshMap({ districtStats, globalStats, milestoneFilter = "All" }: { districtStats: any, globalStats: any, milestoneFilter?: string }) {
    const [geoData, setGeoData] = useState<any>(cachedGeoData);
    const [loading, setLoading] = useState(!cachedGeoData);
    const [mapKey] = useState(() => Math.random().toString(36).substring(7));

    useEffect(() => {
        if (cachedGeoData) {
            return; // Already loaded
        }
        
        fetch('/data/bd-districts.json')
            .then(res => res.json())
            .then(data => {
                cachedGeoData = data;
                setGeoData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load map data", err);
                setLoading(false);
            });
    }, []);

    if (loading || !geoData) return (
        <div className="p-4 text-slate-500 font-semibold flex flex-col items-center justify-center w-full h-full">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
            Loading Geographic Data...
        </div>
    );

    const DISTRICT_COLORS: Record<string, string> = {
        "Chattogram": "#0ea5e9", // Sky
        "Feni": "#f59e0b",       // Amber
        "Cumilla": "#10b981",    // Emerald
        "Munshiganj": "#f43f5e", // Rose
        "Tangail": "#8b5cf6",    // Violet
        "Narsingdi": "#3b82f6"   // Blue
    };

    const getDistrictStats = (districtName: string) => {
        return districtStats[districtName] || { bCount: 0, fCount: 0, dflCount: 0, dfsCount: 0, dflFCount: 0, dfsFCount: 0 };
    };

    const styleFeature = (feature: any) => {
        const districtName = feature.properties.shapeName === 'Chittagong' ? 'Chattogram' : 
                             feature.properties.shapeName === 'Comilla' ? 'Cumilla' : 
                             feature.properties.shapeName;
        const isTarget = SHAFAL_DISTRICTS.includes(districtName);

        if (isTarget) {
            return {
                fillColor: DISTRICT_COLORS[districtName] || '#3b82f6',
                weight: 1,
                opacity: 1,
                color: '#ffffff',
                fillOpacity: 0.8
            };
        }

        return {
            fillColor: '#e2e8f0', // slate-200
            weight: 1,
            opacity: 1,
            color: '#cbd5e1', // slate-300
            fillOpacity: 0.8
        };
    };

    const getTooltipOffset = (districtName: string): [number, number] => {
        // Adjust lower bottom parts and erratic bounding box centers.
        // [x, y]: x > 0 is right, y > 0 is down (south).
        // Negative y moves the label UP (north) away from the Bay of Bengal.
        switch (districtName) {
            // Extreme Southern Coastal Districts (Sundarbans & Islands)
            case "Satkhira": 
            case "Shatkhira": return [-10, -50]; // Move far North
            case "Khulna": return [10, -50]; // Move far North
            case "Bagerhat": return [-10, -60]; // Move far North
            case "Patuakhali": return [0, -40]; // Move North
            case "Barguna": return [0, -20]; // Move North
            case "Bhola": return [0, -25]; // Move North
            case "Chattogram": return [15, -30]; // Move North, slightly East
            case "Cox's Bazar": return [10, -40]; // Move North
            case "Noakhali": return [-15, -20]; // Move North West
            
            // Mid-South Overlaps
            case "Pirojpur": 
            case "Pirozpur": return [0, -5];
            case "Jhalokati": return [-15, 0]; // Move West
            case "Barisal": return [15, 0]; // Move East
            
            // Central Overlaps
            case "Chandpur": return [10, 0];
            case "Shariatpur": return [-15, -5];
            case "Feni": return [-15, -15];
            case "Cumilla": return [-5, -5];
            case "Munshiganj": return [0, 5];
            case "Tangail": return [0, -5];
            case "Narsingdi": return [5, 5];
            
            // Hill Tracts
            case "Khagrachhari": return [0, 10];
            case "Rangamati": return [10, 0];
            case "Bandarban": return [15, 10];
            
            default: return [0, 0];
        }
    };

    const onEachFeature = (feature: any, layer: any) => {
      const districtName = feature.properties.shapeName === 'Chittagong' ? 'Chattogram' : 
                           feature.properties.shapeName === 'Comilla' ? 'Cumilla' : 
                           feature.properties.shapeName;
      
      const isTarget = SHAFAL_DISTRICTS.includes(districtName);
      
      if (districtName) {
          layer.bindTooltip(districtName, { 
              permanent: true, 
              direction: "center", 
              offset: getTooltipOffset(districtName),
              className: isTarget ? "district-label-target" : "district-label-other" 
          });
      }

      if (isTarget) {
        const stats = getDistrictStats(districtName);
        
        const dflFemalePct = stats.dflCount ? Math.round((stats.dflFCount / stats.dflCount) * 100) : 0;
        const dfsFemalePct = stats.dfsCount ? Math.round((stats.dfsFCount / stats.dfsCount) * 100) : 0;
        
        const popupHTML = `
            <div style="font-family: inherit; min-width: 160px; padding: 2px;">
                <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 900; color: #0f172a; border-bottom: 2px solid ${DISTRICT_COLORS[districtName]}; padding-bottom: 4px; text-transform: uppercase;">${districtName}</h3>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase;">DFL:</span> 
                    <strong style="color: #0f172a; font-size: 12px;">${stats.dflCount.toLocaleString()} <span style="font-weight: 700; color: #ec4899;">(${dflFemalePct}% F)</span></strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase;">DFS:</span> 
                    <strong style="color: #0f172a; font-size: 12px;">${stats.dfsCount.toLocaleString()} <span style="font-weight: 700; color: #ec4899;">(${dfsFemalePct}% F)</span></strong>
                </div>
            </div>
        `;
        layer.bindPopup(popupHTML, { closeButton: false });
      }
      
      // Add simple hover effect
      layer.on({
        mouseover: (e: any) => {
            const l = e.target;
            l.setStyle({ fillOpacity: 1, weight: 2 });
            l.bringToFront();
        },
        mouseout: (e: any) => {
            const l = e.target;
            l.setStyle(styleFeature(feature));
        }
      });
    };

    return (
      <div className="relative w-full h-full flex">
        <MapContainer 
          key={mapKey}
          center={[23.6850, 90.3563]} 
          zoom={7} 
          className="w-full h-full z-0 bg-white"
          zoomControl={false}
        >
          <GeoJSON
            key={mapKey + '-' + milestoneFilter + '-geojson'}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
          <MapOverlay globalStats={globalStats} />
        </MapContainer>
      </div>
    );
}

function MapOverlay({ globalStats }: { globalStats: any }) {
    return (
        <div className="absolute top-6 right-6 z-[1000] w-[260px] pointer-events-none space-y-3 hidden lg:block">
            
            {/* DFL Minimal Card */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 p-4">
                <div className="flex items-center mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">DFL metrics</h2>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target</span>
                        <span className="text-sm font-black text-slate-800">{globalStats.dflTarget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Achieved</span>
                        <span className="text-sm font-black text-slate-800">
                            {globalStats.dflReached.toLocaleString()} 
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Female</span>
                        <span className="text-sm font-black text-pink-600">
                            {globalStats.dflFemale.toLocaleString()} 
                            <span className="ml-1 text-[9px] bg-pink-50 px-1 py-0.5 rounded border border-pink-100">{Math.round((globalStats.dflFemale/globalStats.dflReached)*100)}%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* DFS Minimal Card */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 p-4">
                <div className="flex items-center mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">DFS metrics</h2>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target</span>
                        <span className="text-sm font-black text-slate-800">{globalStats.dfsTarget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Achieved</span>
                        <span className="text-sm font-black text-slate-800">
                            {globalStats.dfsReached.toLocaleString()} 
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Female</span>
                        <span className="text-sm font-black text-pink-600">
                            {globalStats.dfsFemale.toLocaleString()} 
                            <span className="ml-1 text-[9px] bg-pink-50 px-1 py-0.5 rounded border border-pink-100">{Math.round((globalStats.dfsFemale/globalStats.dfsReached)*100)}%</span>
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}


