import React from 'react';
import { MapPin, Briefcase, DollarSign, ChevronRight, Globe, Heart, Brain } from 'lucide-react';

const JobCard = ({ job, onClick, relevanceScore = 0, isSaved = false, isApplied = false, onSaveToggle = null }) => {
  const { title, company, location, salary, source, description, category } = job;

  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-[#C2C6D4] rounded-[8px] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#003F87]/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden animate-in fade-in duration-300"
    >
      {/* Decorative gradient blur in background on hover */}
      <div className="absolute -inset-x-0 -bottom-4 h-24 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#003F87] border border-blue-100/50 uppercase tracking-wider">
              {category || 'General'}
            </span>
            {source && (
              <span className="flex items-center gap-1 text-xs font-medium text-[#555F6B] bg-slate-100/80 px-2 py-1 rounded-full">
                <Globe size={12} />
                {source}
              </span>
            )}
            {relevanceScore > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                <Brain size={12} className="fill-pink-500/20" />
                {relevanceScore}% Match
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#003F87] leading-tight group-hover:text-[#003F87] transition-colors line-clamp-2">
            {title || 'Untitled Position'}
          </h3>
          <p className="text-sm font-medium text-[#555F6B] mt-1 flex items-center gap-1.5">
            <Briefcase size={14} className="text-slate-400" />
            {company || 'Unknown Company'}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-2 relative z-10">
        <p className="text-sm text-[#555F6B] line-clamp-3 leading-relaxed">
          {description || 'No description provided for this position. Click to view more details and learn about the role.'}
        </p>
      </div>

      <div className="mt-5 pt-4 flex flex-wrap justify-between items-center gap-y-2 relative z-10">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="px-6 py-2 bg-[#2563EB] text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors"
          >
            Details
          </button>
          
          {isApplied && (
            <div className="px-6 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm font-bold rounded flex items-center justify-center">
              Applied
            </div>
          )}
        </div>

        {onSaveToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle(job);
            }}
            className={`p-2 rounded border transition-all ${
              isSaved 
                ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' 
                : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'
            }`}
            title={isSaved ? "Saved" : "Save Job"}
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
