import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Code, Factory, ArrowLeft, CheckCircle, 
  HelpCircle, CloudUpload, Wand2, Code2, Eye, Sparkles,
  Download, Image as ImageIcon
} from 'lucide-react';

const getSiteConfig = (site) => {
  switch(site) {
    case 'edtech': return { name: 'Novox Edtech', icon: GraduationCap, color: 'blue' };
    case 'core': return { name: 'Novox Core', icon: Code, color: 'green' };
    case 'kalyan': return { name: 'Novox Kalyan', icon: Factory, color: 'orange' };
    default: return { name: 'Unknown Site', icon: GraduationCap, color: 'slate' };
  }
};

const BlogAgentEditor = () => {
  const { site } = useParams();
  const navigate = useNavigate();
  const config = getSiteConfig(site);
  
  const [activeTab, setActiveTab] = useState('editor');
  
  // Color classes based on site
  const getColors = () => {
    switch(config.color) {
      case 'blue': return { text: 'text-blue-700', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', lightBg: 'bg-blue-50', border: 'border-blue-200' };
      case 'green': return { text: 'text-green-700', bg: 'bg-green-600', hover: 'hover:bg-green-700', lightBg: 'bg-green-50', border: 'border-green-200' };
      case 'orange': return { text: 'text-orange-700', bg: 'bg-orange-500', hover: 'hover:bg-orange-600', lightBg: 'bg-orange-50', border: 'border-orange-200' };
      default: return { text: 'text-slate-700', bg: 'bg-slate-600', hover: 'hover:bg-slate-700', lightBg: 'bg-slate-50', border: 'border-slate-200' };
    }
  };
  
  const colors = getColors();
  const SiteIcon = config.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Top Header */}
      <div className="flex-shrink-0 h-[60px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg ${colors.lightBg} ${colors.text} flex items-center justify-center`}>
            <SiteIcon size={18} />
          </div>
          <h1 className="text-lg font-bold text-slate-800">{config.name}</h1>
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            Blog Verification Hub
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/blog-agent')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <ArrowLeft size={16} /> Switch Website
          </button>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <CheckCircle size={16} /> Editor Mode
          </div>
        </div>
      </div>

      {/* Main Content Area - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Blog Parameters */}
        <div className="w-[320px] flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="p-5 flex flex-col gap-5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Sparkles size={16} className={colors.text} /> Blog Parameters
            </h2>

            {/* Edit Existing */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Edit Existing Blog</label>
              <div className="flex gap-2">
                <select className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option>-- Create New Post --</option>
                </select>
                <button className="bg-slate-100 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-1">
                  <Download size={16} /> Load
                </button>
              </div>
            </div>

            {/* Inputs */}
            {[
              { label: 'Article Topic', placeholder: 'e.g. Future of AI in Web Development' },
              { label: 'Target Keywords (Comma Separated)', placeholder: 'e.g. AI in web design, web development' },
              { label: 'Primary SEO Target Keyword', placeholder: 'e.g. AI in web design' },
              { label: 'Target Landing Page URL', placeholder: 'mern-stack-course-detail.html' }
            ].map((field, i) => (
              <div key={i} className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                <input 
                  type="text" 
                  placeholder={field.placeholder} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white placeholder-slate-400" 
                />
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                <option>Web Development</option>
                <option>Data Science</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Author</label>
                <input type="text" defaultValue="Novox Expert" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Publish Date</label>
                <input type="date" defaultValue="2026-06-15" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Featured Image Path</label>
              <input type="text" placeholder="e.g. assets/img/blog/blogimages/..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
            </div>

            <label className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span className="text-xs font-bold text-slate-700 leading-tight">
                <ImageIcon size={14} className="inline mr-1 text-pink-600" />
                GENERATE AI FEATURED IMAGE USING IMAGEN 4
              </span>
            </label>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">URL Slug (Kebab-Case)</label>
              <input type="text" placeholder="e.g. future-of-ai-web-development" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
              <p className="text-[10px] text-slate-500">Auto-generated from title, but editable.</p>
            </div>

            <button className={`w-full py-3 ${colors.bg} ${colors.hover} text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mt-2`}>
              <Wand2 size={18} /> Draft Article with AI
            </button>
            <div className="h-4"></div> {/* Bottom Padding */}
          </div>
        </div>

        {/* Middle Column: Editor & Preview */}
        <div className="flex-1 flex flex-col bg-slate-50/50 min-w-0">
          
          {/* Tab Bar */}
          <div className="h-[60px] border-b border-slate-200 flex items-center justify-between px-6 bg-white">
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'editor' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Code2 size={16} /> Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Eye size={16} /> Live Site Preview
              </button>
            </div>
            
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
              <CloudUpload size={16} /> Verify & Publish to GitHub
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
            {activeTab === 'editor' ? (
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Generated Title (SEO Title)</label>
                  <input 
                    type="text" 
                    placeholder="Click generate to load a title..." 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 placeholder-slate-400 font-medium text-slate-800" 
                  />
                  
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 block">Meta Description</label>
                  <textarea 
                    placeholder="Click generate to load a description..." 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 placeholder-slate-400 resize-y min-h-[80px] font-medium text-slate-800" 
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 min-h-[400px] flex flex-col">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Article HTML Body</label>
                  <textarea 
                    placeholder="Write or generate content HTML here..." 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-900 text-slate-300 font-mono resize-none flex-1 placeholder-slate-600" 
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto border border-slate-300 rounded-xl shadow-lg bg-white overflow-hidden flex flex-col min-h-[600px]">
                {/* Mock Browser Header */}
                <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-slate-200 text-slate-500 text-xs px-6 py-1 rounded-full w-2/3 text-center flex items-center justify-center gap-2">
                      <span>🔒 https://{site === 'edtech' ? 'novoxedtechllp.com' : site === 'core' ? 'novoxcore.com' : 'kalyanjewellerymachines.com'}/untitled-post.html</span>
                    </div>
                  </div>
                </div>
                {/* Mock Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    <h1 className={`text-4xl font-black ${colors.text} mb-4 uppercase tracking-tight`}>{config.name}</h1>
                    <div className="text-sm text-slate-500 mb-8 border-b border-slate-200 pb-4">Home / Blog / Web Development</div>
                    <h2 className="text-5xl font-black text-slate-900 mb-6">Draft Title</h2>
                    <div className="flex gap-4 text-sm font-bold text-slate-600 mb-8">
                      <span className="flex items-center gap-2">📅 June 15, 2026</span>
                      <span className="flex items-center gap-2">👤 By Novox Expert</span>
                      <span className="flex items-center gap-2">📁 Web Development</span>
                    </div>
                    <div className="w-full aspect-[16/9] bg-slate-200 rounded-2xl flex items-center justify-center mb-8 border border-slate-300 text-slate-400">
                      <span className="text-4xl font-bold">Featured Image</span>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed">Generated content will appear here...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SEO Verification */}
        <div className="w-[320px] flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="p-5 flex flex-col gap-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" /> SEO Verification
            </h2>

            {/* Score Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
              <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="351.85" strokeDashoffset="351.85" className="text-red-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-slate-800">0<span className="text-sm text-slate-500 font-bold">/100</span></span>
                </div>
                {/* Small red dot on top simulating the UI */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Optimization Score</span>
            </div>

            {/* Gemini Usage */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-3">
                <Sparkles size={14} className="text-indigo-600" /> Gemini Usage
              </h3>
              <div className="flex justify-between mb-3">
                <div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">Input Tokens</div>
                  <div className="text-lg font-black text-indigo-900">0</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">Output Tokens</div>
                  <div className="text-lg font-black text-indigo-900">0</div>
                </div>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-indigo-200/50">
                <div className="text-[10px] font-bold text-indigo-600 uppercase">Total Tokens</div>
                <div className="text-sm font-black text-indigo-600">0</div>
              </div>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Checklist Requirements</h3>
              
              {[
                { label: 'Title (50-60 chars)', value: '0 chars' },
                { label: 'Meta Desc (120-160 chars)', value: '0 chars' },
                { label: 'Length (Min 300 words)', value: '0 words' },
                { label: 'Keywords count (Min 3 times)', value: '0 matches' },
                { label: 'Keyword in Intro (First 3 sentences)', value: '' },
                { label: 'Subheadings H2 (Min 2)', value: '0 H2' },
                { label: 'FAQ Section present', value: '' },
                { label: 'Conclusion Section present', value: '' },
                { label: 'Link to Landing Page', value: '' },
                { label: 'Styled CTA button (.tp-btn-inner)', value: '' },
                { label: 'Slug format (kebab-case)', value: '' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                  </div>
                  {item.value && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAgentEditor;
