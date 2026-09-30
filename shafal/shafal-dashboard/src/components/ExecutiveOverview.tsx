"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LabelList } from 'recharts';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2, Download, Image as ImageIcon, FileText, MoreVertical } from 'lucide-react';

const ChartWrapper = ({ title, iconColor, children, onFocus, isFocused, id }: any) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [showExport, setShowExport] = useState(false);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showExport && chartRef.current && !chartRef.current.contains(event.target as Node)) {
                setShowExport(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExport]);

    const exportImage = async () => {
        if (!chartRef.current) return;
        setShowExport(false);
        try {
            const htmlToImage = await import('html-to-image');
            const dataURL = await htmlToImage.toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '_')}_Chart.png`;
            link.href = dataURL;
            link.click();
        } catch (err) {
            console.error("Failed to export image", err);
        }
    };

    const exportPDF = async () => {
        if (!chartRef.current) return;
        setShowExport(false);
        try {
            const htmlToImage = await import('html-to-image');
            const imgData = await htmlToImage.toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
            
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head><title>${title} - Export</title></head>
                        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                            <img src="${imgData}" style="max-width:100%; max-height:100%;" />
                            <script>
                                window.onload = () => {
                                    setTimeout(() => {
                                        window.print();
                                        setTimeout(() => window.close(), 100);
                                    }, 250);
                                };
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        } catch (err) {
            console.error("Failed to export PDF", err);
        }
    };

    return (
        <div 
            ref={chartRef} 
            className={`bg-white transition-all duration-300 flex flex-col ${isFocused ? 'fixed inset-4 sm:inset-10 z-[100] rounded-3xl shadow-2xl p-8 border-2 border-slate-200' : 'rounded-2xl shadow-sm border border-slate-200 p-4'}`}
        >
            <div className="flex items-center justify-between mb-4 z-10 relative">
                <h3 className={`text-slate-800 font-black flex items-center transition-all ${isFocused ? 'text-3xl' : 'text-sm'}`}>
                    <div className={`${isFocused ? 'w-4 h-4' : 'w-1.5 h-1.5'} rounded-full ${iconColor} mr-2 transition-all`}></div>
                    {title}
                </h3>
                
                <div className="flex items-center gap-1.5">
                    <div className="relative">
                        <button onClick={() => setShowExport(!showExport)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors" title="Export">
                            <Download className="w-4 h-4" />
                        </button>
                        {showExport && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 shadow-xl rounded-lg py-1 z-[60]">
                                <button onClick={exportImage} className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center transition-colors">
                                    <ImageIcon className="w-3.5 h-3.5 mr-2" /> Export as PNG
                                </button>
                                <button onClick={exportPDF} className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center transition-colors">
                                    <FileText className="w-3.5 h-3.5 mr-2" /> Export as PDF
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={onFocus} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors" title={isFocused ? "Restore" : "Focus Mode"}>
                        {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            <div className={`flex-1 w-full relative ${isFocused ? 'min-h-[400px]' : 'min-h-[160px]'}`}>
                {children}
            </div>
        </div>
    );
};

export default function ExecutiveOverview({ globalStats: initialGlobalStats, districtStats: initialDistrictStats, beneficiaries = [], loading = false, milestoneFilter = "Milestone II" }: any) {
    const [focusedChart, setFocusedChart] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedGender, setSelectedGender] = useState<string | null>(null);

    // Remittance Loan State
    const [remittanceRecords, setRemittanceRecords] = useState<any[]>([]);
    
    useEffect(() => {
        fetch('/smesb/shafal/data/remittance.json')
          .then(res => res.json())
          .then(data => setRemittanceRecords(data))
          .catch(e => console.error(e));
    }, []);

    // Filter remittance by milestone
    const activeRemittance = useMemo(() => {
        return remittanceRecords.filter(r => r.ACCT_NAME && (milestoneFilter === "All" || !r.milestone || r.milestone === milestoneFilter));
    }, [remittanceRecords, milestoneFilter]);

    const remittanceTotalDisbursed = activeRemittance.reduce((acc, curr) => acc + (Number(curr.DIS_AMT) || 0), 0);
    const remittanceTotalLoans = activeRemittance.length;
    const remittanceFemaleCount = activeRemittance.filter(r => r.GENDER === 'F' || r.GENDER === 'Female').length;
    const remittanceFemalePercent = remittanceTotalLoans > 0 ? Math.round((remittanceFemaleCount / remittanceTotalLoans) * 100) : 0;

    const { globalStats, districtData, dflGenderData, dfsGenderData } = useMemo(() => {
        if (!beneficiaries || beneficiaries.length === 0) {
            return {
                globalStats: initialGlobalStats,
                districtData: Object.entries(initialDistrictStats)
                    .map(([name, stats]: any) => ({ name, ...stats }))
                    .sort((a, b) => b.total - a.total),
                dflGenderData: [
                    { name: 'Female', value: initialGlobalStats.dflFemale, color: '#ec4899' },
                    { name: 'Male', value: initialGlobalStats.dflReached - initialGlobalStats.dflFemale, color: '#0ea5e9' }
                ],
                dfsGenderData: [
                    { name: 'Female', value: initialGlobalStats.dfsFemale, color: '#ec4899' },
                    { name: 'Male', value: initialGlobalStats.dfsReached - initialGlobalStats.dfsFemale, color: '#a855f7' }
                ]
            };
        }

        const filtered = beneficiaries.filter((b: any) => {
            if (selectedDistrict && b.district !== selectedDistrict) return false;
            if (selectedGender && b.gender !== selectedGender) return false;
            return true;
        });

        const stats = {
            dflTarget: initialGlobalStats?.dflTarget || 5000,
            dfsTarget: initialGlobalStats?.dfsTarget || 5000,
            dflReached: 0,
            dfsReached: 0,
            dflFemale: 0,
            dfsFemale: 0
        };

        const dStats: any = {};
        let dflMale = 0;
        let dfsMale = 0;

        filtered.forEach((b: any) => {
            const isDFL = b.component === 'DFL';
            const isDFS = b.component === 'DFS';
            
            if (isDFL) {
                stats.dflReached++;
                if (b.gender === 'Female') stats.dflFemale++;
                if (b.gender === 'Male') dflMale++;
            }
            if (isDFS) {
                stats.dfsReached++;
                if (b.gender === 'Female') stats.dfsFemale++;
                if (b.gender === 'Male') dfsMale++;
            }

            if (!dStats[b.district]) {
                dStats[b.district] = { dflCount: 0, dfsCount: 0, total: 0 };
            }
            dStats[b.district].total++;
            if (isDFL) dStats[b.district].dflCount++;
            if (isDFS) dStats[b.district].dfsCount++;
        });

        const distArr = Object.entries(dStats).map(([name, s]: any) => ({
            name,
            dfl: s.dflCount,
            dfs: s.dfsCount
        })).sort((a, b) => b.dfl - a.dfl);

        return {
            globalStats: stats,
            districtData: distArr,
            dflGenderData: [
                { name: 'Female', value: stats.dflFemale, color: '#ec4899' },
                { name: 'Male', value: dflMale, color: '#0ea5e9' }
            ].filter(d => d.value > 0),
            dfsGenderData: [
                { name: 'Female', value: stats.dfsFemale, color: '#ec4899' },
                { name: 'Male', value: dfsMale, color: '#a855f7' }
            ].filter(d => d.value > 0)
        };
    }, [beneficiaries, selectedDistrict, selectedGender, initialGlobalStats, initialDistrictStats]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
                    <p className="text-white font-bold mb-1.5 uppercase tracking-widest text-[10px] border-b border-slate-700 pb-1.5">{label || payload[0].name}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 my-0.5">
                            <span className="text-slate-300 text-[10px] font-semibold uppercase">{entry.name}:</span>
                            <span className="text-white font-black text-xs" style={{ color: entry.color || entry.fill }}>{entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const toggleFocus = (id: string) => {
        if (focusedChart === id) {
            setFocusedChart(null);
        } else {
            setFocusedChart(id);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4 max-w-7xl mx-auto relative">
            
            {/* Dark backdrop when a chart is focused */}
            {focusedChart && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]" onClick={() => setFocusedChart(null)}></div>
            )}

            {/* Header (Minimal) */}
            <div className="flex justify-between items-end">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Executive Dashboard</h2>
                    {(selectedDistrict || selectedGender) && (
                        <button 
                            onClick={() => { setSelectedDistrict(null); setSelectedGender(null); }}
                            className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full hover:bg-red-200 transition-colors shadow-sm"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Smart Colorful KPI Cards (Minimal Space) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* DFL Colorful Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-md p-4 relative overflow-hidden text-white flex justify-between items-center">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"></div>
                    <div className="flex-[1.2] pr-2">
                        <span className="text-blue-100 text-[10px] font-black uppercase tracking-widest block mb-0.5">DFL Target</span>
                        <div className="text-2xl font-black tracking-tighter leading-none">{globalStats.dflTarget.toLocaleString()}</div>
                    </div>
                    <div className="flex-[1] border-l border-white/20 pl-3">
                        <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Achieved</span>
                        <div className="text-lg font-bold flex items-center leading-none">
                            {globalStats.dflReached.toLocaleString()} 
                            <span className="ml-1 text-[10px] font-black bg-white text-blue-600 px-1 py-0.5 rounded shadow-sm">
                                {Math.round((globalStats.dflReached/globalStats.dflTarget)*100)}%
                            </span>
                        </div>
                    </div>
                    <div className="flex-[1] border-l border-white/20 pl-3">
                        <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Female</span>
                        <div className="text-lg font-bold flex items-center leading-none">
                            {globalStats.dflFemale.toLocaleString()} 
                            <span className="ml-1 text-[10px] font-black bg-pink-500 text-white px-1 py-0.5 rounded shadow-sm">
                                {globalStats.dflReached ? Math.round((globalStats.dflFemale/globalStats.dflReached)*100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* DFS Colorful Card */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl shadow-md p-4 relative overflow-hidden text-white flex justify-between items-center">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"></div>
                    <div className="flex-[1.2] pr-2">
                        <span className="text-purple-100 text-[10px] font-black uppercase tracking-widest block mb-0.5">DFS Target</span>
                        <div className="text-2xl font-black tracking-tighter leading-none">{globalStats.dfsTarget.toLocaleString()}</div>
                    </div>
                    <div className="flex-[1] border-l border-white/20 pl-3">
                        <span className="text-purple-100 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Achieved</span>
                        <div className="text-lg font-bold flex items-center leading-none">
                            {globalStats.dfsReached.toLocaleString()} 
                            <span className="ml-1 text-[10px] font-black bg-white text-purple-600 px-1 py-0.5 rounded shadow-sm">
                                {Math.round((globalStats.dfsReached/globalStats.dfsTarget)*100)}%
                            </span>
                        </div>
                    </div>
                    <div className="flex-[1] border-l border-white/20 pl-3">
                        <span className="text-purple-100 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Female</span>
                        <div className="text-lg font-bold flex items-center leading-none">
                            {globalStats.dfsFemale.toLocaleString()} 
                            <span className="ml-1 text-[10px] font-black bg-pink-500 text-white px-1 py-0.5 rounded shadow-sm">
                                {globalStats.dfsReached ? Math.round((globalStats.dfsFemale/globalStats.dfsReached)*100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Remittance Loan Colorful Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl shadow-md p-4 relative overflow-hidden text-white flex justify-between items-center">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"></div>
                    <div className="flex-[1.4] pr-2">
                        <span className="text-emerald-100 text-[10px] font-black uppercase tracking-widest block mb-0.5 whitespace-nowrap">Remittance Loans</span>
                        <div className="text-2xl font-black tracking-tighter leading-none">{remittanceTotalLoans.toLocaleString()}</div>
                    </div>
                    <div className="flex-[1] border-l border-white/20 pl-3">
                        <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Disbursed</span>
                        <div className="text-lg font-bold flex items-center leading-none tracking-tight">
                            {remittanceTotalDisbursed >= 1000000 
                                ? `${(remittanceTotalDisbursed / 1000000).toFixed(1)}M BDT` 
                                : `${remittanceTotalDisbursed.toLocaleString()} BDT`}
                        </div>
                    </div>
                    <div className="flex-[0.6] border-l border-white/20 pl-3">
                        <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Female</span>
                        <div className="text-lg font-bold flex items-center leading-none">
                            {remittanceFemaleCount.toLocaleString()} 
                            <span className="ml-1 text-[10px] font-black bg-pink-500 text-white px-1 py-0.5 rounded shadow-sm">
                                {remittanceFemalePercent}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 pb-10">
                
                {/* District Reach DFL */}
                <ChartWrapper 
                    id="dfl-district"
                    title="District Reach: DFL" 
                    iconColor="bg-blue-500" 
                    isFocused={focusedChart === 'dfl-district'}
                    onFocus={() => toggleFocus('dfl-district')}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 35, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDfl" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: focusedChart === 'dfl-district' ? 14 : 11, fontWeight: 700}} width={focusedChart === 'dfl-district' ? 120 : 85} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="dfl" name="DFL Reached" radius={[0, 4, 4, 0]} barSize={focusedChart === 'dfl-district' ? 32 : 14} onClick={(data) => setSelectedDistrict(selectedDistrict === data.name ? null : (data.name || null))}>
                                {districtData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill="url(#colorDfl)" opacity={!selectedDistrict || selectedDistrict === entry.name ? 1 : 0.25} cursor="pointer" />
                                ))}
                                <LabelList dataKey="dfl" position="right" style={{ fill: '#64748b', fontSize: focusedChart === 'dfl-district' ? 14 : 11, fontWeight: 700 }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* District Reach DFS */}
                <ChartWrapper 
                    id="dfs-district"
                    title="District Reach: DFS" 
                    iconColor="bg-purple-500" 
                    isFocused={focusedChart === 'dfs-district'}
                    onFocus={() => toggleFocus('dfs-district')}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 35, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDfs" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#c084fc" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#9333ea" stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: focusedChart === 'dfs-district' ? 14 : 11, fontWeight: 700}} width={focusedChart === 'dfs-district' ? 120 : 85} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="dfs" name="DFS Reached" radius={[0, 4, 4, 0]} barSize={focusedChart === 'dfs-district' ? 32 : 14} onClick={(data) => setSelectedDistrict(selectedDistrict === data.name ? null : (data.name || null))}>
                                {districtData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill="url(#colorDfs)" opacity={!selectedDistrict || selectedDistrict === entry.name ? 1 : 0.25} cursor="pointer" />
                                ))}
                                <LabelList dataKey="dfs" position="right" style={{ fill: '#64748b', fontSize: focusedChart === 'dfs-district' ? 14 : 11, fontWeight: 700 }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* Gender Ratio DFL */}
                <ChartWrapper 
                    id="dfl-gender"
                    title="Gender Profile: DFL" 
                    iconColor="bg-pink-500" 
                    isFocused={focusedChart === 'dfl-gender'}
                    onFocus={() => toggleFocus('dfl-gender')}
                >
                    <div className="flex-1 w-full h-full flex flex-row items-center justify-center gap-12 px-4">
                        <div className={`relative flex-shrink-0 ${focusedChart === 'dfl-gender' ? 'w-64 h-64' : 'w-36 h-36'}`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dflGenderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={focusedChart === 'dfl-gender' ? 80 : 48}
                                        outerRadius={focusedChart === 'dfl-gender' ? 110 : 68}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={6}
                                    >
                                        {dflGenderData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                opacity={!selectedGender || selectedGender === entry.name ? 1 : 0.25}
                                                cursor="pointer"
                                                onClick={() => setSelectedGender(selectedGender === entry.name ? null : entry.name)}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                <span className={`${focusedChart === 'dfl-gender' ? 'text-6xl' : 'text-lg'} font-black text-slate-800 tracking-tighter leading-none mt-1 transition-all`}>
                                    {globalStats.dflReached ? Math.round((globalStats.dflFemale / globalStats.dflReached) * 100) : 0}%
                                </span>
                                <span className={`${focusedChart === 'dfl-gender' ? 'text-lg' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-widest mt-2 transition-all`}>Female</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 justify-center">
                            {dflGenderData.map((entry, index) => (
                                <div key={index} className={`flex items-center ${focusedChart === 'dfl-gender' ? 'gap-4' : 'gap-3'}`}>
                                    <div className={`${focusedChart === 'dfl-gender' ? 'w-6 h-6' : 'w-4 h-4'} rounded-full shadow-sm`} style={{ backgroundColor: entry.color }}></div>
                                    <span className={`${focusedChart === 'dfl-gender' ? 'text-xl' : 'text-xs'} font-bold text-slate-600`}>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartWrapper>

                {/* Gender Ratio DFS */}
                <ChartWrapper 
                    id="dfs-gender"
                    title="Gender Profile: DFS" 
                    iconColor="bg-pink-500" 
                    isFocused={focusedChart === 'dfs-gender'}
                    onFocus={() => toggleFocus('dfs-gender')}
                >
                    <div className="flex-1 w-full h-full flex flex-row items-center justify-center gap-12 px-4">
                        <div className={`relative flex-shrink-0 ${focusedChart === 'dfs-gender' ? 'w-64 h-64' : 'w-36 h-36'}`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dfsGenderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={focusedChart === 'dfs-gender' ? 80 : 48}
                                        outerRadius={focusedChart === 'dfs-gender' ? 110 : 68}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={6}
                                    >
                                        {dfsGenderData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                opacity={!selectedGender || selectedGender === entry.name ? 1 : 0.25}
                                                cursor="pointer"
                                                onClick={() => setSelectedGender(selectedGender === entry.name ? null : entry.name)}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                <span className={`${focusedChart === 'dfs-gender' ? 'text-6xl' : 'text-lg'} font-black text-slate-800 tracking-tighter leading-none mt-1 transition-all`}>
                                    {globalStats.dfsReached ? Math.round((globalStats.dfsFemale / globalStats.dfsReached) * 100) : 0}%
                                </span>
                                <span className={`${focusedChart === 'dfs-gender' ? 'text-lg' : 'text-[9px]'} font-bold text-slate-400 uppercase tracking-widest mt-2 transition-all`}>Female</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 justify-center">
                            {dfsGenderData.map((entry, index) => (
                                <div key={index} className={`flex items-center ${focusedChart === 'dfs-gender' ? 'gap-4' : 'gap-3'}`}>
                                    <div className={`${focusedChart === 'dfs-gender' ? 'w-6 h-6' : 'w-4 h-4'} rounded-full shadow-sm`} style={{ backgroundColor: entry.color }}></div>
                                    <span className={`${focusedChart === 'dfs-gender' ? 'text-xl' : 'text-xs'} font-bold text-slate-600`}>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartWrapper>

            </div>
        </div>
    );
}



