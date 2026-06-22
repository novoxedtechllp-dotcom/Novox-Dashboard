import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, Shield, X, Check, Activity, Settings } from 'lucide-react';

const AdminsContent = () => {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    status: 'ACTIVE'
  });

  const getAuthToken = () => {
    const userInfoStr = sessionStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        return userInfo.token;
      } catch (e) {
        console.error('Failed to parse userInfo from sessionStorage', e);
      }
    }
    return null;
  };

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to fetch admins');
      
      const adminUsers = resData.data.filter(user => user.role === 'ADMIN');
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        email: newAdmin.email,
        password: newAdmin.password,
        role: 'ADMIN',
        status: newAdmin.status
      };

      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to add admin');

      setAdmins([resData.data, ...admins]);
      setIsModalOpen(false);
      setNewAdmin({ email: '', password: '', status: 'ACTIVE' });
      alert('Admin added successfully!');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error.message || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        email: employeeToEdit.email,
        status: employeeToEdit.status,
      };

      const response = await fetch(`/api/v1/users/${employeeToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to update admin');

      setAdmins(admins.map(admin => admin.id === employeeToEdit.id ? { ...admin, ...resData.data } : admin));
      setEmployeeToEdit(null);
      alert('Admin updated successfully!');
    } catch (error) {
      console.error('Error updating admin:', error);
      alert(error.message || 'Failed to update admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to delete admin');

      setAdmins(admins.filter(admin => admin.id !== id));
      alert('Admin deleted permanently!');
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error.message || 'Failed to delete admin');
    } finally {
      setIsDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  const filteredAdmins = useMemo(() => {
    if (!searchQuery) return admins;
    return admins.filter(admin => 
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [admins, searchQuery]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">System Admins</h1>
        <p className="text-slate-500 mt-1">Manage system administrator access and credentials.</p>
      </div>

      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#003F87] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search admins by email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all text-sm bg-slate-50/50 focus:bg-white"
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#003F87] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#002B5E] shadow-md shadow-blue-900/10 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} /> Add Admin
        </button>
      </div>

      {/* Grid view */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003F87]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group h-full min-h-[220px] rounded-[24px] border-2 border-dashed border-slate-200 hover:border-[#003F87] bg-slate-50/50 hover:bg-[#003F87]/5 flex flex-col items-center justify-center text-center transition-all duration-300 active:scale-95 p-6"
          >
            <div className="w-14 h-14 rounded-[16px] bg-white shadow-sm text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#003F87] group-hover:text-white transition-all duration-300 border border-slate-100">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">Add New Admin</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">Click here to provision a new system administrator.</p>
          </button>

          {filteredAdmins.map(admin => (
            <div key={admin.id} className="group bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => setEmployeeToEdit(admin)} className="w-8 h-8 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => setEmployeeToDelete(admin)} className="w-8 h-8 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-5 mt-2">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-[#003F87] mb-4 shadow-inner">
                  <Shield size={32} />
                </div>
                <h3 className="text-[17px] font-black text-slate-800 mb-1 line-clamp-1">{admin.email}</h3>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  admin.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                  'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {admin.status}
                </span>
              </div>

              <div className="mt-auto pt-5 border-t border-slate-100 grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Activity size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</span>
                    <span className="text-[13px] font-semibold text-slate-700">{admin.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-slate-800">Add New Admin</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">EMAIL ADDRESS <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required 
                    value={newAdmin.email} 
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                    placeholder="admin@novox.local"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">PASSWORD <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={newAdmin.password} 
                    onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                    placeholder="Secure password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all font-medium text-slate-800"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">STATUS</label>
                  <select 
                    value={newAdmin.status} 
                    onChange={e => setNewAdmin({...newAdmin, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all font-medium text-slate-800"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" className={`px-6 py-2 bg-[#003F87] text-white rounded-lg text-sm font-bold shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002B5E]'}`} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {employeeToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEmployeeToEdit(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-slate-800">Edit Admin</h2>
              <button onClick={() => setEmployeeToEdit(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    required 
                    value={employeeToEdit.email} 
                    onChange={e => setEmployeeToEdit({...employeeToEdit, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">STATUS</label>
                  <select 
                    value={employeeToEdit.status || 'ACTIVE'} 
                    onChange={e => setEmployeeToEdit({...employeeToEdit, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] transition-all font-medium text-slate-800"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEmployeeToEdit(null)} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" className={`px-6 py-2 bg-[#003F87] text-white rounded-lg text-sm font-bold shadow-md ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002B5E]'}`} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setEmployeeToDelete(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Delete Admin?
            </h3>
            <p className="text-slate-500 font-medium text-sm mt-2">
              This action cannot be undone. All access for <strong>{employeeToDelete.email}</strong> will be permanently removed.
            </p>
            <div className="flex w-full gap-3 mt-6">
              <button 
                onClick={() => setEmployeeToDelete(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteAdmin(employeeToDelete.id)}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsContent;
