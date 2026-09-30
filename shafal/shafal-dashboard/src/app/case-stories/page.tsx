import React from 'react';
import Link from 'next/link';
import { caseStories } from '@/data/case-stories';
import { MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import DashboardWrapper from '@/components/DashboardWrapper';

export default async function CaseStoriesPage() {
  return (
    <DashboardWrapper>
      <div className="bg-slate-50 min-h-full">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Case Stories</h1>
            <p className="text-slate-500 mt-2 text-lg">Impact stories from the SHAFAL implementation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStories.map((story) => (
              <div key={story.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                <div className="h-56 relative w-full bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-slate-500 text-sm mb-3 font-medium">
                    <MapPin className="w-4 h-4 mr-1 text-red-500" />
                    {story.location}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{story.title}</h2>
                  <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{story.shortDesc}</p>
                  <Link 
                    href={`/case-stories/${story.id}`}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                  >
                    Read Full Story <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
