import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Code, Factory, ArrowLeft, CheckCircle, 
  HelpCircle, CloudUpload, Wand2, Code2, Eye, Sparkles,
  Download, Image as ImageIcon, Loader2, Trash2, Cpu, AlertCircle, RefreshCw
} from 'lucide-react';

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
  
  // Actions
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        const token = userInfo?.token;
        const headers = { 'Authorization': `Bearer ${token}` };

        const cfgRes = await fetch('/api/v1/blogs/config', { headers });
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          if (cfgData[config.id]) {
            const activeConfig = cfgData[config.id];
            setConfigData(activeConfig);
            if (activeConfig.categories && activeConfig.categories.length > 0) {
              setCategory(activeConfig.categories[0].name);
              setLandingUrl(activeConfig.defaultLandingUrl || 'services.html');
            }
          }
        }

        const listRes = await fetch(`/api/v1/blogs?siteId=${config.id}`, { headers });
        if (listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData)) setBlogList(listData);
        }
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
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo?.token}` };
      
      const res = await fetch(`/api/v1/blogs/${selectedBlog}?siteId=${config.id}`, { headers });
      const data = await res.json();
      
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
      
      // Fix broken featured image preview
      if (data.raw_image_url) {
         setPreviewImageUrl(data.raw_image_url);
      } else if (data.image) {
         setPreviewImageUrl(`/api/v1/blogs/image?siteId=${config.id}&path=${encodeURIComponent(data.image)}`);
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

  const handleRegenerateImage = async () => {
    if (!topic && !seoTitle) {
      alert("Topic or Title is required to generate an image");
      return;
    }
    try {
      setIsGenerating(true);
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

      const bodyPayload = {
        topic: topic || seoTitle,
        keywords: keywords || primaryKeyword,
        category: category || configData.categories[0]?.name,
      };

      const res = await fetch('/api/v1/blogs/generate-image-only', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`,
          'x-site-id': config.id
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      
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
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

      const bodyPayload = {
        topic,
        keywords,
        category: selectedCategory,
        author,
        primary_keyword: primaryKeyword,
        landing_url: landingUrl,
        generate_image: generateImage
      };

      const res = await fetch('/api/v1/blogs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`,
          'x-site-id': config.id
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      
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

  const handlePublish = async () => {
    if (!seoTitle || !htmlBody || !slug) {
      alert("Title, Body, and Slug are required.");
      return;
    }
    try {
      setIsPublishing(true);
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

      const payload = {
        title: seoTitle,
        description: metaDescription,
        category: category || configData.categories[0]?.name,
        author,
        date: publishDate,
        image: imagePath,
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

      const res = await fetch('/api/v1/blogs/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`,
          'x-site-id': config.id
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Published successfully! Commit: ${data.commit?.sha}`);
      } else {
        alert('Failed to publish: ' + data.message);
      }
    } catch(err) {
      console.error(err);
      alert('Error publishing');
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
      case 'blue': return { text: 'text-blue-700', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', lightBg: 'bg-blue-50', border: 'border-blue-200' };
      case 'green': return { text: 'text-green-700', bg: 'bg-green-600', hover: 'hover:bg-green-700', lightBg: 'bg-green-50', border: 'border-green-200' };
      case 'orange': return { text: 'text-orange-700', bg: 'bg-orange-500', hover: 'hover:bg-orange-600', lightBg: 'bg-orange-50', border: 'border-orange-200' };
      default: return { text: 'text-slate-700', bg: 'bg-slate-600', hover: 'hover:bg-slate-700', lightBg: 'bg-slate-50', border: 'border-slate-200' };
    }
  };
  
  const colors = getColors();
  const SiteIcon = config.icon;
  const strokeDashoffset = 351.85 - (score / 100) * 351.85;

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
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle size={16} /> Editor Mode
          </div>
        </div>
      </div>

      {/* Main Content Area - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Blog Parameters */}
        <div className="w-[320px] flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="p-5 flex flex-col gap-5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Sparkles size={16} className={colors.text} /> Blog Parameters
            </h2>

            {/* Edit Existing */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Edit Existing Blog</label>
              <div className="flex gap-2">
                <select 
                  value={selectedBlog} 
                  onChange={e => setSelectedBlog(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800"
                >
                  <option value="new">-- Create New Post --</option>
                  {blogList.map(b => (
                    <option key={b.filename} value={b.filename}>{b.title}</option>
                  ))}
                </select>
                <button 
                  onClick={handleLoadBlog}
                  disabled={isLoading || selectedBlog === 'new'}
                  className="bg-slate-100 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-1 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Load
                </button>
                <button 
                  disabled={selectedBlog === 'new'}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Article Topic</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Future of AI in Web Development" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Keywords (Comma Separated)</label>
              <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. AI in web design, web development" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary SEO Target Keyword</label>
              <input type="text" value={primaryKeyword} onChange={e => setPrimaryKeyword(e.target.value)} placeholder="e.g. AI in web design" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800 placeholder-slate-400" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800">
                {configData.categories?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Author</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Publish Date</label>
                <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Featured Image Path</label>
              <input type="text" value={imagePath} onChange={e => setImagePath(e.target.value)} placeholder="e.g. assets/img/blog/new/..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800" />
            </div>

            {previewImageUrl && (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loaded Image Preview:</label>
                <img src={previewImageUrl} alt="Preview" className="w-full rounded-lg border border-slate-200 shadow-sm" />
              </div>
            )}

            <label className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={generateImage} onChange={e => setGenerateImage(e.target.checked)} className="mt-1" />
              <span className="text-xs font-bold text-slate-700 leading-tight">
                <ImageIcon size={14} className="inline mr-1 text-pink-600" />
                GENERATE AI FEATURED IMAGE USING IMAGEN 4
              </span>
            </label>
            <button 
              onClick={handleRegenerateImage}
              disabled={isGenerating}
              className="w-full py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-200 transition-colors flex items-center justify-center gap-2 mt-1 shadow-sm disabled:opacity-50"
            >
               {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Regenerate Image Only
            </button>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">URL Slug (Kebab-Case)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. future-of-ai-web-development" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-800" />
              <p className="text-[10px] text-slate-500">Auto-generated from title, but editable.</p>
            </div>

            <button 
              onClick={handleDraftAI}
              disabled={isGenerating}
              className={`w-full py-3 ${colors.bg} ${colors.hover} text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50`}
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />} Draft Article with AI
            </button>
            <div className="h-4"></div>
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
            
            <button 
              onClick={handlePublish}
              disabled={isPublishing || score < 80}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />} Verify & Publish to GitHub
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
            {activeTab === 'editor' ? (
              <div className="max-w-4xl mx-auto flex flex-col gap-6 h-full">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Generated Title (SEO Title)</label>
                  <input 
                    type="text" 
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    placeholder="Click generate to load a title..." 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 placeholder-slate-400 font-medium text-slate-800" 
                  />
                  
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 block">Meta Description</label>
                  <textarea 
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="Click generate to load a description..." 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 placeholder-slate-400 resize-y min-h-[80px] font-medium text-slate-800" 
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col min-h-[400px]">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Article HTML Body</label>
                  <textarea 
                    value={htmlBody}
                    onChange={e => setHtmlBody(e.target.value)}
                    placeholder="Write or generate content HTML here..." 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-slate-900 text-slate-300 font-mono resize-none flex-1 placeholder-slate-600 leading-relaxed" 
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
        <div className="w-[320px] flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="p-5 flex flex-col gap-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={16} className={score >= 80 ? 'text-emerald-600' : 'text-amber-500'} /> SEO Verification
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
    </div>
  );
};

export default BlogAgentEditor;
