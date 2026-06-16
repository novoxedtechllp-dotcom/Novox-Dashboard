import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Code, Factory, Send } from 'lucide-react';

const BlogAgentHub = () => {
  const navigate = useNavigate();

  // Common wrapper for the page to match Dashboard theme
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mt-8 mb-4">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Blog Automation Hub</h1>
        <p className="text-sm font-medium text-slate-500">
          Select which Novox website workstation you want to manage today
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        
        {/* Edtech Card */}
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <GraduationCap size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Novox Edtech</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
            IT & Software Training Institute Niche. Managing grid layout cards, templates, sitemaps, and FAQs under <span className="font-bold text-slate-700">novoxedtechllp.com</span>.
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
            <Send size={12} /> Sync Active
          </div>
          <button 
            onClick={() => navigate('edtech')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            Manage Edtech blogs
          </button>
        </div>

        {/* Core Card */}
        <div className="bg-white border-2 border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Code size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Novox Core</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
            Design, Software Development & Digital Agency Niche. Managing dark theme grid, template tags, and direct services references under <span className="font-bold text-slate-700">novoxcore.com</span>.
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
            <Send size={12} /> Sync Active
          </div>
          <button 
            onClick={() => navigate('core')}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            Manage Core blogs
          </button>
        </div>

        {/* Kalyan Card */}
        <div className="bg-white border-2 border-orange-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300 flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Factory size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Novox Kalyan</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
            Jewellery & Engineering Machinery Manufacturing Niche. Managing classic grid articles, orange themes, and custom specifications under <span className="font-bold text-slate-700">kalyanjewellerymachines.com</span>.
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
            <Send size={12} /> Sync Active
          </div>
          <button 
            onClick={() => navigate('kalyan')}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            Manage Kalyan blogs
          </button>
        </div>

      </div>
    </div>
  );
};

export default BlogAgentHub;
