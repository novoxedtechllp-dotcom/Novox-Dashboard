import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, Calendar, Cloud, Plus, Search,
  MoreVertical, ChevronLeft, ChevronRight, Check, X, Upload, ExternalLink, Pencil, Trash2
} from 'lucide-react';

const CATEGORY_STYLES = {
  EVENTS: { bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  ACADEMY: { bgColor: 'bg-green-100', textColor: 'text-green-700' },
  CEREMONY: { bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  DEFAULT: { bgColor: 'bg-slate-100', textColor: 'text-slate-700' }
};

const GalleryContent = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Storage
  const [storageData, setStorageData] = useState(null);
  const [storageError, setStorageError] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Modals & Actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadCategory, setUploadCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Change Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const [newBulkCategory, setNewBulkCategory] = useState('');

  // Edit Modal
  const [editImage, setEditImage] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchGalleryData();
    fetchCloudinaryUsage();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.size > 0) {
          setShowDeleteModal(true);
        } else if (previewImage) {
          setSelectedIds(new Set([previewImage.id]));
          setShowDeleteModal(true);
          setPreviewImage(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, previewImage]);

  const getAuthHeaders = () => {
    const userInfoStr = sessionStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    return userInfo?.token ? { 'Authorization': `Bearer ${userInfo.token}` } : {};
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/gallery/categories', { headers: getAuthHeaders() });
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gallery?t=${Date.now()}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const result = await response.json();
        const fetchedImages = Array.isArray(result?.data) ? result.data : [];
        setImages(fetchedImages);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCloudinaryUsage = async () => {
    try {
      const response = await fetch('/api/gallery/storage-usage', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.storage) {
          const usageBytes = data.data.storage.usage || 0;
          const limitBytes = data.data.storage.limit || (5 * 1024 * 1024 * 1024); // fallback 5GB
          
          const gb = 1024 * 1024 * 1024;
          const usedGB = (usageBytes / gb).toFixed(2);
          const limitGB = (limitBytes / gb).toFixed(2);
          const leftGB = ((limitBytes - usageBytes) / gb).toFixed(2);
          
          const usedPercent = (usageBytes / limitBytes) * 100;
          const leftPercent = 100 - usedPercent;
          
          setStorageData({ usedGB, limitGB, leftGB, leftPercent });
        } else {
          setStorageError(true);
        }
      } else {
        setStorageError(true);
      }
    } catch (error) {
      console.error('Cloudinary API Error:', error);
      setStorageError(true);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/gallery/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      
      if (response.ok) {
        setSelectedIds(new Set());
        fetchGalleryData();
        fetchCloudinaryUsage();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.message || response.statusText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      alert(`Network error deleting images: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChangeCategory = async () => {
    if (!newBulkCategory || selectedIds.size === 0) return;
    setIsChangingCategory(true);
    
    let completed = 0;
    for (const id of selectedIds) {
      try {
        await fetch(`/api/gallery/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ category_id: newBulkCategory })
        });
      } catch (err) {
        console.error('Failed to update category for', id);
      }
      completed++;
    }
    
    setIsChangingCategory(false);
    setShowCategoryModal(false);
    setNewBulkCategory('');
    setSelectedIds(new Set()); // Deselect all after bulk update
    fetchGalleryData();
  };

  const handleEditClick = (e, img) => {
    e.stopPropagation();
    setEditImage(img);
    setEditForm({ title: img.title || '', description: img.description || '' });
  };

  const handleSaveEdit = async () => {
    if (!editImage) return;
    setIsEditing(true);
    try {
      const response = await fetch(`/api/gallery/${editImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        fetchGalleryData();
        if (previewImage && previewImage.id === editImage.id) {
          setPreviewImage({ ...previewImage, ...editForm });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditing(false);
      setEditImage(null);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    let completed = 0;
    for (const file of uploadFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', file.name);
      if (uploadCategory) {
        formData.append('category_id', uploadCategory);
      }

      try {
        await fetch('/api/gallery/upload', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      } catch (err) {
        console.error('Upload failed for', file.name, err);
      }
      completed++;
      setUploadProgress(Math.round((completed / uploadFiles.length) * 100));
    }

    setIsUploading(false);
    setShowUploadModal(false);
    setUploadFiles([]);
    setUploadCategory('');
    setUploadProgress(0);
    fetchGalleryData();
    fetchCloudinaryUsage();
  };

  const removeFile = (indexToRemove) => {
    setUploadFiles(files => files.filter((_, i) => i !== indexToRemove));
  };

  // Stats calculation
  const now = new Date();
  const currentMonthImagesCount = images.filter(img => {
    if (!img.created_at) return false;
    const d = new Date(img.created_at);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthImagesCount = images.filter(img => {
    if (!img.created_at) return false;
    const d = new Date(img.created_at);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  }).length;

  let percentageChange = 0;
  if (lastMonthImagesCount === 0) {
    percentageChange = currentMonthImagesCount > 0 ? 100 : 0;
  } else {
    percentageChange = ((currentMonthImagesCount - lastMonthImagesCount) / lastMonthImagesCount) * 100;
  }
  const isIncrease = percentageChange >= 0;

  // Filtering
  const filteredImages = images.filter(img => {
    const titleStr = String(img.title || '').toLowerCase();
    const descStr = String(img.description || '').toLowerCase();
    const matchesSearch = titleStr.includes(searchQuery.toLowerCase()) || 
                          descStr.includes(searchQuery.toLowerCase());
                          
    const catName = typeof img.category === 'object' ? img.category?.name : img.category;
    const itemCat = String(catName || 'EVENTS').toUpperCase();
    const matchesCategory = selectedCategory === 'All Categories' || 
                            itemCat === selectedCategory.toUpperCase();
                            
    let matchesDate = true;
    if (selectedDate && img.created_at) {
      const d = new Date(img.created_at);
      if (!isNaN(d.getTime())) {
        const itemDateStr = d.toISOString().split('T')[0];
        matchesDate = itemDateStr === selectedDate;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleSelect = (e, id) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);

    if (e.shiftKey && lastSelectedId) {
      const lastIdx = filteredImages.findIndex(img => img.id === lastSelectedId);
      const currIdx = filteredImages.findIndex(img => img.id === id);
      
      if (lastIdx !== -1 && currIdx !== -1) {
        const start = Math.min(lastIdx, currIdx);
        const end = Math.max(lastIdx, currIdx);
        
        for (let i = start; i <= end; i++) {
          newSelected.add(filteredImages[i].id);
        }
        setSelectedIds(newSelected);
        setLastSelectedId(id);
        return;
      }
    }

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
      setLastSelectedId(id);
    }
    setSelectedIds(newSelected);
  };

  const handleImageClick = (e, img) => {
    if (selectedIds.size > 0) {
      if (selectedIds.has(img.id)) {
        // Already selected -> preview it
        setPreviewImage(img);
      } else {
        // Not selected -> select it
        e.preventDefault();
        handleSelect(e, img.id);
      }
    } else {
      // Selection mode off -> preview it
      setPreviewImage(img);
    }
  };

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredImages.length / rowsPerPage));
  const paginatedImages = filteredImages.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gallery Management</h1>
          <p className="text-slate-500 mt-1">Manage gallery images and view your gallery collection.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-[#003F87] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors font-medium"
        >
          <Plus size={18} />
          Upload Images
        </button>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-slate-800">{images.length}</div>
            <div className="text-slate-500 text-sm mt-1">All gallery images</div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <ImageIcon className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-slate-800">{currentMonthImagesCount}</div>
            <div className={`text-sm mt-1 font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
              {isIncrease ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}% from last month
            </div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Calendar className="text-purple-600" size={24} />
          </div>
        </div>

        {!storageError && storageData && (
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800">{storageData.usedGB} GB</div>
              <div className={`text-sm mt-1 font-medium ${
                storageData.leftPercent <= 10 ? 'text-red-600' : 
                storageData.leftPercent <= 25 ? 'text-orange-500' : 'text-slate-500'
              }`}>
                {storageData.leftGB}/{storageData.limitGB} GB left
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Cloud className="text-orange-500" size={24} />
            </div>
          </div>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search images by title or description..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] text-sm"
          />
        </div>
        <select 
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          className="border border-slate-300 rounded-md px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#003F87] capitalize"
        >
          <option value="All Categories">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input 
          type="date"
          value={selectedDate}
          onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
          className="border border-slate-300 rounded-md px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#003F87]"
        />
      </div>

      {/* 4. Main Image Grid */}
      <div className="flex-1 overflow-y-auto min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">Loading gallery...</div>
        ) : paginatedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24">
            {paginatedImages.map((img) => {
              const catName = typeof img.category === 'object' ? img.category?.name : img.category;
              const catKey = String(catName || 'EVENTS').toUpperCase();
              const badgeStyle = CATEGORY_STYLES[catKey] || CATEGORY_STYLES.DEFAULT;
              const isSelected = selectedIds.has(img.id);
              
              return (
                <div 
                  key={img.id} 
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative cursor-pointer select-none"
                  onClick={(e) => handleImageClick(e, img)}
                >
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={img.image_url || img.url || img.cloudinary_url} 
                      alt={img.title || 'Gallery image'} 
                      className={`w-full h-full object-cover transition-all duration-200 ${isSelected ? 'p-3 rounded-2xl' : ''}`}
                    />
                    {/* Overlays */}
                    <div className={`absolute inset-0 transition-opacity duration-200 ${isSelected ? 'bg-[#003F87]/10 opacity-100' : 'bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100'}`}></div>
                    
                    <button 
                      onClick={(e) => handleSelect(e, img.id)}
                      className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 z-10 ${
                        isSelected 
                          ? 'bg-[#003F87] border-[#003F87] scale-100' 
                          : 'bg-white/90 border-slate-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} className="text-white" />}
                    </button>
                    
                    <button 
                      onClick={(e) => handleEditClick(e, img)}
                      className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md p-1.5 hover:bg-black/30 rounded-full z-10"
                      title="Edit Details"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 text-sm truncate" title={img.title}>
                      {img.title || 'Untitled Image'}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeStyle.bgColor} ${badgeStyle.textColor}`}>
                        {catName || 'Uncategorized'}
                      </span>
                      <span className="text-[12px] text-slate-500">
                        {(() => {
                          try {
                            const d = new Date(img.created_at);
                            if (isNaN(d.getTime())) return 'Unknown Date';
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          } catch (e) {
                            return 'Unknown Date';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <ImageIcon size={48} className="text-slate-300 mb-4" />
            <p>No images found.</p>
          </div>
        )}
      </div>

      {/* 5. Bottom Action & Pagination Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[260px] bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">
            {selectedIds.size} selected
          </span>
          {selectedIds.size > 0 && (
            <>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="text-sm font-medium text-red-600 border border-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
              >
                Delete Selected
              </button>
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="text-sm font-medium text-[#003F87] border border-[#003F87] px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
              >
                Change Category
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <select 
            value={rowsPerPage} 
            onChange={handleRowsPerPageChange}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-600 focus:outline-none focus:border-[#003F87]"
          >
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
          </select>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1.5 transition-colors ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ChevronLeft size={18} />
            </button>
            
            {getPageNumbers().map((num, idx) => (
              num === '...' ? (
                <span key={`ellipsis-${idx}`} className="text-slate-400 px-1">...</span>
              ) : (
                <button 
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                    currentPage === num 
                      ? 'bg-[#003F87] text-white' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              )
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1.5 transition-colors ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Deletion</h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to delete {selectedIds.size} selected image{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Panel */}
      {previewImage && (
        <div className="fixed bottom-24 right-8 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 z-40 overflow-hidden flex flex-col transition-all">
          <div className="relative h-56 bg-slate-100 flex items-center justify-center group">
            <img 
              src={previewImage.image_url || previewImage.url || previewImage.cloudinary_url} 
              alt={previewImage.title || 'Gallery image'} 
              className="w-full h-full object-contain"
            />
            <button 
              onClick={() => {
                setEditImage(previewImage);
                setEditForm({ title: previewImage.title || '', description: previewImage.description || '' });
              }}
              className="absolute top-2 right-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
              title="Edit Details"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => {
                setSelectedIds(new Set([previewImage.id]));
                setShowDeleteModal(true);
                setPreviewImage(null);
              }}
              className="absolute top-2 right-18 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"
              style={{ right: '4.5rem' }}
              title="Delete Image"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={16} />
            </button>
            <a 
              href={previewImage.image_url || previewImage.url || previewImage.cloudinary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div>
              <h4 className="font-semibold text-slate-800 text-base break-words select-text">
                {previewImage.title || 'Untitled Image'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 select-text">
                {(() => {
                  try {
                    const d = new Date(previewImage.created_at);
                    if (isNaN(d.getTime())) return 'Unknown Date';
                    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  } catch (e) {
                    return 'Unknown Date';
                  }
                })()}
              </p>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</span>
              <span className="text-sm text-slate-700 select-text">
                {(typeof previewImage.category === 'object' ? previewImage.category?.name : previewImage.category) || 'Uncategorized'}
              </span>
            </div>

            {previewImage.description && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</span>
                <p className="text-sm text-slate-700 break-words select-text">{previewImage.description}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">File ID</span>
              <code className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded break-all select-all">
                {previewImage.id}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {editImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Image Details</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#003F87]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#003F87] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setEditImage(null)}
                disabled={isEditing}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isEditing}
                className="px-4 py-2 text-sm font-medium text-white bg-[#003F87] hover:bg-blue-800 rounded transition-colors disabled:opacity-50"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Category Bulk Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Change Category</h3>
            <p className="text-slate-600 text-sm mb-4">
              Select a new category for the {selectedIds.size} selected image{selectedIds.size > 1 ? 's' : ''}.
            </p>
            
            <select 
              value={newBulkCategory}
              onChange={(e) => setNewBulkCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#003F87] mb-6"
            >
              <option value="" disabled>Select new category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCategoryModal(false)}
                disabled={isChangingCategory}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleChangeCategory}
                disabled={isChangingCategory || !newBulkCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-[#003F87] hover:bg-blue-800 rounded transition-colors disabled:opacity-50"
              >
                {isChangingCategory ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Upload Images</h3>
              <button 
                onClick={() => !isUploading && setShowUploadModal(false)} 
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category (Optional)
                </label>
                <select 
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  disabled={isUploading}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#003F87]"
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">This category will be applied to all uploaded images.</p>
              </div>

              {/* File input / drag drop area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  uploadFiles.length > 0 ? 'border-[#003F87] bg-blue-50/50' : 'border-slate-300 hover:border-[#003F87]'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <Upload className="mx-auto text-[#003F87] mb-2" size={32} />
                <p className="text-sm font-medium text-slate-700">Click to select files from your computer</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP up to 10MB</p>
              </div>

              {/* Selected Files Preview */}
              {uploadFiles.length > 0 && (
                <div className="bg-slate-50 rounded p-3 max-h-40 overflow-y-auto">
                  <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">{uploadFiles.length} files selected</h4>
                  <ul className="space-y-2">
                    {uploadFiles.map((f, i) => (
                      <li key={i} className="flex justify-between items-center text-sm text-slate-700">
                        <span className="truncate max-w-[250px]">{f.name}</span>
                        {!isUploading && (
                          <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                            <X size={16} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#003F87] h-2 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading || uploadFiles.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#003F87] hover:bg-blue-800 rounded transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryContent;
