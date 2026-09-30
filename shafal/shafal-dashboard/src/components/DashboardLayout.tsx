"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Map as MapIcon, BarChart3, Users, LogOut, FileSpreadsheet, Database, PanelLeftClose, PanelLeftOpen, Sprout, HandHeart, Landmark, CircleDollarSign, BookOpen, Archive as ArchiveIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as xlsx from "xlsx";
import ExecutiveOverview from "./ExecutiveOverview";
import IndicatorPerformance from "./IndicatorPerformance";
import UserManagement from "./UserManagement";
import RemittanceRecords from "./RemittanceRecords";
import { usePathname } from "next/navigation";

const BangladeshMap = dynamic(() => import("./Map"), { ssr: false });

export default function DashboardLayout({ 
  role, 
  userName, 
  permissions,
  initialIndicators, 
  districtStats,
  globalStats,
  children
}: { 
  role: string, 
  userName: string,
  permissions?: string[],
  initialIndicators: any[],
  districtStats: any,
  globalStats: any,
  children?: React.ReactNode
}) {
  const pathname = usePathname();
  let activeTab = "overview";
  if (pathname === '/geographic-map') activeTab = "map";
  else if (pathname === '/indicators') activeTab = "indicators";
  else if (pathname === '/data') activeTab = "data";
  else if (pathname === '/remittance') activeTab = "remittance";
  else if (pathname === '/users') activeTab = "users";
  else if (pathname.startsWith('/case-stories')) activeTab = "case-stories";
  else if (pathname === '/archive') activeTab = "archive";
  else if (pathname === '/uncdf') activeTab = "uncdf";
  
  const [milestoneFilter, setMilestoneFilter] = useState("All");
  
  // Data load for Beneficiaries Tab
    const [isAuthChecking, setIsAuthChecking] = useState(true);
  useEffect(() => { 
    if (!localStorage.getItem("shafal_logged_in")) { 
      window.location.href = "/smesb/shafal/login"; 
    } else {
      setIsAuthChecking(false);
    }
  }, []);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loadingBens, setLoadingBens] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [componentFilter, setComponentFilter] = useState<"All" | "DFL" | "DFS">("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [pageSize, setPageSize] = useState<number | "All">(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 on filter change
  useEffect(() => {
      setCurrentPage(1);
  }, [searchQuery, componentFilter, districtFilter, genderFilter, pageSize]);

  const uniqueDistricts = ["All", ...Array.from(new Set(beneficiaries.map(b => b.district))).sort()];
  const uniqueGenders = ["All", ...Array.from(new Set(beneficiaries.map(b => b.gender))).sort()];

  const filteredBeneficiaries = beneficiaries.filter((b) => {
      if (milestoneFilter !== "All" && milestoneFilter !== "Milestone II") return false; // Only Milestone II has data right now

      const matchesSearch = b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (b.phone && b.phone.includes(searchQuery));
      const matchesComponent = componentFilter === "All" || b.component === componentFilter;
      const matchesDistrict = districtFilter === "All" || b.district === districtFilter;
      const matchesGender = genderFilter === "All" || b.gender === genderFilter;
      
      return matchesSearch && matchesComponent && matchesDistrict && matchesGender;
  });

  const totalRecords = filteredBeneficiaries.length;
  const totalPages = pageSize === "All" ? 1 : Math.ceil(totalRecords / (pageSize as number));
  const paginatedBeneficiaries = pageSize === "All" 
      ? filteredBeneficiaries 
      : filteredBeneficiaries.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

  useEffect(() => {
      if ((activeTab === 'data' || activeTab === 'overview') && beneficiaries.length === 0 && !loadingBens) {
          setLoadingBens(true);
          fetch('/smesb/shafal/data/beneficiaries.json')
            .then(res => res.json())
            .then(data => { setBeneficiaries(data); setLoadingBens(false); })
            .catch(e => { console.error(e); setLoadingBens(false); });
      }
  }, [activeTab, beneficiaries.length, loadingBens]);

  const exportCSV = () => {
      const ws = xlsx.utils.json_to_sheet(filteredBeneficiaries);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Beneficiaries");
      xlsx.writeFile(wb, "SHAFAL_Beneficiaries.csv");
  };

  const allNavItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/", permId: "dashboard", group: "OVERVIEW" },
    { id: "map", label: "Geographic Map", icon: MapIcon, href: "/geographic-map", permId: "geographic-map", group: "OPERATIONS" },
    { id: "indicators", label: "Indicator Progress", icon: BarChart3, href: "/indicators", permId: "indicators", group: "OPERATIONS" },
    { id: "data", label: "Beneficiary Records", icon: Database, href: "/data", permId: "data", group: "OPERATIONS" },
    { id: "remittance", label: "Remittance Loan", icon: HandHeart, href: "/remittance", permId: "remittance", group: "OPERATIONS" },
    { id: "case-stories", label: "Case Stories", icon: BookOpen, href: "/case-stories", permId: "case-stories", group: "RESOURCES" },
    { id: "archive", label: "Archive", icon: ArchiveIcon, href: "/archive", permId: "archive", group: "RESOURCES" },
    { id: "uncdf", label: "UNCDF & City Partnership", icon: Landmark, href: "/uncdf", permId: "uncdf", group: "RESOURCES" },
    { id: "users", label: "User Management", icon: Users, href: "/users", permId: "users", group: "ADMINISTRATION" }
  ];

  const navItems = permissions 
    ? allNavItems.filter(item => permissions.includes(item.permId) || item.permId === 'case-stories' || item.permId === 'archive' || item.permId === 'uncdf' || item.permId === 'remittance')
    : allNavItems; // fallback if permissions not provided

  if (role === 'Admin' && !navItems.find(i => i.id === 'users')) {
      navItems.push({ id: "users", label: "User Management", icon: Users, href: "/users", permId: "users", group: "ADMINISTRATION" });
  }

  if (isAuthChecking) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
  }

  // Zero out stats if not All or Milestone II (no data yet for I or III)
  const hasData = milestoneFilter === "All" || milestoneFilter === "Milestone II";

  const getGlobalTarget = (milestone: string) => {
      if (milestone === "Milestone I") return 0;
      if (milestone === "All") return 15000;
      return 5000; // Milestone II, III, IV
  };

  const currentTarget = getGlobalTarget(milestoneFilter);

  const activeGlobalStats = hasData ? {
      ...globalStats,
      dflTarget: currentTarget,
      dfsTarget: currentTarget
  } : {
      dflTotal: 0,
      dflFemale: 0,
      dfsTotal: 0,
      dfsFemale: 0,
      dflReached: 0,
      dfsReached: 0,
      dflTarget: currentTarget,
      dfsTarget: currentTarget,
      totalReach: 0
  };

  const activeDistrictStats = hasData ? districtStats : Object.keys(districtStats).reduce((acc, dist) => {
      acc[dist] = { dflCount: 0, fCount: 0, dfsCount: 0, bCount: 0, total: 0 };
      return acc;
  }, {} as any);

  const activeInitialIndicators = initialIndicators.map((ind: any) => {
      let t_str = ind.target_str;
      let a_str = ind.actual_str;

      if (milestoneFilter === "Milestone I") {
          t_str = "0";
      } else if (milestoneFilter === "All") {
          if (ind.id === "DFL - 1.2" || ind.id === "DFS - 1.2") {
              t_str = "15,000 (60% women)";
          }
      } else {
          if (ind.id === "DFL - 1.2" || ind.id === "DFS - 1.2") {
              t_str = "5,000 (60% women)";
          }
      }

      if (!hasData) {
          a_str = "0";
      }

      return {
          ...ind,
          target_str: t_str,
          actual_str: a_str
      };
  });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`transition-all duration-300 ease-in-out bg-[#0f172a] border-r border-[#1e293b] flex flex-col shadow-xl z-20 shrink-0 ${isCollapsed ? 'w-20' : 'w-[280px]'}`}>
        
        {/* Header / Logo */}
        <div className={`h-20 flex items-center shrink-0 ${isCollapsed ? 'justify-center border-b border-[#1e293b]' : 'px-6 justify-between'}`}>
            {isCollapsed ? (
                <button onClick={() => setIsCollapsed(false)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-[#1e293b] rounded-lg" title="Expand Sidebar">
                    <PanelLeftOpen className="w-6 h-6" />
                </button>
            ) : (
                <div className="flex items-center">
                    <div className="relative shrink-0">
                        <HandHeart className="w-7 h-7 text-[#38bdf8]" />
                        <div className="absolute -bottom-1 -right-1 bg-[#0f172a] rounded-full p-[1px]">
                            <CircleDollarSign className="w-4 h-4 text-green-400 fill-[#0f172a]" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white ml-3 tracking-tight">SHAFAL</h1>
                </div>
            )}
            
            {!isCollapsed && (
                <button onClick={() => setIsCollapsed(true)} className="text-slate-400 hover:text-white transition-colors">
                    <PanelLeftClose className="w-5 h-5" />
                </button>
            )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {Object.entries(
            navItems.reduce((acc, item) => {
              if (!acc[item.group]) acc[item.group] = [];
              acc[item.group].push(item);
              return acc;
            }, {} as Record<string, typeof navItems>)
          ).map(([groupName, items]) => (
            <div key={groupName} className="mb-6">
                {!isCollapsed && (
                    <div className="px-6 mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{groupName}</span>
                    </div>
                )}
                <ul className="space-y-1 px-3">
                    {items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <li key={item.id}>
                                <Link 
                                  href={item.href}
                                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative ${isActive ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/50'}`}
                                >
                                  {isActive && !isCollapsed && (
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                  )}
                                  <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
                                  {!isCollapsed && <span className="font-semibold text-sm">{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0b1120]">
          <div className="flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-sm">{userName.charAt(0).toUpperCase()}</span>
                </div>
                {!isCollapsed && (
                    <div className="ml-3 flex flex-col min-w-0">
                        <span className="font-bold text-white text-sm truncate">{userName}</span>
                        <span className="text-xs font-semibold text-slate-400 truncate">{role}</span>
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <button onClick={async () => { localStorage.removeItem("shafal_logged_in"); window.location.href = "/smesb/shafal/login"; }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                </button>
            )}
          </div>
          {isCollapsed && (
              <button onClick={async () => { localStorage.removeItem("shafal_logged_in"); window.location.href = "/smesb/shafal/login"; }} className="w-full mt-4 flex items-center justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
              </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50">
        
        {/* Global Milestone Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
           <div></div>
           <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-500 font-medium">Active Phase:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">{["All", "Milestone I", "Milestone II", "Milestone III"].map((m) => (<button key={m} onClick={() => setMilestoneFilter(m)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${milestoneFilter === m ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>{m === "All" ? "All" : m.replace("Milestone ", "")}</button>))}</div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            
            {children ? children : (
              <>
                {activeTab === 'overview' && (
                    <ExecutiveOverview globalStats={activeGlobalStats} districtStats={activeDistrictStats} beneficiaries={filteredBeneficiaries} loading={loadingBens} milestoneFilter={milestoneFilter} />
                )}

                {activeTab === 'map' && (
                    <div className="absolute inset-0 z-0 bg-slate-100 mt-14">
                        <BangladeshMap districtStats={activeDistrictStats} globalStats={activeGlobalStats} milestoneFilter={milestoneFilter} />
                    </div>
                )}


            {activeTab === 'indicators' && (
                <IndicatorPerformance indicators={activeInitialIndicators} />
            )}

            {activeTab === 'remittance' && (
                <RemittanceRecords milestoneFilter={milestoneFilter} />
            )}

            {activeTab === 'data' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-slate-200 bg-white space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Beneficiary Records</h2>
                            </div>
                            <div className="flex space-x-3 items-center">
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button onClick={() => setComponentFilter("All")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${componentFilter === 'All' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
                                    <button onClick={() => setComponentFilter("DFL")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${componentFilter === 'DFL' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>DFL</button>
                                    <button onClick={() => setComponentFilter("DFS")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${componentFilter === 'DFS' ? 'bg-white shadow-sm text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}>DFS</button>
                                </div>
                                <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm h-9">
                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                                </button>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <input 
                                type="text" 
                                placeholder="Search by name or mobile..." 
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select 
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white min-w-[160px] transition-all"
                                value={districtFilter}
                                onChange={(e) => setDistrictFilter(e.target.value)}
                            >
                                {uniqueDistricts.map(d => <option key={d as string} value={d as string}>{d === 'All' ? 'All Districts' : d}</option>)}
                            </select>
                            <select 
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white min-w-[160px] transition-all"
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                            >
                                {uniqueGenders.map(g => <option key={g as string} value={g as string}>{g === 'All' ? 'All Genders' : g}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                        {loadingBens ? (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm font-semibold animate-pulse">Loading secure records...</div>
                        ) : (
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 font-semibold sticky top-0 z-10 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Participant Name</th>
                                        <th className="px-6 py-4">Mobile Number</th>
                                        <th className="px-6 py-4">Component</th>
                                        <th className="px-6 py-4">District</th>
                                        <th className="px-6 py-4">Gender</th>
                                        <th className="px-6 py-4">Source</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedBeneficiaries.map((b, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-800">{b.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{b.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${b.component === 'DFL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {b.component}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{b.district}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold ${b.gender === 'Female' ? 'text-pink-600' : 'text-slate-600'}`}>{b.gender}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{b.source}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {!loadingBens && totalRecords > 0 && (
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center text-sm text-slate-600">
                                    <span className="mr-2 font-medium">Rows per page:</span>
                                    <select 
                                        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                                        value={pageSize}
                                        onChange={(e) => setPageSize(e.target.value === "All" ? "All" : Number(e.target.value))}
                                    >
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={500}>500</option>
                                        <option value="All">All</option>
                                    </select>
                                </div>
                                
                                <div className="text-sm text-slate-500 font-medium hidden md:block">
                                    Showing {pageSize === "All" ? 1 : ((currentPage - 1) * (pageSize as number)) + 1} to {pageSize === "All" ? totalRecords : Math.min(currentPage * (pageSize as number), totalRecords)} of {totalRecords.toLocaleString()} entries
                                </div>

                                {pageSize !== "All" && (
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors shadow-sm"
                                        >
                                            Prev
                                        </button>
                                        <span className="px-3 text-sm font-semibold text-slate-700">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button 
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors shadow-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loadingBens && filteredBeneficiaries.length === 0 && (
                            <div className="p-10 text-center flex flex-col items-center bg-slate-50 border-t border-slate-100 h-full justify-center">
                                <Database className="w-12 h-12 text-slate-300 mb-3" />
                                <div className="text-sm font-bold text-slate-600">No records found</div>
                                <div className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <UserManagement />
            )}
              </>
            )}

        </div>
      </main>
    </div>
  );
}



