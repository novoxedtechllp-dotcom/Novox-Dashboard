import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import JobApplicationModal from './JobApplicationModal';
import ResumeParser from './ResumeParser';

const StudentJobs = ({ userInfo }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://novox-job-scraper-api.onrender.com';
      const response = await fetch(`${baseUrl}/jobs`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Could not load jobs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setJobDetails(null);
    setIsDetailsLoading(true);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://novox-job-scraper-api.onrender.com';
      // URL encode parameters properly
      const urlParam = encodeURIComponent(job.link);
      const sourceParam = encodeURIComponent(job.source || 'Direct');
      
      const response = await fetch(`${baseUrl}/job-details?url=${urlParam}&source=${sourceParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setJobDetails(data);
      } else {
        console.warn('Failed to fetch job details, using basic info.');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleApplyClick = () => {
    setShowApplyModal(true);
  };

  // Extract unique categories for filter
  const categories = ['All', ...new Set(jobs.map(j => j.category).filter(Boolean))];

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.company?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-100/40 via-purple-50/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003F87] to-blue-500">Career Move</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Explore curated opportunities tailored for our students and alumni.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-full">
          
          {/* Left Column: Job Board */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search jobs by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#003F87] transition-all shadow-sm font-medium text-slate-700"
                />
              </div>
              <div className="relative min-w-[200px]">
                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#003F87] transition-all shadow-sm font-bold text-slate-700 cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-400"></div>
                </div>
              </div>
            </div>

            {/* Jobs Grid/List */}
            <div className="flex-1 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 pr-2">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw size={32} className="animate-spin text-[#003F87]/60" />
                  <p className="text-slate-500 font-medium">Scraping the latest opportunities...</p>
                </div>
              ) : error ? (
                <div className="h-64 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle size={48} className="text-red-400 mb-4" />
                  <h3 className="text-xl font-bold text-red-800 mb-2">Connection Error</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button onClick={fetchJobs} className="bg-red-100 hover:bg-red-200 text-red-800 px-6 py-2.5 rounded-xl font-bold transition-colors">
                    Try Again
                  </button>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
                  {filteredJobs.map((job, idx) => (
                    <JobCard 
                      key={idx} 
                      job={job} 
                      onClick={() => handleJobClick(job)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-white rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-1">No matches found</h3>
                  <p className="text-slate-500">Try adjusting your search or filters to find more jobs.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Resume Parser & Insights */}
          <div className="lg:w-[400px] shrink-0 flex flex-col gap-6">
            <div className="h-[500px] sticky top-6">
              <ResumeParser />
            </div>
            
            {/* Can add more widgets here later, like "Application Status" */}
          </div>

        </div>
      </div>

      {/* Modals */}
      {selectedJob && !showApplyModal && (
        <JobDetailsModal 
          job={selectedJob} 
          details={jobDetails}
          isLoading={isDetailsLoading}
          onClose={() => setSelectedJob(null)}
          onApplyClick={handleApplyClick}
        />
      )}

      {showApplyModal && selectedJob && (
        <JobApplicationModal 
          job={selectedJob}
          userInfo={userInfo}
          onClose={() => setShowApplyModal(false)}
          onApplySuccess={(data) => {
            console.log('Application success:', data);
            // Could show a toast notification here
          }}
        />
      )}
    </div>
  );
};

export default StudentJobs;
