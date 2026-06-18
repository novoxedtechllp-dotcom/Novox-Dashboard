import React from 'react';
import { MapPin, Briefcase, DollarSign, ExternalLink, ChevronRight, Globe } from 'lucide-react';

const JobCard = ({ job, onClick }) => {
  const { title, company, location, salary, source, description, category } = job;

  return (
    <div 
      onClick={onClick}
      className="group bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#003F87]/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      {/* Decorative gradient blur in background on hover */}
      <div className="absolute -inset-x-0 -bottom-4 h-24 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#003F87] border border-blue-100/50 uppercase tracking-wider">
              {category || 'General'}
            </span>
            {source && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-1 rounded-full">
                <Globe size={12} />
                {source}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-[#003F87] transition-colors line-clamp-2">
            {title || 'Untitled Position'}
          </h3>
          <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
            <Briefcase size={14} className="text-slate-400" />
            {company || 'Unknown Company'}
          </p>
        </div>
        
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-[#003F87] transition-colors duration-300">
          <ChevronRight size={20} className="text-[#003F87] group-hover:text-white transition-colors duration-300 translate-x-0 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="flex-1 mt-2">
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
          {description || 'No description provided for this position. Click to view more details and learn about the role.'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-4">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <MapPin size={16} className="text-[#003F87]/60" />
          {location || 'Remote / Unspecified'}
        </div>
        
        {salary && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            <DollarSign size={16} />
            {salary}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
