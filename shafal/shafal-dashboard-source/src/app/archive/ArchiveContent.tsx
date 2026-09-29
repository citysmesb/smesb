"use client";

import React, { useState } from 'react';
import { Search, FileText, Image as ImageIcon, Video, Download } from 'lucide-react';

// Hardcoded for now. In a real app, this would be fetched from an API or read from the file system.
const archiveItems = [
  // Documents
  { id: 'd1', type: 'document', name: 'DFL Training Content', path: '/documents/DFL Training Content.pdf', date: '2023-10-12' },
  { id: 'd2', type: 'document', name: 'DFS Training Content', path: '/documents/DFS Training Content.pdf', date: '2023-11-05' },
  { id: 'd3', type: 'document', name: 'Meet & Greet Presentations', path: '/documents/Meet & Greet Presentations.pdf', date: '2024-01-20' },
  { id: 'd4', type: 'document', name: 'LMS User Journey', path: '/documents/LMS User Journey.pdf', date: '2024-02-15' },
  { id: 'd5', type: 'document', name: 'SME Learning App User Journeys', path: '/documents/SME Learning App User Journey\'s.pdf', date: '2024-03-01' },
  
  // DFL Photos
  { id: 'p1', type: 'image', name: 'DFL Session - Village Square', path: '/images/archive/dfl/Image 100.jpg', date: '2023-10-15' },
  { id: 'p2', type: 'image', name: 'DFL Training - Women Group', path: '/images/archive/dfl/Image 101.jpg', date: '2023-10-16' },
  { id: 'p3', type: 'image', name: 'Mobile App Demo', path: '/images/archive/dfl/Image 102.jpg', date: '2023-10-17' },
  { id: 'p4', type: 'image', name: 'Community Meet', path: '/images/archive/dfl/Image 103.jpg', date: '2023-10-18' },
  { id: 'p5', type: 'image', name: 'Financial Literacy Material', path: '/images/archive/dfl/Image 104.jpg', date: '2023-10-19' },
  { id: 'p6', type: 'image', name: 'Discussion Group', path: '/images/archive/dfl/Image 105.jpg', date: '2023-10-20' },
  
  // DFS Photos
  { id: 'p7', type: 'image', name: 'DFS Field Activation', path: '/images/archive/dfs/Image 100.jpg', date: '2023-11-10' },
  { id: 'p8', type: 'image', name: 'Agent Banking Training', path: '/images/archive/dfs/Image 101.jpg', date: '2023-11-11' },
  { id: 'p9', type: 'image', name: 'Account Opening Drive', path: '/images/archive/dfs/Image 102.jpg', date: '2023-11-12' },
  { id: 'p10', type: 'image', name: 'Transaction Demo', path: '/images/archive/dfs/Image 103.jpg', date: '2023-11-13' },
];

export default function ArchiveContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "document" | "image" | "video">("All");

  const filteredItems = archiveItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: "All", label: "All Items", icon: null },
    { id: "document", label: "Documents", icon: FileText },
    { id: "image", label: "Images", icon: ImageIcon },
    { id: "video", label: "Videos", icon: Video },
  ] as const;

  return (
    <div className="bg-slate-50 min-h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Archive</h1>
            <p className="text-slate-500 mt-1">Search and download project resources, training materials, and media.</p>
          </div>
          
          <div className="relative w-full md:w-96 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="Search by file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.icon && <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-400'}`} />}
              {tab.label}
              <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === tab.id ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                {tab.id === 'All' ? archiveItems.length : archiveItems.filter(i => i.type === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Masonry/Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
              
              {/* Preview Area */}
              <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                {item.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.path} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : item.type === 'document' ? (
                  <div className="w-full h-full bg-blue-50/50 flex flex-col items-center justify-center text-blue-600">
                    <FileText className="w-12 h-12 mb-2 opacity-80" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">PDF Document</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-purple-50/50 flex flex-col items-center justify-center text-purple-600">
                    <Video className="w-12 h-12 mb-2 opacity-80" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Video</span>
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={item.path} download target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              {/* Info Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    item.type === 'document' ? 'bg-blue-100 text-blue-700' : 
                    item.type === 'image' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 leading-snug line-clamp-2" title={item.name}>{item.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No resources found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search query or filters.</p>
          </div>
        )}

      </div>
    </div>
  );
}
