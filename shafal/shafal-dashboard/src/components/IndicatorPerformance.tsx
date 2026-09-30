"use client";

import { useState } from "react";
import { Target, CheckCircle2, Activity, Zap, Flag } from "lucide-react";

export default function IndicatorPerformance({ indicators }: { indicators: any[] }) {
    const [activeTab, setActiveTab] = useState<"DFL" | "DFS">("DFL");
    
    // Sort them by number to make it a logical journey (e.g., 1.2 -> 1.3 -> 1.4)
    const activeIndicators = indicators
        .filter(ind => ind.component === activeTab)
        .sort((a, b) => {
            const numA = parseFloat(a.number.replace(/[^\d.]/g, '')) || 0;
            const numB = parseFloat(b.number.replace(/[^\d.]/g, '')) || 0;
            return numA - numB;
        });

    const isDFL = activeTab === 'DFL';

    return (
        <div className="w-full max-w-4xl mx-auto pb-12">
            
            {/* Header & Toggle */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="text-center md:text-left md:pl-4 mb-4 md:mb-0">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Indicator Progress: Tracking achievements</h2>
                </div>
                
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button 
                        onClick={() => setActiveTab("DFL")}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isDFL ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Activity className={`w-4 h-4 mr-2 ${isDFL ? 'text-blue-500' : 'text-slate-400'}`} />
                        DFL Journey
                    </button>
                    <button 
                        onClick={() => setActiveTab("DFS")}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${!isDFL ? 'bg-white text-purple-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Zap className={`w-4 h-4 mr-2 ${!isDFL ? 'text-purple-500' : 'text-slate-400'}`} />
                        DFS Journey
                    </button>
                </div>
            </div>

            {/* Journey Header */}
            <div className={`mb-12 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-colors duration-500 ${isDFL ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-900/20' : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-purple-900/20'}`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-black tracking-tight">{isDFL ? 'Digital Financial Literacy' : 'Digital Financial Services'}</h3>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        {isDFL ? <Activity className="w-8 h-8 text-white" /> : <Zap className="w-8 h-8 text-white" />}
                    </div>
                </div>
            </div>

            {/* Timeline Wrapper */}
            <div className="relative ml-4 md:ml-8 mt-8">
                {/* Vertical Line */}
                <div className={`absolute top-0 bottom-0 left-[19px] w-[3px] rounded-full transition-colors duration-500 ${isDFL ? 'bg-blue-100' : 'bg-purple-100'}`}></div>

                <div className="space-y-12 relative z-10">
                    {activeIndicators.map((ind, idx) => (
                        <div key={idx} className="relative flex items-start group">
                            
                            {/* Timeline Node */}
                            <div className="absolute left-0 w-10 h-10 rounded-full bg-white shadow-md border-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 z-20" style={{ borderColor: isDFL ? '#3b82f6' : '#a855f7' }}>
                                <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isDFL ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                            </div>

                            {/* Indicator Card */}
                            <div className="ml-16 w-full">
                                <div className={`bg-white rounded-3xl p-1.5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 ${isDFL ? 'hover:shadow-blue-900/10' : 'hover:shadow-purple-900/10'}`}>
                                    <div className={`bg-slate-50 rounded-[1.3rem] p-6 flex flex-col relative overflow-hidden transition-colors ${isDFL ? 'group-hover:bg-blue-50/40' : 'group-hover:bg-purple-50/40'}`}>
                                        
                                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-30 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500 ${isDFL ? 'bg-gradient-to-br from-blue-200 to-transparent' : 'bg-gradient-to-br from-purple-200 to-transparent'}`}></div>

                                        <div className="flex items-center mb-4">
                                            <span className={`px-4 py-1.5 bg-white shadow-sm border border-slate-100 rounded-full text-[11px] font-black tracking-widest uppercase ${isDFL ? 'text-blue-600' : 'text-purple-600'}`}>
                                                Milestone {ind.number}
                                            </span>
                                        </div>

                                        <h4 className="text-[15px] font-bold text-slate-800 mb-6 leading-relaxed">
                                            {ind.description}
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-full flex flex-col justify-center">
                                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                    <Target className="w-3 h-3 mr-1.5" /> Target
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600 leading-snug">
                                                    {ind.target_str}
                                                </div>
                                            </div>
                                            
                                            <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-colors h-full flex flex-col justify-center ${isDFL ? 'group-hover:border-blue-200' : 'group-hover:border-purple-200'}`}>
                                                <div className={`flex items-center text-[10px] font-black uppercase tracking-widest mb-2 ${isDFL ? 'text-blue-600' : 'text-purple-600'}`}>
                                                    <CheckCircle2 className="w-3 h-3 mr-1.5" /> Achieved
                                                </div>
                                                <div className="text-[15px] font-black text-slate-900 leading-snug">
                                                    {ind.actual_str}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* End of Journey Flag */}
                    <div className="relative flex items-center">
                        <div className={`absolute left-0 w-10 h-10 rounded-full shadow-sm flex items-center justify-center z-20 transition-colors duration-500 ${isDFL ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            <Flag className="w-4 h-4" />
                        </div>
                        <div className="ml-16">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ongoing Journey</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
