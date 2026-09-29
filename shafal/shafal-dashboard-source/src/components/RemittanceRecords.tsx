"use client";

import { useState, useEffect } from "react";
import { Database, FileSpreadsheet } from "lucide-react";
import * as xlsx from "xlsx";

export default function RemittanceRecords({ milestoneFilter }: { milestoneFilter: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [pageSize, setPageSize] = useState<number | "All">(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Load data
  useEffect(() => {
    setLoading(true);
    fetch('/data/remittance.json')
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to load remittance data:", e);
        setLoading(false);
      });
  }, []);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, districtFilter, genderFilter, pageSize, milestoneFilter]);

  const uniqueDistricts = ["All", ...Array.from(new Set(records.map(b => b.District))).sort()];
  const uniqueGenders = ["All", ...Array.from(new Set(records.map(b => b.GENDER))).sort()];

  const filteredRecords = records.filter((b) => {
    // Skip empty rows
    if (!b.ACCT_NAME) return false;

    // Check milestone
    const matchesMilestone = milestoneFilter === "All" || !b.milestone || b.milestone === milestoneFilter;

    const matchesSearch = b.ACCT_NAME?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.PHONE && String(b.PHONE).includes(searchQuery)) ||
                          (b.BRANCH && b.BRANCH.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDistrict = districtFilter === "All" || b.District === districtFilter;
    const matchesGender = genderFilter === "All" || b.GENDER === genderFilter;
    
    return matchesMilestone && matchesSearch && matchesDistrict && matchesGender;
  });

  const totalRecords = filteredRecords.length;
  const totalPages = pageSize === "All" ? 1 : Math.ceil(totalRecords / (pageSize as number));
  const paginatedRecords = pageSize === "All" 
      ? filteredRecords 
      : filteredRecords.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

  const exportCSV = () => {
      const ws = xlsx.utils.json_to_sheet(filteredRecords);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Remittance_Loans");
      xlsx.writeFile(wb, "SHAFAL_Remittance_Loans.csv");
  };

  const formatCurrency = (val: any) => {
      if (!val) return "-";
      return "৳ " + Number(val).toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="px-6 py-5 border-b border-slate-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">Remittance Loan Records</h2>
                </div>
                <div className="flex space-x-3 items-center">
                    <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm h-9">
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                </div>
            </div>
            <div className="flex space-x-4">
                <input 
                    type="text" 
                    placeholder="Search by name, branch, or phone..." 
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[160px] transition-all"
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                >
                    {uniqueDistricts.map(d => <option key={d as string} value={d as string}>{d === 'All' ? 'All Districts' : d}</option>)}
                </select>
                <select 
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[160px] transition-all"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                >
                    {uniqueGenders.map(g => <option key={g as string} value={g as string}>{g === 'All' ? 'All Genders' : g}</option>)}
                </select>
            </div>
        </div>
        
        <div className="flex-1 overflow-auto relative">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-semibold animate-pulse bg-white/50 z-20">Loading secure records...</div>
            ) : (
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 font-semibold sticky top-0 z-10 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Participant Name</th>
                            <th className="px-6 py-4">Branch</th>
                            <th className="px-6 py-4">District</th>
                            <th className="px-6 py-4">Gender</th>
                            <th className="px-6 py-4 text-right">Sanction Limit</th>
                            <th className="px-6 py-4 text-right">Disbursed Amt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedRecords.map((b, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-800">
                                  {b.ACCT_NAME}
                                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{b.PHONE}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-600">{b.BRANCH}</td>
                                <td className="px-6 py-4 font-medium">{b.District}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold ${b.GENDER === 'F' || b.GENDER === 'Female' ? 'text-pink-600' : 'text-slate-600'}`}>
                                      {b.GENDER === 'F' ? 'Female' : b.GENDER === 'M' ? 'Male' : b.GENDER}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                                  {formatCurrency(b.SANCT_LIM)}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                                  {formatCurrency(b.DIS_AMT)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loading && filteredRecords.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center bg-slate-50 h-full justify-center">
                    <Database className="w-12 h-12 text-slate-300 mb-3" />
                    <div className="text-sm font-bold text-slate-600">No records found</div>
                    <div className="text-xs text-slate-500 mt-1">Try adjusting your filters or switching milestones.</div>
                </div>
            )}
        </div>

        {!loading && totalRecords > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between z-10 shrink-0">
                <div className="text-sm text-slate-500 font-medium">
                    Showing {pageSize === "All" ? totalRecords : Math.min(totalRecords, (currentPage - 1) * (pageSize as number) + 1)} to {pageSize === "All" ? totalRecords : Math.min(totalRecords, currentPage * (pageSize as number))} of {totalRecords} records
                </div>
                <div className="flex items-center space-x-4">
                    <select 
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value === "All" ? "All" : Number(e.target.value))}
                    >
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={500}>500 per page</option>
                        <option value="All">All</option>
                    </select>
                    
                    {pageSize !== "All" && totalPages > 1 && (
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
            </div>
        )}
    </div>
  );
}
