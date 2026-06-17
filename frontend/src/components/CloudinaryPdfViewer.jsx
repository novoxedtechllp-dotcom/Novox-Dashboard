import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';

const CloudinaryPdfViewer = ({ pdfUrl }) => {
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maxPage, setMaxPage] = useState(null);

  // If a page fails to load, we assume we reached the end (or it's completely broken)
  const handleError = () => {
    setIsLoading(false);
    if (page === 1) {
      setError(true); // First page failed, doc is broken
    } else {
      // Reached the end, go back to previous page and record max page
      setMaxPage(page - 1);
      setPage(prev => prev - 1);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const getPageUrl = (url, pageNum) => {
    if (!url) return '';
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    return `${parts[0]}/upload/pg_${pageNum}/${parts[1].replace(/\.pdf$/i, '.jpg')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full space-y-4 p-8 text-center bg-white rounded-xl my-auto">
        <FileText size={48} className="text-slate-300 mb-2 mx-auto" />
        <h4 className="text-[18px] font-bold text-slate-800">Preview Unavailable</h4>
        <p className="text-slate-500 text-[14px] max-w-sm">
          We couldn't generate a preview for this PDF. Please download it securely to view.
        </p>
        <a 
          href={pdfUrl ? pdfUrl.replace('/upload/', '/upload/fl_attachment/') : '#'} 
          className="bg-[#003F87] hover:bg-[#002B5E] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] transition-colors shadow-sm flex items-center gap-2 mt-4 inline-flex"
        >
          <Download size={16} />
          Download Full PDF
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden">
      <div className="flex-1 w-full overflow-auto flex justify-center p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003F87]"></div>
          </div>
        )}
        <img 
          key={page}
          src={getPageUrl(pdfUrl, page)} 
          alt={`PDF Page ${page}`} 
          className="max-w-full object-contain shadow-sm border border-slate-200 bg-white"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: isLoading && page === 1 ? 'none' : 'block' }}
        />
      </div>
      
      <div className="w-full bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
        <div className="flex items-center bg-slate-50 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
          <button 
            onClick={() => { setIsLoading(true); setPage(p => Math.max(1, p - 1)); }}
            disabled={page === 1 || isLoading}
            className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 font-bold text-[14px] text-slate-700 min-w-[100px] text-center border-x border-slate-200 tracking-wide">
            Page {page}
          </div>
          <button 
            onClick={() => { setIsLoading(true); setPage(p => p + 1); }}
            disabled={isLoading || (maxPage !== null && page >= maxPage)}
            className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <a 
          href={pdfUrl ? pdfUrl.replace('/upload/', '/upload/fl_attachment/') : '#'} 
          className="bg-[#003F87] hover:bg-[#002B5E] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Download size={16} />
          Download Full PDF
        </a>
      </div>
    </div>
  );
};

export default CloudinaryPdfViewer;
