import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Trophy, Cpu } from 'lucide-react';

const ResumeParser = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    setError('');
    
    // Validate file type (PDF or TXT usually supported by backend parsers)
    if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
      setError('Please upload a PDF or TXT file.');
      return;
    }
    
    // Validate size (e.g., max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setFile(selectedFile);
    parseResume(selectedFile);
  };

  const parseResume = async (fileToParse) => {
    setIsParsing(true);
    setParsedData(null);
    
    const formData = new FormData();
    formData.append('file', fileToParse); // Assuming backend expects 'file' form field

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://novox-job-scraper-api.onrender.com';
      const response = await fetch(`${baseUrl}/parse-resume`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      });

      const data = await response.json();

      if (response.ok) {
        setParsedData(data);
      } else {
        setError(data.detail || 'Failed to parse resume.');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setError('Network error. Failed to reach the parsing service.');
    } finally {
      setIsParsing(false);
    }
  };

  const resetParser = () => {
    setFile(null);
    setParsedData(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          AI Resume Analyzer
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Upload your resume to extract skills and match better jobs.
        </p>
      </div>

      {!file && !isParsing && (
        <div 
          className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all ${
            isDragging ? 'border-[#003F87] bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.txt"
          />
          
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-[#003F87]">
            <UploadCloud size={32} />
          </div>
          <h3 className="font-bold text-slate-700 text-lg mb-1">Click or drag file to upload</h3>
          <p className="text-slate-500 text-sm text-center">Supported formats: PDF, TXT (Max 5MB)</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Upload failed</p>
            <p>{error}</p>
            <button onClick={resetParser} className="mt-2 text-red-800 font-bold hover:underline">Try again</button>
          </div>
        </div>
      )}

      {isParsing && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#003F87] rounded-full border-t-transparent animate-spin"></div>
            <FileText size={28} className="text-[#003F87]" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Resume...</h3>
          <p className="text-slate-500 max-w-[250px] mx-auto text-sm">
            Our AI is reading your document to extract key skills and achievements.
          </p>
        </div>
      )}

      {parsedData && !isParsing && (
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-500" />
              <div>
                <p className="font-bold text-emerald-800 text-sm">Parsing Complete</p>
                <p className="text-emerald-600 text-xs font-medium truncate max-w-[200px]">{file?.name}</p>
              </div>
            </div>
            <button onClick={resetParser} className="text-emerald-700 text-xs font-bold hover:underline px-2 py-1">
              Upload New
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Profile</h4>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-800 text-lg">{parsedData.name || 'Name not found'}</p>
                <p className="text-slate-500 text-sm">{parsedData.email || 'Email not found'}</p>
              </div>
            </div>

            {parsedData.skills && parsedData.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Cpu size={14} /> Core Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-50/80 text-[#003F87] border border-blue-100/80 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsedData.achievements && parsedData.achievements.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Trophy size={14} /> Key Achievements
                </h4>
                <ul className="space-y-2">
                  {parsedData.achievements.map((achievement, idx) => (
                    <li key={idx} className="bg-amber-50/50 border border-amber-100/50 p-3 rounded-xl text-sm text-slate-700 leading-relaxed flex gap-3 items-start shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeParser;
