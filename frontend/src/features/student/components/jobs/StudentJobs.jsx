import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Upload, Star, Brain, Atom, Terminal, Gamepad, 
  Palette, Heart, X, Briefcase, AlertCircle, RefreshCw, Globe, 
  Settings as SettingsIcon, CheckCircle2, ChevronRight 
} from 'lucide-react';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import JobApplicationModal from './JobApplicationModal';
import ResumeParser from './ResumeParser';
import RunnerGame from './RunnerGame';
import './ScraperLoadingStyles.css';

const LOADING_TRIVIA = [
  { icon: "💡", category: "Resume Tip", text: "Tailoring your resume to match the job description keywords can increase your recruiter callback rate by over 50%!" },
  { icon: "💻", category: "Tech Trivia", text: "The first computer bug was a real moth found trapped in a relay of the Harvard Mark II computer in 1947 by Grace Hopper." },
  { icon: "💡", category: "Interview Tip", text: "When answering behavioral questions, use the STAR method: Situation, Task, Action, and Result to structure your answers." },
  { icon: "💻", category: "Tech Trivia", text: "Python was named after the British comedy group 'Monty Python', not the snake!" },
  { icon: "💡", category: "Networking Tip", text: "About 70% to 80% of jobs are not published publicly. Professional networking is key to accessing this hidden job market." },
  { icon: "💻", category: "Tech Trivia", text: "Git was created by Linus Torvalds in 2005 to manage the development of the Linux kernel after BitKeeper withdrew free access." }
];

const StudentJobs = ({ userInfo }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [skillsQuery, setSkillsQuery] = useState('');
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState('Job Board');

  // Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Scraper Simulation States
  const [isSimulatingScrape, setIsSimulatingScrape] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [statusLogs, setStatusLogs] = useState([]);

  // Saved & Applied Jobs Local States (Persisted in localStorage per user)
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Dynamic Date Formatting
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
      setError('Could not load jobs from scraper API. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Load Saved and Applied Jobs from localStorage
    const email = userInfo?.email || 'default';
    const localSaved = localStorage.getItem(`savedJobs_${email}`);
    const localApplied = localStorage.getItem(`appliedJobs_${email}`);
    
    if (localSaved) setSavedJobs(JSON.parse(localSaved));
    if (localApplied) setAppliedJobs(JSON.parse(localApplied));
  }, [userInfo]);

  const simulateScraping = async () => {
    setIsSimulatingScrape(true);
    setScrapeProgress(0);
    setStatusLogs(['Initializing headless browsers...', 'Connecting to job boards...']);
    setIsSearchSubmitted(true);
    setError(null);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 5) + 1;
      if (currentProgress > 85) currentProgress = 85;
      setScrapeProgress(currentProgress);
      
      const newLogs = [
        'Bypassing captchas...', 
        'Scraping LinkedIn...', 
        'Parsing Indeed results...', 
        'Filtering Internshala...', 
        'Analyzing required skills...', 
        'Matching with your profile...',
        'Finalizing results...'
      ];
      if (currentProgress > 15) {
        setStatusLogs(prev => {
          const newLog = newLogs[Math.floor(currentProgress / 10) % newLogs.length];
          return prev.includes(newLog) ? prev : [...prev, newLog].slice(-4);
        });
      }
    }, 500);

    const triviaInterval = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % LOADING_TRIVIA.length);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('query', searchQuery || '');
      formData.append('location', locationQuery || '');
      formData.append('sources', 'Internshala,LinkedIn'); // Added LinkedIn for better coverage

      const response = await fetch('https://novox-job-scraper.onrender.com/jobs', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (Array.isArray(data) && !data[0]?.error) {
        setJobs(data);
      } else if (data[0]?.error) {
        if (data[0].error === 'NO_RELEVANT_JOBS_FOUND' || data[0].error === 'NO_JOBS_FOUND') {
          setJobs([]);
        } else {
          throw new Error(data[0].error);
        }
      }
    } catch (err) {
      console.error('Failed to scrape jobs:', err);
      setError('🚦 Server is busy right now. Please try again later.');
    } finally {
      clearInterval(interval);
      clearInterval(triviaInterval);
      setScrapeProgress(100);
      setStatusLogs(prev => [...prev, 'Done!']);
      setTimeout(() => setIsSimulatingScrape(false), 800);
    }
  };

  const handleSearch = () => {
    simulateScraping();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setLocationQuery('');
    setIsSearchSubmitted(false);
  };

  const handlePopularRoleClick = (role) => {
    setSearchQuery(role);
    simulateScraping();
  };

  // Toggle Save Job
  const handleSaveToggle = (job) => {
    const email = userInfo?.email || 'default';
    const isAlreadySaved = savedJobs.some(sj => sj.link === job.link);
    let updated;
    if (isAlreadySaved) {
      updated = savedJobs.filter(sj => sj.link !== job.link);
    } else {
      updated = [...savedJobs, job];
    }
    setSavedJobs(updated);
    localStorage.setItem(`savedJobs_${email}`, JSON.stringify(updated));
  };

  // Relevance Matching Logic
  const getRelevanceScore = (job) => {
    if (!skillsQuery) return 0;
    const skills = skillsQuery.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (skills.length === 0) return 0;
    
    let matches = 0;
    const jobText = `${job.title} ${job.company} ${job.category} ${job.description || ''}`.toLowerCase();
    
    skills.forEach(skill => {
      if (jobText.includes(skill)) {
        matches++;
      }
    });
    
    return Math.round((matches / skills.length) * 100);
  };

  // Handle detailed job click
  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setJobDetails(null);
    setIsDetailsLoading(true);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://novox-job-scraper-api.onrender.com';
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

  // Skills Auto-Fill from Resume Parser
  const handleResumeParseSuccess = (parsedData) => {
    if (parsedData?.skills && parsedData.skills.length > 0) {
      setSkillsQuery(parsedData.skills.join(', '));
      // Auto trigger search to match the new skills
      setIsSearchSubmitted(true);
    }
    setShowResumeModal(false);
  };

  // Filter & Search results logic
  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const loc = locationQuery.toLowerCase();
    
    const matchesSearch = !q || (() => {
      const titleWords = job.title?.toLowerCase().split(/\s+/) || [];
      const companyWords = job.company?.toLowerCase().split(/\s+/) || [];
      return titleWords.some(word => word.startsWith(q)) || companyWords.some(word => word.startsWith(q));
    })();
       
    const matchesLocation = !loc || 
      job.location?.toLowerCase().includes(loc);
      
    return matchesSearch && matchesLocation;
  });

  // Sort jobs by match score if skills exist
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!skillsQuery) return 0;
    return getRelevanceScore(b) - getRelevanceScore(a);
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFC] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full pb-10">
        {/* 1. Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">Job Portal</h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-1"></span>
            </div>
            <p className="text-slate-500 mt-1">
              Discover real-time opportunities and track your job applications.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-400 sm:text-right">
            {formattedDate}
          </div>
        </div>

        {/* 2. Navigation Tabs (Pill Buttons) */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit border border-slate-200 mb-6">
          {[
            { name: 'Job Board', label: 'Job Board' },
            { name: 'Saved Jobs', label: `Saved Jobs (${savedJobs.length})` },
            { name: 'Applied Jobs', label: `Applied Jobs (${appliedJobs.length})` }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
              }}
              className={`px-6 py-1.5 text-[13px] font-bold rounded-[4px] transition-colors ${
                activeTab === tab.name 
                  ? 'bg-white text-[#003F87] shadow-sm border border-[#C2C6D4]' 
                  : 'text-[#555F6B] hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. Main Body */}
        <div className="w-full">

          {activeTab === 'Job Board' && (
            <>
              {/* Find Your Next Job Hero */}
              {!isSearchSubmitted && (
                <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100/50">
                    <Star size={22} className="stroke-[1.5]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Find Your Next Job</h2>
                  <p className="text-slate-500 mt-1.5 text-sm font-medium">
                    Search across 9 major platforms instantly in real-time.
                  </p>
                </div>
              )}

              {/* Search Floating Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center gap-3 w-full">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl flex-1 w-full hover:border-blue-300 transition-colors">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="1. What job do you want? (e.g. React, Node, Python)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-transparent text-sm font-semibold text-slate-800 outline-none w-full placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl flex-1 w-full hover:border-blue-300 transition-colors">
                  <MapPin size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="2. Where? (e.g. Remote)"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-transparent text-sm font-semibold text-slate-800 outline-none w-full placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setShowResumeModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-xl font-bold text-xs transition-all w-full md:w-auto shrink-0"
                  >
                    <Upload size={14} />
                    Upload Resume
                  </button>

                  <button 
                    onClick={handleSearch}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all w-full md:w-auto shrink-0"
                  >
                    <Search size={14} />
                    Search
                  </button>
                </div>
              </div>

              {/* Developer Skills Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 w-full mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={18} className="text-pink-500 fill-pink-500/20" />
                  <h4 className="text-sm font-bold text-slate-800">Developer Skills</h4>
                </div>
                <p className="text-slate-500 text-xs mb-3 font-medium leading-relaxed">
                  List your skills separated by commas (e.g. Python, SQL, React) to automatically highlight matches and score relevance in search results.
                </p>
                <textarea
                  rows={2}
                  placeholder="e.g. Python, SQL, Django, React, AWS..."
                  value={skillsQuery}
                  onChange={(e) => setSkillsQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Search Results Display OR Home widgets */}
              {isSearchSubmitted ? (
                <div className="mt-8 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Search Results</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Found {sortedJobs.length} match(es)</p>
                    </div>
                    <button 
                      onClick={handleClearSearch}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-100 hover:border-blue-200 px-3 py-1.5 rounded-lg bg-white transition-all"
                    >
                      Clear / Back
                    </button>
                  </div>

                  {isLoading || isSimulatingScrape ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4">
                      <RefreshCw size={28} className="animate-spin text-[#003F87]/60" />
                      <p className="text-slate-500 text-xs font-bold">Processing your job matches...</p>
                    </div>
                  ) : error ? (
                    <div className="h-64 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center justify-center p-6 text-center">
                      <AlertCircle size={40} className="text-red-400 mb-3" />
                      <h3 className="text-lg font-bold text-red-800 mb-1">Scraper Connection Error</h3>
                      <p className="text-red-600 text-xs mb-4">{error}</p>
                      <button onClick={fetchJobs} className="bg-red-100 hover:bg-red-200 text-red-800 px-5 py-2 rounded-xl text-xs font-bold transition-all">
                        Try Again
                      </button>
                    </div>
                  ) : sortedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {sortedJobs.map((job, idx) => (
                        <JobCard 
                          key={idx} 
                          job={job} 
                          onClick={() => handleJobClick(job)} 
                          relevanceScore={getRelevanceScore(job)}
                          isSaved={savedJobs.some(sj => sj.link === job.link)}
                          onSaveToggle={handleSaveToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 bg-white rounded-2xl border border-[#C2C6D4] border-dashed flex flex-col items-center justify-center p-6 text-center shadow-sm">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        <Briefcase size={26} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">No matches found</h3>
                      <p className="text-xs text-slate-400">Try adjusting your search keywords or location filter.</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Active Job Boards Widget */}
                  <div className="w-full mt-8 animate-in fade-in duration-300">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Active Job Boards:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { name: 'Internshala' },
                        { name: 'WeWorkRemotely' },
                        { name: 'Shine' },
                        { name: 'Naukri' },
                        { name: 'LinkedIn' }
                      ].map((board) => (
                        <div key={board.name} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col shadow-sm">
                          <span className="text-xs font-bold text-slate-800">{board.name}</span>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Job Roles Widget */}
                  <div className="w-full mt-8 mb-12 animate-in fade-in duration-300">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Popular Job Roles:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {[
                        { role: 'React Developer', subtitle: 'Remote / Work from home', icon: Atom, color: 'text-[#00D8FF] bg-sky-50 border-sky-100' },
                        { role: 'Python Engineer', subtitle: 'Remote / Global', icon: Terminal, color: 'text-yellow-600 bg-amber-50 border-amber-100' },
                        { role: 'Game Developer', subtitle: 'Remote / Hybrid', icon: Gamepad, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                        { role: 'Web Designer', subtitle: 'Remote / Anywhere', icon: Palette, color: 'text-rose-500 bg-rose-50 border-rose-100' }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={item.role} 
                            onClick={() => handlePopularRoleClick(item.role)}
                            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.color.split(' ')[1]} ${item.color.split(' ')[2]}`}>
                              <Icon size={18} className={`${item.color.split(' ')[0]}`} />
                            </div>
                            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.role}</span>
                            <span className="text-[10px] font-semibold text-slate-400 mt-1">{item.subtitle}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* 4. Saved Jobs Tab */}
          {activeTab === 'Saved Jobs' && (
            <div className="mt-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Your Saved Jobs</h3>
              {savedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {savedJobs.map((job, idx) => (
                    <JobCard 
                      key={idx} 
                      job={job} 
                      onClick={() => handleJobClick(job)} 
                      isSaved={true}
                      onSaveToggle={handleSaveToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center shadow-sm">
                  <div className="w-14 h-14 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mb-3">
                    <Heart size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No saved jobs</h3>
                  <p className="text-xs text-slate-400">Click the heart icon on any job to save it here for reference.</p>
                </div>
              )}
            </div>
          )}

          {/* 5. Applied Jobs Tab */}
          {activeTab === 'Applied Jobs' && (
            <div className="mt-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Your Applications</h3>
              {appliedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {appliedJobs.map((job, idx) => (
                    <JobCard 
                      key={idx} 
                      job={job} 
                      onClick={() => handleJobClick(job)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center shadow-sm">
                  <div className="w-14 h-14 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-3">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No applications submitted yet</h3>
                  <p className="text-xs text-slate-400">Apply to jobs through the job board to keep track of your history.</p>
                </div>
              )}
            </div>
          )}



        </div>
      </div>

      {/* Modals */}
      {/* Detailed Job Modal */}
      {selectedJob && !showApplyModal && (
        <JobDetailsModal 
          job={selectedJob} 
          details={jobDetails}
          isLoading={isDetailsLoading}
          onClose={() => setSelectedJob(null)}
          onApplyClick={() => setShowApplyModal(true)}
        />
      )}

      {/* Application Form Modal */}
      {showApplyModal && selectedJob && (
        <JobApplicationModal 
          job={selectedJob}
          userInfo={userInfo}
          onClose={() => setShowApplyModal(false)}
          onApplySuccess={(appliedJob) => {
            handleSaveToggle(selectedJob); // Optional: also save
            const email = userInfo?.email || 'default';
            const updatedApplied = [...appliedJobs, selectedJob];
            setAppliedJobs(updatedApplied);
            localStorage.setItem(`appliedJobs_${email}`, JSON.stringify(updatedApplied));
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Resume Analyzer Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowResumeModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowResumeModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={18} />
            </button>
            <div className="flex-1 overflow-y-auto pr-2 mt-4">
              <ResumeParser onParseSuccess={handleResumeParseSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Scraper Loading Simulation Overlay */}
      {isSimulatingScrape && (
        <div className="console-progress-card-overlay animate-fade-in" style={{ zIndex: 9999, position: 'fixed' }}>
          <div className="premium-progress-card animate-slide-up">
            {/* Progress Bar Container */}
            <div className="loading-progress-bar-container">
              <div className="loading-progress-bar" style={{ width: `${scrapeProgress}%` }}></div>
            </div>
            
            {/* Radar Scanner Area */}
            <div className="loading-scanner-container">
              <div className="radar-scanner">
                <div className="radar-sweep"></div>
                <div className="radar-circle ring-1"></div>
                <div className="radar-circle ring-2"></div>
                <div className="radar-circle ring-3"></div>
                <div className="radar-pulse"></div>
              </div>
              <h3>Searching Job Boards...</h3>
              <p className="loading-subtitle">Scraping and analyzing job boards in real-time</p>
            </div>

            {/* Interactive Mini Game */}
            <RunnerGame />
            
            {/* Trivia Slideshow (Distraction & Value Addition) */}
            <div className="trivia-card">
              <div className="trivia-header">
                <span className="trivia-icon">{LOADING_TRIVIA[triviaIndex]?.icon}</span>
                <span className="trivia-category">{LOADING_TRIVIA[triviaIndex]?.category}</span>
              </div>
              <p className="trivia-text">"{LOADING_TRIVIA[triviaIndex]?.text}"</p>
            </div>
            
            {/* Terminal Logs console */}
            <div className="console-logs-header">
              <span>SYSTEM LOGS</span>
              <span className="console-percentage">{Math.round(scrapeProgress)}%</span>
            </div>
            <div className="console-logs-list">
              {statusLogs.map((log, index) => (
                <div key={index} className="log-line">
                  <span className="log-arrow">›</span> {log}
                </div>
              ))}
              <div className="log-cursor-line">
                <span className="log-arrow">›</span>
                <span className="terminal-cursor">█</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
