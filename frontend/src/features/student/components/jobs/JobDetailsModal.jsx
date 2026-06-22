import React, { useState } from 'react';
import { 
  X, Briefcase, MapPin, DollarSign, Globe, Calendar, Mail, Phone, 
  ExternalLink, Building2, CheckCircle2, ChevronRight, Loader2, Send
} from 'lucide-react';

const JobDetailsModal = ({ job, details, isLoading, isApplied = false, onClose, onApplyClick, onMarkApplied }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[8px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[8px] bg-blue-50 flex items-center justify-center text-[#003F87]">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#003F87] leading-tight">Job Overview</h2>
              <p className="text-sm font-medium text-[#555F6B]">{job.company}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#555F6B] hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* Top Banner Info */}
          <div className="bg-gradient-to-br from-[#003F87]/5 to-blue-50/50 border border-blue-100/50 rounded-[8px] p-6 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#003F87] shadow-sm uppercase tracking-wider">
                    {job.category || 'General'}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-[#555F6B] bg-white/60 px-3 py-1 rounded-full border border-[#C2C6D4]">
                    <Globe size={12} />
                    {job.source || 'Direct'}
                  </span>
                </div>
                
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 text-lg font-medium text-slate-900 mb-4">
                  <Building2 size={20} className="text-slate-400" />
                  {job.company}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#555F6B]">
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-[#C2C6D4]">
                    <MapPin size={16} className="text-[#003F87]" />
                    {job.location}
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1.5 bg-emerald-50/80 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <DollarSign size={16} />
                      {job.salary}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch gap-3 shrink-0 w-full md:w-auto">
                {isApplied ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-8 py-3.5 rounded-[8px] font-bold border border-emerald-100 text-center w-full md:w-auto">
                    Applied
                  </div>
                ) : (
                  <button 
                    onClick={onMarkApplied}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 px-8 py-3.5 rounded-[8px] font-bold border border-[#C2C6D4] hover:border-emerald-200 shadow-sm transition-all text-center w-full md:w-auto whitespace-nowrap text-sm"
                  >
                    <CheckCircle2 size={18} />
                    Mark as Applied
                  </button>
                )}
                <button 
                  onClick={onApplyClick}
                  className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-3.5 rounded-[8px] font-bold shadow-sm transition-all w-full md:w-auto text-sm whitespace-nowrap"
                >
                  <ExternalLink size={18} />
                  Apply on Website
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
              <Loader2 size={40} className="animate-spin text-[#003F87]" />
              <p className="font-medium">Extracting deep job details...</p>
            </div>
          ) : details ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Main Content: Structured Description */}
              <div className="md:col-span-2 space-y-8">
                {details.structured_description?.about && details.structured_description.about.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-[#003F87] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-blue-400 rounded-full" />
                      About the Role
                    </h3>
                    <div className="text-[#555F6B] leading-relaxed space-y-2">
                      {details.structured_description.about.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </section>
                )}

                {details.structured_description?.responsibilities && details.structured_description.responsibilities.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-[#003F87] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-emerald-400 rounded-full" />
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-3">
                      {details.structured_description.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-3 text-[#555F6B] leading-relaxed">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {details.structured_description?.requirements && details.structured_description.requirements.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-[#003F87] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
                      Requirements & Skills
                    </h3>
                    <ul className="space-y-3">
                      {details.structured_description.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-[#555F6B] leading-relaxed">
                          <ChevronRight size={18} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {details.structured_description?.benefits && details.structured_description.benefits.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-[#003F87] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-purple-400 rounded-full" />
                      Perks & Benefits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {details.structured_description.benefits.map((benefit, i) => (
                        <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-100">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                
                {/* Fallback to full description if structured is missing */}
                {(!details.structured_description || Object.keys(details.structured_description).length === 0) && details.full_description && (
                  <section>
                    <h3 className="text-lg font-bold text-[#003F87] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
                      Description
                    </h3>
                    <div className="text-[#555F6B] leading-relaxed whitespace-pre-wrap">
                      {details.full_description}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar: HR Details */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-5 sticky top-0">
                  <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider mb-4 border-b border-[#C2C6D4] pb-2">
                    Contact Information
                  </h3>
                  
                  {details.hr_details && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-[#555F6B] uppercase mb-1">Recruiter</p>
                      <p className="text-sm font-semibold text-[#003F87]">{details.hr_details}</p>
                    </div>
                  )}

                  {details.emails && details.emails.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-[#555F6B] uppercase mb-2">Email Address</p>
                      <ul className="space-y-2">
                        {details.emails.map((email, i) => (
                          <li key={i}>
                            <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm font-medium text-[#003F87] hover:underline bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                              <Mail size={14} className="shrink-0" />
                              <span className="truncate">{email}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {details.phones && details.phones.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#555F6B] uppercase mb-2">Phone Number</p>
                      <ul className="space-y-2">
                        {details.phones.map((phone, i) => (
                          <li key={i}>
                            <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm font-medium text-slate-900 bg-white p-2 rounded-lg border border-[#C2C6D4] shadow-sm">
                              <Phone size={14} className="shrink-0 text-slate-400" />
                              <span className="truncate">{phone}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(!details.emails?.length && !details.phones?.length && !details.hr_details) && (
                    <p className="text-sm text-[#555F6B] italic">No specific contact details extracted.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-[#555F6B]">Failed to load detailed description.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
