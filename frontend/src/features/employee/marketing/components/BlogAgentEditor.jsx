import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Code, Factory, ArrowLeft, CheckCircle, 
  HelpCircle, CloudUpload, Wand2, Code2, Eye, Sparkles,
  Download, Image as ImageIcon, Loader2, Trash2, Cpu, AlertCircle, RefreshCw,
  Terminal, X, ExternalLink, AlertTriangle
} from 'lucide-react';
import {
  getBlogConfig, getBlogs, getBlogDetails, deleteBlog,
  generateBlogImageOnly, generateBlog, publishBlog
} from '../../api/employeeApi';

const getSiteConfig = (site) => {
  switch(site) {
    case 'edtech': return { name: 'Novox Edtech', icon: GraduationCap, color: 'blue', id: 'novox_edtech' };
    case 'core': return { name: 'Novox Core', icon: Code, color: 'green', id: 'novox_core' };
    case 'kalyan': return { name: 'Novox Kalyan', icon: Factory, color: 'orange', id: 'novox_kalyan' };
    default: return { name: 'Unknown Site', icon: GraduationCap, color: 'slate', id: 'novox_edtech' };
  }
};

const BlogAgentEditor = () => {
  const { site } = useParams();
  const navigate = useNavigate();
  const config = getSiteConfig(site);
  
  const [activeTab, setActiveTab] = useState('editor');
  
  // State 
  const [configData, setConfigData] = useState({ 
    categories: [{ name: 'Loading...' }],
    seo: { headingTag: 'h2', subheadingTag: 'h3', requireFaq: true, requireConclusion: true, ctaClass: 'blog-details-cta', ctaAnchorClass: 'tp-btn-3', ctaTextPattern: [] }
  });
  const [blogList, setBlogList] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState('new');
  
  // Form State
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [landingUrl, setLandingUrl] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('Novox Expert');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [imagePath, setImagePath] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const [slug, setSlug] = useState('');
  
  // Editor State
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [originalFilename, setOriginalFilename] = useState('');
  const [geminiTokens, setGeminiTokens] = useState({ input: 0, output: 0, total: 0 });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Git Push Console State
  const [showPublishConsole, setShowPublishConsole] = useState(false);
  const [publishLogs, setPublishLogs] = useState([]);
  const [publishStatus, setPublishStatus] = useState('idle'); // idle, publishing, success, error
  const [commitData, setCommitData] = useState(null);

  // Delete Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('idle'); // idle, deleting, success, error
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const cfgData = await getBlogConfig();
        if (cfgData && cfgData[config.id]) {
          const activeConfig = cfgData[config.id];
          setConfigData(activeConfig);
          if (activeConfig.categories && activeConfig.categories.length > 0) {
            setCategory(activeConfig.categories[0].name);
            setLandingUrl(activeConfig.defaultLandingUrl || 'services.html');
          }
        }

        const listData = await getBlogs(config.id);
        if (Array.isArray(listData)) setBlogList(listData);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [site, config.id]);

  useEffect(() => {
    if (!slug && seoTitle) {
      setSlug(seoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [seoTitle, slug]);

  useEffect(() => {
    if (configData.categories && category) {
      const match = configData.categories.find(c => c.name === category);
      if (match) {
        setLandingUrl(match.url);
      }
    }
  }, [category, configData.categories]);

  const handleLoadBlog = async () => {
    if (!selectedBlog || selectedBlog === 'new') return;
    try {
      setIsLoading(true);
      const data = await getBlogDetails(selectedBlog, config.id);
      
      setSeoTitle(data.title || '');
      setMetaDescription(data.description || '');
      setHtmlBody(data.content_html || '');
      setCategory(data.category || configData.categories[0]?.name || '');
      setAuthor(data.author || 'Novox Expert');
      
      let parsedDate = new Date().toISOString().split('T')[0];
      if (data.date) {
        const d = new Date(data.date);
        if (!isNaN(d.getTime())) {
          parsedDate = d.toISOString().split('T')[0];
        }
      }
      setPublishDate(parsedDate);
      
      setImagePath(data.image || '');
      setSlug(data.slug || '');
      setPrimaryKeyword(data.keyword || '');
      setLandingUrl(data.landing_url || '');
      setOriginalFilename(data.filename || selectedBlog);
      
      // Fix article topic and keywords not being loaded
      setTopic(data.title || '');
      setKeywords(data.keyword || '');
      
      // Fix broken featured image preview & add cache buster for GitHub CDN
      const cb = Date.now();
      if (data.raw_image_url) {
         setPreviewImageUrl(`${data.raw_image_url}&cb=${cb}`);
      } else if (data.image) {
         setPreviewImageUrl(`/api/blogs-image?siteId=${config.id}&path=${encodeURIComponent(data.image)}&cb=${cb}`);
      } else {
         setPreviewImageUrl('');
      }
      setBase64Image(''); 
    } catch(err) {
      console.error(err);
      alert('Error loading blog');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = () => {
    if (!selectedBlog || selectedBlog === 'new') return;
    setDeleteStatus('idle');
    setDeleteMessage('');
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    try {
      setDeleteStatus('deleting');
      const data = await deleteBlog(selectedBlog, config.id);
      
      if (data.success) {
        setDeleteStatus('success');
        setDeleteMessage('Blog successfully deleted from GitHub.');
        setSelectedBlog('new');
        
        // Refresh the blog list
        const listData = await getBlogs(config.id);
        if (Array.isArray(listData)) setBlogList(listData);
      } else {
        setDeleteStatus('error');
        setDeleteMessage(data.message || data.error || 'Failed to delete blog.');
      }
    } catch(err) {
      console.error(err);
      setDeleteStatus('error');
      setDeleteMessage('Error connecting to the server.');
    }
  };

  const handleRegenerateImage = async () => {
    if (!topic && !seoTitle) {
      alert("Topic or Title is required to generate an image");
      return;
    }
    try {
      setIsGenerating(true);
      const bodyPayload = {
        title: seoTitle || topic,
        topic: topic || seoTitle,
        keywords: keywords || primaryKeyword,
        category: category || configData.categories[0]?.name,
      };

      const data = await generateBlogImageOnly(bodyPayload, config.id);
      
      if (data.image_base64) {
        setBase64Image(data.image_base64);
        setPreviewImageUrl(`data:image/webp;base64,${data.image_base64}`);
      }
      // Assuming API might return image_path if it saves it, otherwise we keep existing
      if (data.image_path) {
        setImagePath(data.image_path);
      }
    } catch(err) {
      console.error(err);
      alert('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftAI = async () => {
    const selectedCategory = category || configData.categories[0]?.name;

    const missingFields = [];
    if (!topic.trim()) missingFields.push("Article Topic");
    if (!keywords.trim()) missingFields.push("Target Keywords");
    if (!selectedCategory || selectedCategory === "Loading...") missingFields.push("Category");
    if (!author.trim()) missingFields.push("Author");
    if (!primaryKeyword.trim()) missingFields.push("Primary Keyword");

    if (missingFields.length > 0) {
      alert(`Cannot draft: The following fields are missing or loading:\n• ${missingFields.join("\n•  ")}`);
      return;
    }

    try {
      setIsGenerating(true);
      const bodyPayload = {
        topic,
        keywords,
        category: selectedCategory,
        author,
        primary_keyword: primaryKeyword,
        landing_url: landingUrl,
        generate_image: generateImage
      };

      const data = await generateBlog(bodyPayload, config.id);
      
      if (data.title) setSeoTitle(data.title);
      if (data.description) setMetaDescription(data.description);
      if (data.content_html) setHtmlBody(data.content_html);
      if (data.image_base64) {
        setBase64Image(data.image_base64);
        setPreviewImageUrl(`data:image/webp;base64,${data.image_base64}`);
      }
      if (data.usage) {
        setGeminiTokens({
           input: data.usage.prompt_tokens || 0,
           output: data.usage.completion_tokens || 0,
           total: data.usage.total_tokens || 0
        });
      }
    } catch(err) {
      console.error(err);
      alert('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const handlePublish = async () => {
    if (!seoTitle || !htmlBody || !slug) {
      alert("Title, Body, and Slug are required.");
      return;
    }
    
    setShowPublishConsole(true);
    setPublishStatus('publishing');
    setPublishLogs([]);
    setCommitData(null);
    
    const addLog = (text) => {
       const time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
       setPublishLogs(prev => [...prev, `[${time}] ${text}`]);
    };

    try {
      setIsPublishing(true);
      addLog(`API: Compiled static page payload: "${slug}.html".`);
      await delay(600);
      
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

      let finalImagePath = imagePath;
      if (!finalImagePath && slug) {
        finalImagePath = `assets/img/blog/new/${slug}.webp`;
        setImagePath(finalImagePath);
      }

      if (base64Image) {
         addLog(`API: Optimizing new image and preparing assets.`);
         await delay(800);
      }

      const payload = {
        title: seoTitle,
        description: metaDescription,
        category: category || configData.categories[0]?.name,
        author,
        date: publishDate,
        image: finalImagePath,
        content_html: htmlBody,
        slug,
        landing_url: landingUrl,
        keyword: primaryKeyword,
      };
      
      if (base64Image) {
        payload.image_base64 = base64Image;
      }
      if (originalFilename && selectedBlog !== 'new') {
        payload.original_filename = originalFilename;
      }

      const data = await publishBlog(payload, config.id);
      
      if (data.success) {
        addLog(`API: Injected listing card into "blogs.html" container.`);
        await delay(400);
        addLog(`API: Appended URL to "sitemap.xml".`);
        await delay(400);
        addLog(`GitHub: Combined updates into single transactional tree.`);
        await delay(400);
        addLog(`GitHub: Created commit SHA ${data.commit_sha?.substring(0, 7) || 'unknown'}.`);
        await delay(300);
        addLog(`GitHub: Advanced heads/main reference successfully.`);
        await delay(300);
        addLog(`Website publication committed successfully!`);
        
        setCommitData(data);
        setPublishStatus('success');
      } else {
        addLog(`Error: ${data.message || data.error || 'Failed to publish'}`);
        setPublishStatus('error');
      }
    } catch(err) {
      console.error(err);
      addLog(`System Error: Connection to backend failed.`);
      setPublishStatus('error');
    } finally {
      setIsPublishing(false);
    }
  };

  // SEO Checklist Logic
  const requireFaq = configData.seo?.requireFaq !== false;
  const requireConclusion = configData.seo?.requireConclusion !== false;
  
  let wTitle = 10, wDesc = 10, wContent = 10, wKeywords = 10, wIntro = 15;
  let wHeadings = 10, wInternal = 10, wCta = 10, wSlug = 5;
  let wFaq = requireFaq ? 5 : 0;
  let wConclusion = requireConclusion ? (requireFaq ? 5 : 10) : 0;
  
  let score = 0;
  
  // 1. Title Length
  const passTitle = seoTitle.length >= 50 && seoTitle.length <= 60 ? true : (seoTitle.length > 0 ? 'partial' : false);
  if (passTitle === true) score += wTitle;
  else if (passTitle === 'partial') score += Math.round(wTitle * 0.3);
  
  // 2. Meta Description Length
  const passDesc = metaDescription.length >= 120 && metaDescription.length <= 160 ? true : (metaDescription.length > 0 ? 'partial' : false);
  if (passDesc === true) score += wDesc;
  else if (passDesc === 'partial') score += Math.round(wDesc * 0.3);
  
  // 3. Word Count
  const plainText = htmlBody.replace(/<[^>]*>/g, ' ');
  const lenCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const passContent = lenCount >= 300 ? true : (lenCount > 0 ? 'partial' : false);
  if (passContent === true) score += wContent;
  else if (passContent === 'partial') score += Math.round(wContent * 0.3);
  
  // 4. Keyword Density
  let keywordCount = 0;
  if (primaryKeyword) {
    const rx = new RegExp(primaryKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    keywordCount = (plainText.match(rx) || []).length;
  }
  const passKeywords = keywordCount >= 3 ? true : (keywordCount > 0 ? 'partial' : false);
  if (passKeywords === true) score += wKeywords;
  else if (passKeywords === 'partial') score += Math.round(wKeywords * 0.3);
  
  // 5. Keyword in Intro
  let keywordInIntro = false;
  if (primaryKeyword && plainText) {
    const sentences = plainText.split('.').map(s => s.trim()).filter(s => s.length > 0);
    const introText = sentences.slice(0, 3).join(' ').toLowerCase();
    if (introText.includes(primaryKeyword.toLowerCase())) {
      score += wIntro;
      keywordInIntro = true;
    }
  }
  
  // 6. Subheadings Hierarchy
  const headingTag = configData.seo?.headingTag || 'h2';
  const headingRx = new RegExp(`<${headingTag}[^>]*>`, 'gi');
  const h2Count = (htmlBody.match(headingRx) || []).length;
  const hasH1 = /<h1[^>]*>/i.test(htmlBody);
  const passHeadings = h2Count >= 2 && !hasH1;
  if (passHeadings) score += wHeadings;
  
  // 7. FAQ Section
  let hasFaq = false;
  if (requireFaq) {
    const faqPatterns = [/faq/i, /frequently asked questions/i, /doubt/i];
    hasFaq = faqPatterns.some(p => p.test(plainText)) && new RegExp(`<${configData.seo?.subheadingTag || 'h3'}[^>]*>`, 'i').test(htmlBody);
    if (hasFaq) score += wFaq;
  }
  
  // 8. Conclusion Section
  let hasConclusion = false;
  if (requireConclusion) {
    const concPatterns = [/conclusion/i, /summary/i, /wrapping up/i, /final thoughts/i];
    hasConclusion = concPatterns.some(p => p.test(plainText));
    if (hasConclusion) score += wConclusion;
  }
  
  // 9. Internal Linking
  const hasLandingUrl = [...htmlBody.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].some(m => {
    return m[1].includes('{{COURSE_URL}}') || (landingUrl && m[1].includes(landingUrl));
  });
  if (hasLandingUrl) score += wInternal;
  
  // 10. Styled CTA Button
  let hasCta = false;
  const ctaTextPatterns = configData.seo?.ctaTextPattern?.map(p => new RegExp(p, 'i')) || [/contact/i, /reach out/i, /enquire/i, /apply/i, /call/i];
  if (config.id === 'novox_core') {
    hasCta = new RegExp(`<a\\s+[^>]*class=["'][^"']*${configData.seo?.ctaAnchorClass || 'btn'}[^"']*["'][^>]*href=["']contact\\.html["']`, 'i').test(htmlBody);
  } else {
    const ctaClass = configData.seo?.ctaClass || 'blog-details-cta';
    const ctaAnchorClass = configData.seo?.ctaAnchorClass || 'tp-btn-3';
    const ctaMatches = [...htmlBody.matchAll(new RegExp(`<div\\s+[^>]*class=["'][^"']*${ctaClass}[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`, 'gis'))];
    hasCta = ctaMatches.some(m => {
      const aMatches = [...m[1].matchAll(new RegExp(`<a\\s+[^>]*class=["'][^"']*${ctaAnchorClass}[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>`, 'gis'))];
      return aMatches.some(a => {
        return (a[1] === 'contact.html' || a[1].includes('contact.html')) && ctaTextPatterns.some(p => p.test(a[2]));
      });
    });
  }
  if (hasCta) score += wCta;
  
  // 11. Slug format
  const isSlugValid = slug.length > 0 && /^[a-z0-9-]+$/.test(slug);
  if (isSlugValid) score += wSlug;
  
  score = Math.min(100, score);

  const getColors = () => {
    switch(config.color) {
      case 'blue': return { text: 'text-blue-700', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', lightBg: 'bg-blue-50', border: 'border-blue-200', gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600', gradientHover: 'hover:from-blue-700 hover:to-indigo-700', shadow: 'shadow-blue-500/30' };
      case 'green': return { text: 'text-green-700', bg: 'bg-green-600', hover: 'hover:bg-green-700', lightBg: 'bg-green-50', border: 'border-green-200', gradient: 'bg-gradient-to-r from-green-500 to-emerald-600', gradientHover: 'hover:from-green-600 hover:to-emerald-700', shadow: 'shadow-green-500/30' };
      case 'orange': return { text: 'text-orange-700', bg: 'bg-orange-500', hover: 'hover:bg-orange-600', lightBg: 'bg-orange-50', border: 'border-orange-200', gradient: 'bg-gradient-to-r from-orange-500 to-amber-500', gradientHover: 'hover:from-orange-600 hover:to-amber-600', shadow: 'shadow-orange-500/30' };
      default: return { text: 'text-slate-700', bg: 'bg-slate-600', hover: 'hover:bg-slate-700', lightBg: 'bg-slate-50', border: 'border-slate-200', gradient: 'bg-gradient-to-r from-slate-600 to-slate-700', gradientHover: 'hover:from-slate-700 hover:to-slate-800', shadow: 'shadow-slate-500/30' };
    }
  };
  
  const colors = getColors();
  const SiteIcon = config.icon;
  const strokeDashoffset = 351.85 - (score / 100) * 351.85;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-100 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden font-sans text-slate-800">
      
      {/* Top Header */}
      <div className="flex-shrink-0 h-[64px] bg-white/80 backdrop-blur-xl border-b border-white/50 px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${colors.lightBg} ${colors.text} flex items-center justify-center shadow-inner`}>
            <SiteIcon size={20} />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">{config.name}</h1>
          <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full border border-slate-200/60 shadow-sm">
            Blog Verification Hub
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/blog-agent')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={16} /> Switch Website
          </button>
          <div className="flex items-center gap-2 text-sm font-black text-emerald-700 bg-emerald-50/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-200/50 shadow-sm">
            <CheckCircle size={16} /> Editor Mode
          </div>
        </div>
      </div>

      {/* Main Content Area - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Blog Parameters */}
        <div className="w-[340px] flex-shrink-0 bg-white/90 backdrop-blur-xl border-r border-white/60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/80 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
          <div className="p-5 flex flex-col gap-5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Sparkles size={16} className={colors.text} /> Blog Parameters
            </h2>

            {/* Edit Existing */}
            <div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Edit Existing Blog</label>
              <div className="flex gap-2">
                <select 
                  value={selectedBlog} 
                  onChange={e => setSelectedBlog(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 shadow-sm transition-all"
                >
                  <option value="new">✨ Create New Post</option>
                  {blogList.map(b => (
                    <option key={b.filename} value={b.filename}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={handleLoadBlog}
                  disabled={isLoading || selectedBlog === 'new'}
                  className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-200/60 text-slate-700 px-3 py-2 rounded-xl text-sm font-bold hover:from-slate-200 hover:to-slate-300 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Load
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={selectedBlog === 'new' || deleteStatus === 'deleting'}
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50 transition-all hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]"
                >
                  {deleteStatus === 'deleting' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Article Topic</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Future of AI in Web Development" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 placeholder-slate-400 shadow-sm transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Keywords</label>
              <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. AI in web design, web development" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 placeholder-slate-400 shadow-sm transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary SEO Keyword</label>
              <input type="text" value={primaryKeyword} onChange={e => setPrimaryKeyword(e.target.value)} placeholder="e.g. AI in web design" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 placeholder-slate-400 shadow-sm transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 shadow-sm transition-all">
                {configData.categories?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Author</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Publish Date</label>
                <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 shadow-sm transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Featured Image Path</label>
              <input type="text" value={imagePath} onChange={e => setImagePath(e.target.value)} placeholder="e.g. assets/img/blog/new/..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 shadow-sm transition-all" />
            </div>

            {previewImageUrl && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Loaded Image Preview</label>
                <div className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <img src={previewImageUrl} alt="Preview" className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-xs font-bold drop-shadow-md">Preview</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" checked={generateImage} onChange={e => setGenerateImage(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded shadow-sm peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-colors flex items-center justify-center">
                    <CheckCircle size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs font-black text-slate-700 leading-tight group-hover:text-pink-600 transition-colors uppercase tracking-wide">
                  <ImageIcon size={14} className="inline mr-1 text-pink-500" />
                  Generate AI Image using Imagen 4
                </span>
              </label>
              
              <button 
                onClick={handleRegenerateImage}
                disabled={isGenerating}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-200/80 transition-all hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 {isGenerating ? <Loader2 size={16} className="animate-spin text-pink-500" /> : <RefreshCw size={16} className="text-pink-500" />} Regenerate Image Only
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">URL Slug (Kebab-Case)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. future-of-ai-web-development" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 shadow-sm transition-all" />
              <p className="text-[10px] text-slate-400 px-1 italic">Auto-generated from title, but editable.</p>
            </div>

            <button 
              onClick={handleDraftAI}
              disabled={isGenerating}
              className={`w-full py-3.5 ${colors.gradient} ${colors.gradientHover} text-white rounded-2xl text-sm font-black shadow-lg ${colors.shadow} transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] tracking-wide uppercase`}
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />} Draft Article with AI
            </button>
            <div className="h-4"></div>
          </div>
        </div>

        {/* Middle Column: Editor & Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Tab Bar */}
          <div className="h-[64px] border-b border-slate-200/60 flex items-center justify-between px-6 bg-white/60 backdrop-blur-md">
            <div className="flex bg-slate-200/50 rounded-xl p-1 border border-slate-200/50 shadow-inner">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-black rounded-lg transition-all duration-300 ${activeTab === 'editor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
              >
                <Code2 size={16} /> Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-black rounded-lg transition-all duration-300 ${activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
              >
                <Eye size={16} /> Live Site Preview
              </button>
            </div>
            
            <button 
              onClick={handlePublish}
              disabled={isPublishing || score < 80}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide"
            >
              {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />} Verify & Publish to GitHub
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300">
            {activeTab === 'editor' ? (
              <div className="max-w-4xl mx-auto flex flex-col gap-6 h-full">
                <div className="bg-white/90 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block pl-1">Generated Title (SEO Title)</label>
                  <input 
                    type="text" 
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    placeholder="Click generate to load a title..." 
                    className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 placeholder-slate-400 font-bold text-slate-800 shadow-inner transition-all" 
                  />
                  
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-5 block pl-1">Meta Description</label>
                  <textarea 
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="Click generate to load a description..." 
                    className="w-full border border-slate-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 placeholder-slate-400 resize-y min-h-[100px] font-medium text-slate-800 shadow-inner transition-all leading-relaxed" 
                  />
                </div>

                <div className="bg-[#0f172a] rounded-3xl p-6 shadow-xl shadow-slate-900/20 flex-1 flex flex-col min-h-[400px] border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <Code2 size={14} className="text-blue-400" /> Article HTML Body
                  </label>
                  <textarea 
                    value={htmlBody}
                    onChange={e => setHtmlBody(e.target.value)}
                    placeholder="Write or generate content HTML here..." 
                    className="w-full bg-transparent focus:outline-none text-slate-300 font-mono text-sm resize-none flex-1 placeholder-slate-600 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700" 
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto border border-slate-300 rounded-xl shadow-lg bg-white overflow-hidden flex flex-col min-h-[600px] text-slate-800">
                {/* Mock Browser Header */}
                <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-slate-200 text-slate-500 text-xs px-6 py-1 rounded-full w-2/3 text-center flex items-center justify-center gap-2">
                      <span>🔒 https://{site === 'edtech' ? 'novoxedtechllp.com' : site === 'core' ? 'novoxcore.com' : 'kalyanjewellerymachines.com'}/{slug || 'untitled-post'}.html</span>
                    </div>
                  </div>
                </div>
                {/* Mock Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    <h1 className={`text-4xl font-black ${colors.text} mb-4 uppercase tracking-tight`}>{config.name}</h1>
                    <div className="text-sm text-slate-500 mb-8 border-b border-slate-200 pb-4">Home / Blog / {category || 'Category'}</div>
                    <h2 className="text-5xl font-black text-slate-900 mb-6">{seoTitle || 'Draft Title'}</h2>
                    <div className="flex gap-4 text-sm font-bold text-slate-600 mb-8">
                      <span className="flex items-center gap-2">📅 {new Date(publishDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2">👤 By {author || 'Novox Expert'}</span>
                      <span className="flex items-center gap-2">📁 {category || 'Category'}</span>
                    </div>
                    {previewImageUrl ? (
                      <img src={previewImageUrl} alt="Featured" className="w-full aspect-[16/9] object-cover rounded-2xl mb-8 border border-slate-300" />
                    ) : (
                      <div className="w-full aspect-[16/9] bg-slate-200 rounded-2xl flex items-center justify-center mb-8 border border-slate-300 text-slate-400">
                        <span className="text-4xl font-bold">Featured Image</span>
                      </div>
                    )}
                    <div className="text-lg text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlBody || '<p>Generated content will appear here...</p>' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SEO Verification */}
        <div className="w-[340px] flex-shrink-0 bg-white/90 backdrop-blur-xl border-l border-white/60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/80 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
          <div className="p-6 flex flex-col gap-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <CheckCircle size={16} />
              </div>
              SEO Verification
            </h2>

            {/* Score Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
              <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="351.85" strokeDashoffset={strokeDashoffset} className={`${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-slate-800">{score}<span className="text-sm text-slate-500 font-bold">/100</span></span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Optimization Score</span>
            </div>

            {/* Gemini Usage Panel */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
               <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gemini Usage</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">Input Tokens</div>
                    <div className="text-sm font-bold text-slate-800">{geminiTokens.input}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">Output Tokens</div>
                    <div className="text-sm font-bold text-slate-800">{geminiTokens.output}</div>
                  </div>
               </div>
               <div className="pt-2 border-t border-blue-200 flex justify-between items-center mt-1">
                  <div className="text-[10px] text-slate-500 font-bold">Total Tokens</div>
                  <div className="text-sm font-bold text-blue-600">{geminiTokens.total}</div>
               </div>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Checklist Requirements</h3>
              
              {[
                { label: 'Title (50-60 chars)', value: `${seoTitle.length} chars`, pass: passTitle },
                { label: 'Meta Desc (120-160 chars)', value: `${metaDescription.length} chars`, pass: passDesc },
                { label: 'Length (Min 300 words)', value: `${lenCount} words`, pass: passContent },
                { label: 'Keywords count', value: `${keywordCount} matches`, pass: passKeywords },
                { label: 'Keyword in Intro', value: keywordInIntro ? 'Yes' : 'No', pass: keywordInIntro },
                { label: `Subheadings ${headingTag}`, value: `${h2Count} found`, pass: passHeadings },
                ...(requireFaq ? [{ label: 'FAQ Section present', value: hasFaq ? 'Yes' : 'No', pass: hasFaq }] : []),
                ...(requireConclusion ? [{ label: 'Conclusion Section', value: hasConclusion ? 'Yes' : 'No', pass: hasConclusion }] : []),
                { label: 'Link to Landing Page', value: hasLandingUrl ? 'Yes' : 'No', pass: hasLandingUrl },
                { label: 'Styled CTA button', value: hasCta ? 'Yes' : 'No', pass: hasCta },
                { label: 'Slug format', value: isSlugValid ? 'Yes' : 'No', pass: isSlugValid },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between border ${item.pass === true ? 'border-emerald-200 bg-emerald-50' : item.pass === 'partial' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'} p-3 rounded-lg shadow-sm transition-colors`}>
                  <div className="flex items-center gap-2">
                    {item.pass === true ? (
                       <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    ) : item.pass === 'partial' ? (
                       <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                    ) : (
                       <AlertCircle size={14} className="text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                  </div>
                  {item.value && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.pass === true ? 'bg-emerald-100 text-emerald-700' : item.pass === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="h-4"></div>
          </div>
        </div>
      </div>
      
      {/* Git Push Console Modal */}
      {showPublishConsole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1121] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#111827]">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-blue-400" />
                <h3 className="text-slate-200 font-bold tracking-wide">Git Push Console</h3>
              </div>
              <button 
                onClick={() => setShowPublishConsole(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Terminal Window */}
            <div className="p-6 bg-[#0b1121] min-h-[250px] max-h-[400px] overflow-y-auto font-mono text-sm space-y-2.5">
              {publishLogs.map((log, index) => {
                const isError = log.includes('Error:');
                const isSuccess = log.includes('successfully!');
                const isGithub = log.includes('GitHub:');
                
                return (
                  <div key={index} className="flex gap-3">
                    <span className="text-slate-500 flex-shrink-0 select-none opacity-60">
                      {log.substring(0, 13)} {/* Extracts [HH:MM:SS AM] */}
                    </span>
                    <span className={`
                      ${isError ? 'text-red-400 font-semibold' : ''}
                      ${isSuccess ? 'text-emerald-400' : ''}
                      ${isGithub && !isSuccess ? 'text-emerald-300' : ''}
                      ${!isError && !isSuccess && !isGithub ? 'text-slate-300' : ''}
                    `}>
                      {log.substring(14)}
                    </span>
                  </div>
                );
              })}
              {publishStatus === 'publishing' && (
                <div className="flex gap-3 items-center text-slate-500 animate-pulse mt-4">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-800/80 bg-[#111827] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {publishStatus === 'publishing' && <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>}
                {publishStatus === 'success' && <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>}
                {publishStatus === 'error' && <span className="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>}
                
                <span className="text-sm font-semibold text-slate-300">
                  {publishStatus === 'publishing' && 'Publishing to GitHub...'}
                  {publishStatus === 'success' && 'Pushed to GitHub Successfully!'}
                  {publishStatus === 'error' && 'Failed to Push.'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {publishStatus === 'success' && commitData?.commit_url && (
                  <a 
                    href={commitData.commit_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg transition-colors border border-slate-700"
                  >
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="w-4 h-4 invert opacity-80" />
                    View Commit
                  </a>
                )}
                {publishStatus !== 'publishing' && (
                  <button 
                    onClick={() => setShowPublishConsole(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all">
            <div className="p-8">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 text-center mb-3">Delete Blog Post?</h3>
              
              {deleteStatus === 'idle' && (
                <p className="text-slate-500 text-center text-sm leading-relaxed mb-6">
                  Are you sure you want to delete <span className="font-bold text-slate-800">"{selectedBlog}"</span>? 
                  This will permanently remove the HTML file and update associated references in your GitHub repository. This action cannot be undone.
                </p>
              )}
              {deleteStatus === 'deleting' && (
                <div className="flex flex-col items-center justify-center py-6 gap-4">
                  <Loader2 size={36} className="animate-spin text-red-500" />
                  <p className="text-sm font-bold text-slate-600 tracking-wide uppercase">Deleting from GitHub...</p>
                </div>
              )}
              {deleteStatus === 'success' && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2">
                    <CheckCircle size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700 text-center">{deleteMessage}</p>
                </div>
              )}
              {deleteStatus === 'error' && (
                <div className="flex flex-col items-center justify-center py-6 gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-sm font-bold text-red-600 text-center">{deleteMessage}</p>
                </div>
              )}
            </div>
            
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3 justify-center">
              {deleteStatus === 'idle' ? (
                <>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeDelete}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Yes, Delete
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteStatus === 'deleting'}
                  className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogAgentEditor;
