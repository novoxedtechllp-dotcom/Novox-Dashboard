import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const JobApplicationModal = ({ job, userInfo, onClose, onApplySuccess }) => {
  const [personName, setPersonName] = useState(userInfo?.name || '');
  const [personEmail, setPersonEmail] = useState(userInfo?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const payload = {
      job_title: job.title,
      company: job.company,
      location: job.location,
      link: job.link,
      person_name: personName,
      person_email: personEmail
    };

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://novox-job-scraper-api.onrender.com';
      const response = await fetch(`${baseUrl}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onApplySuccess(data);
          onClose();
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg(data.detail || 'Failed to submit application.');
      }
    } catch (error) {
      console.error('Application error:', error);
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && status !== 'success' && onClose()}
      />

      <div className="relative w-full max-w-md bg-white rounded-[8px] shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-8 duration-300">
        <button 
          onClick={onClose}
          disabled={isSubmitting || status === 'success'}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-[#555F6B] bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-[#003F87] mb-2">Application Sent!</h3>
            <p className="text-[#555F6B] font-medium">Your application for {job.title} at {job.company} has been recorded.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#003F87] mb-2">Apply for Role</h2>
            <p className="text-[#555F6B] font-medium text-sm mb-6">
              Confirm your details before applying for <span className="text-[#003F87] font-semibold">{job.title}</span> at <span className="text-[#003F87] font-semibold">{job.company}</span>.
            </p>

            {status === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-[8px] flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-50 border border-[#C2C6D4] text-[#003F87] px-4 py-3 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all disabled:opacity-60"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={personEmail}
                  onChange={(e) => setPersonEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-50 border border-[#C2C6D4] text-[#003F87] px-4 py-3 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all disabled:opacity-60"
                  placeholder="john@example.com"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#003F87] hover:bg-blue-800 text-white font-bold py-3.5 rounded-[8px] shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Confirm Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JobApplicationModal;
