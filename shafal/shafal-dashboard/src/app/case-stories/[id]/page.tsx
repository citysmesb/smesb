import React from 'react';
import Link from 'next/link';
import { caseStories } from '@/data/case-stories';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Target, Lightbulb } from 'lucide-react';
import DashboardWrapper from '@/components/DashboardWrapper';

export default async function CaseStoryDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const story = caseStories.find(s => s.id === resolvedParams.id);

  if (!story) {
    notFound();
  }

  return (
    <DashboardWrapper>
      <div className="bg-slate-50 min-h-full pb-12">
        <div className="max-w-4xl mx-auto py-8">
          <Link 
            href="/case-stories" 
            className="inline-flex items-center text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Stories
          </Link>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-80 relative w-full bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={story.image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center text-slate-500 text-sm mb-4 font-semibold bg-slate-100 w-fit px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 mr-1.5 text-red-500" />
                {story.location}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">
                {story.title}
              </h1>
              
              <div className="prose prose-slate max-w-none mb-10">
                <p className="text-lg text-slate-700 leading-relaxed">
                  {story.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Key Impacts</h3>
                  </div>
                  <ul className="space-y-3">
                    {story.impacts.map((impact, idx) => (
                      <li key={idx} className="flex items-start text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2.5 shrink-0"></span>
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Key Learning</h3>
                  </div>
                  <p className="text-slate-700 italic">
                    "{story.learning}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
