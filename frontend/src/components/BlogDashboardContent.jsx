import React, { useState, useEffect } from 'react';
import { FileText, Eye, MousePointerClick, Share2, Plus, ArrowUpRight, TrendingUp } from 'lucide-react';

const BlogDashboardContent = () => {
  const [blogs, setBlogs] = useState([]);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const response = await fetch('/api/v1/blogs', {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        const resData = await response.json();
        if (response.ok) {
          const bArray = resData.data?.blogs || resData.data || [];
          setBlogs(bArray);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87]">Blog Automation Dashboard</h2>
          <p className="text-[13px] text-[#555F6B]">Track performance and analytics of published articles.</p>
        </div>
        <button className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
          <Plus size={16} /> New Draft
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <div className="bg-white border border-[#C2C6D4] p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="w-10 h-10 bg-blue-50 text-[#003F87] rounded-lg flex items-center justify-center mb-4"><Eye size={20} /></div>
          <h3 className="text-3xl font-black text-slate-800">21.4k</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Views</p>
        </div>
        <div className="bg-white border border-[#C2C6D4] p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="w-10 h-10 bg-green-50 text-green-700 rounded-lg flex items-center justify-center mb-4"><MousePointerClick size={20} /></div>
          <h3 className="text-3xl font-black text-slate-800">5.5k</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Clicks</p>
        </div>
        <div className="bg-white border border-[#C2C6D4] p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center mb-4"><Share2 size={20} /></div>
          <h3 className="text-3xl font-black text-slate-800">205</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Shares</p>
        </div>
        <div className="bg-[#003F87] border border-[#003F87] p-6 rounded-xl shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="w-10 h-10 bg-white/20 text-white rounded-lg flex items-center justify-center mb-4 relative z-10"><TrendingUp size={20} /></div>
          <h3 className="text-3xl font-black text-white relative z-10">78.7</h3>
          <p className="text-xs font-bold text-blue-200 uppercase tracking-wide mt-1 relative z-10">Avg Engagement</p>
        </div>
      </div>

      <div className="bg-white border border-[#C2C6D4] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#C2C6D4] bg-slate-50">
          <h3 className="font-bold text-slate-800">Published Articles</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#C2C6D4] bg-white">
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Title & Source</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Published</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Views</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Clicks</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b, i) => (
              <tr key={b.id} className={i !== blogs.length - 1 ? 'border-b border-slate-100 hover:bg-slate-50' : 'hover:bg-slate-50'}>
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900 text-sm mb-1">{b.title}</div>
                  <div className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">{b.source_platform}</div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                  {new Date(b.publish_date).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right font-bold text-slate-700">{b.views.toLocaleString()}</td>
                <td className="py-4 px-6 text-right font-bold text-slate-700">{b.clicks.toLocaleString()}</td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-green-50 text-green-700 font-bold text-sm">
                    {b.engagement_score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogDashboardContent;
