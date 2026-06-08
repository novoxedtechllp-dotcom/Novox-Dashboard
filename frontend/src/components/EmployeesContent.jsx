import { useState, useMemo } from 'react';
import { Briefcase, Phone, Plus, X, Upload, User, Trash2, Pencil, CheckCircle, Shield } from 'lucide-react';

const getAuthHeaders = () => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  if (!userInfo?.token) return null;

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userInfo.token}`
  };
};

const parseApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Employee request failed');
  return data;
};

const statusToApi = (status) => {
  if (status === 'On Leave') return 'ON_LEAVE';
  if (status === 'Terminated') return 'TERMINATED';
  return 'ACTIVE';
};

const statusFromApi = (status) => {
  if (status === 'ON_LEAVE') return 'On Leave';
  if (status === 'TERMINATED') return 'Terminated';
  return 'Active';
};

const departmentToApi = (department) => {
  if (department === 'Development') return 'DEVELOPMENT';
  return department.toUpperCase();
};

const departmentFromApi = (department) => {
  if (department === 'DEVELOPMENT') return 'Development';
  if (department === 'HR') return 'HR';
  return department ? department.charAt(0) + department.slice(1).toLowerCase() : 'Development';
};

const splitName = (name) => {
  const parts = name.trim().split(/\s+/);
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ') || parts[0] || ''
  };
};

const mapEmployeeFromApi = (employee, avatar = null) => ({
  id: employee.id,
  eid: employee.employee_code || `EMP-${String(employee.id).slice(0, 4)}`,
  name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
  department: departmentFromApi(employee.employee_roles?.role_name || employee.department || employee.employee_role || employee.designation),
  phone: employee.phone || '',
  status: statusFromApi(employee.status),
  joinDate: employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '',
  avatar: avatar || employee.avatar_url || null,
  systemRole: employee.users?.role || 'EMPLOYEE'
});

const EmployeesContent = ({ employees = [], setEmployees }) => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToMakeAdmin, setEmployeeToMakeAdmin] = useState(null);
  
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('Active');

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Development',
    phone: '',
    status: 'Active',
    joinDate: 'January 2024',
    avatarUrl: null
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewEmployee({ ...newEmployee, avatarUrl: previewUrl });
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const headers = getAuthHeaders();
        delete headers['Content-Type']; // Let browser set boundary
        
        const response = await fetch('/api/v1/upload', {
          method: 'POST',
          headers,
          body: formData
        });
        const resData = await response.json();
        if (response.ok && resData.data?.url) {
          setNewEmployee(prev => ({ ...prev, avatarUrl: resData.data.url }));
        }
      } catch (err) {
        console.error('Upload failed', err);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (isUploading) {
      alert('Please wait for the image to finish uploading before saving.');
      return;
    }
    if (!newEmployee.name || !newEmployee.email || !newEmployee.phone) {
      alert("Name, email, and phone number are mandatory for enrolling an employee.");
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      const { first_name, last_name } = splitName(newEmployee.name);

      const payload = {
          first_name,
          last_name,
          phone: newEmployee.phone,
          employee_role: departmentToApi(newEmployee.department),
          designation: newEmployee.department,
          status: statusToApi(newEmployee.status),
          avatar_url: (newEmployee.avatarUrl && !newEmployee.avatarUrl.startsWith('blob:')) ? newEmployee.avatarUrl : null
        };
        if (newEmployee.email) payload.email = newEmployee.email;
        if (newEmployee.password) payload.password = newEmployee.password;

        const response = await fetch('/api/v1/employees', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      const resData = await parseApiResponse(response);
      const addedEmployee = mapEmployeeFromApi(resData.data, resData.data?.avatar_url || resData.data?.avatar || newEmployee.avatarUrl || null);

      setEmployees([addedEmployee, ...employees]);
      setIsModalOpen(false);
      setNewEmployee({ name: '', email: '', password: '', department: 'Development', phone: '', status: 'Active', joinDate: 'January 2024', avatarUrl: null });
      alert('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.message || 'Failed to add employee');
    }
  };

  const handleGrantAdmin = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const employee = employees.find(emp => emp.id === id);
      const isCurrentlyAdmin = employee?.systemRole === 'ADMIN';

      const response = await fetch(`/api/v1/employees/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ grant_admin: !isCurrentlyAdmin })
      });
      await parseApiResponse(response);

      setEmployees(employees.map(emp => emp.id === id ? { ...emp, systemRole: isCurrentlyAdmin ? 'EMPLOYEE' : 'ADMIN' } : emp));
      setEmployeeToMakeAdmin(null);
      alert(`Admin privileges ${isCurrentlyAdmin ? 'revoked' : 'granted'} successfully!`);
    } catch (error) {
      console.error('Error toggling admin:', error);
      alert(error.message || 'Failed to toggle admin privileges');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/employees/${id}`, {
        method: 'DELETE',
        headers
      });
      await parseApiResponse(response);

      setEmployees(employees.filter(emp => emp.id !== id));
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error.message || 'Failed to delete employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      const { first_name, last_name } = splitName(employeeToEdit.name);

      const response = await fetch(`/api/v1/employees/${employeeToEdit.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          first_name,
          last_name,
          phone: employeeToEdit.phone,
          department: departmentToApi(employeeToEdit.department),
          designation: employeeToEdit.department,
          status: statusToApi(employeeToEdit.status)
        })
      });
      const resData = await parseApiResponse(response);
      const updatedEmployee = mapEmployeeFromApi(resData.data, employeeToEdit.avatar || null);

      setEmployees(employees.map(emp => emp.id === employeeToEdit.id ? updatedEmployee : emp));
      setEmployeeToEdit(null);
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert(error.message || 'Failed to update employee');
    }
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    if (deptFilter !== 'All Departments') {
      filtered = filtered.filter(emp => emp.department === deptFilter);
    }
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }
    return filtered;
  }, [employees, deptFilter, statusFilter]);

  const uniqueDepts = ['All Departments', 'Development', 'Marketing', 'Sales', 'HR'];
  const uniqueStatuses = ['All Statuses', 'Active', 'On Leave', 'Terminated'];

  const getStatusColor = (status) => {
    if(status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if(status === 'On Leave') return 'bg-amber-50 text-amber-700 border-amber-200';
    if(status === 'Terminated') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusDotColor = (status) => {
    if(status === 'Active') return 'bg-emerald-500';
    if(status === 'On Leave') return 'bg-amber-500';
    if(status === 'Terminated') return 'bg-rose-500';
    return 'bg-slate-400';
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full relative bg-[#FAFBFC] min-h-full">
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle size={18} className="text-green-400" />}
          {toast.message}
        </div>
      )}

      {/* Top Header / Actions Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:border-blue-300 transition-colors">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-3 shrink-0">Department</span>
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none appearance-none pr-8 cursor-pointer relative w-full sm:w-auto"
              style={{ background: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="%2364748B" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>') no-repeat right center / 16px` }}
            >
              {uniqueDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:border-blue-300 transition-colors">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-3 shrink-0">Status</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none appearance-none pr-8 cursor-pointer relative w-full sm:w-auto"
              style={{ background: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="%2364748B" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>') no-repeat right center / 16px` }}
            >
              {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#003F87] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#002B5E] shadow-md shadow-blue-900/10 transition-all active:scale-95"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white rounded-[24px] border border-slate-100/60 flex flex-col relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden">
            
            {/* Main Content Area */}
            <div className="p-6 relative">
              {/* Floating Status Badge */}
              <div className={`absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(emp.status)}`}>
                {emp.status}
              </div>

              {/* Profile Header */}
              <div className="flex flex-col mb-2">
                <div className="relative w-16 h-16 mb-4">
                  <div className="w-full h-full rounded-[16px] overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
                    {emp.avatar ? (
                      <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-slate-300" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-white rounded-full shadow-sm ${getStatusDotColor(emp.status)}`}></div>
                </div>
                
                <div className="flex items-center gap-2 mb-1.5 mt-1">
                  <span className="inline-flex items-center justify-center whitespace-nowrap shrink-0 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    {emp.eid}
                  </span>
                  {emp.systemRole === 'ADMIN' && (
                    <span className="inline-flex items-center justify-center whitespace-nowrap shrink-0 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md gap-1">
                      <Shield size={10} /> Admin
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-black text-slate-800 leading-tight tracking-tight truncate pr-2 mb-1">{emp.name}</h3>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Briefcase size={14} className="text-slate-400" /> <span className="truncate">{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Phone size={14} className="text-slate-400" /> <span className="truncate">{emp.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-slate-50/50 mt-auto flex items-center gap-2 border-t border-slate-50">
              {emp.systemRole === 'ADMIN' ? (
                <button 
                  onClick={() => setEmployeeToMakeAdmin(emp.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-3 rounded-[12px] transition-all"
                >
                  <Shield size={14} /> Ungrant
                </button>
              ) : (
                <button 
                  onClick={() => setEmployeeToMakeAdmin(emp.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-3 rounded-[12px] transition-all"
                >
                  <Shield size={14} /> Grant
                </button>
              )}
              
              <button 
                onClick={() => setEmployeeToEdit(emp)}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-3 rounded-[12px] transition-all"
              >
                <Pencil size={14} /> Edit
              </button>
              
              <button 
                onClick={() => setEmployeeToDelete(emp.id)}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-3 rounded-[12px] transition-all"
              >
                <Trash2 size={14} /> Terminate
              </button>
            </div>

          </div>
        ))}

        {/* Add Employee Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-transparent rounded-[24px] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group min-h-[260px]"
        >
          <div className="w-14 h-14 rounded-[16px] bg-white shadow-sm text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#003F87] group-hover:text-white transition-all duration-300 border border-slate-100">
            <Plus size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">Add Employee</h3>
          <p className="text-xs font-medium text-slate-500">Onboard a new team member.</p>
        </button>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-slate-800">Add New Employee</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group cursor-pointer">
                  {newEmployee.avatarUrl ? (
                    <img src={newEmployee.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Profile Photo</h4>
                  <p className="text-xs font-medium text-slate-500 mb-3">Upload a square image (JPG, PNG).</p>
                  <label className="cursor-pointer bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl inline-flex items-center gap-2 transition-colors shadow-sm">
                    <Upload size={14} /> Browse Files
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
                <input 
                  type="text" required value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email *</label>
                  <input 
                    type="email" required value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password <span className="text-slate-300 normal-case font-normal">(optional)</span></label>
                  <input 
                    type="text" value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    placeholder="Auto-generated"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Department</label>
                  <div className="relative">
                    <select 
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                    >
                      {uniqueDepts.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number *</label>
                  <input 
                    type="tel" maxLength={10} required value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                  <div className="relative">
                    <select 
                      value={newEmployee.status}
                      onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className={`px-6 py-2 bg-[#003F87] text-white rounded-lg text-sm font-bold shadow-md ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002B5E]'}`} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {employeeToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-slate-800">Edit Employee</h2>
              <button onClick={() => setEmployeeToEdit(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEmployee} className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name *</label>
                <input 
                  type="text" required value={employeeToEdit.name}
                  onChange={(e) => setEmployeeToEdit({...employeeToEdit, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Department</label>
                <div className="relative">
                  <select 
                    value={employeeToEdit.department}
                    onChange={(e) => setEmployeeToEdit({...employeeToEdit, department: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                  >
                    {uniqueDepts.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number *</label>
                  <input 
                    type="text" required value={employeeToEdit.phone}
                    onChange={(e) => setEmployeeToEdit({...employeeToEdit, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                  <div className="relative">
                    <select 
                      value={employeeToEdit.status}
                      onChange={(e) => setEmployeeToEdit({...employeeToEdit, status: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setEmployeeToEdit(null)} className="w-full sm:w-auto px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-[#003F87] text-white rounded-xl text-sm font-bold hover:bg-[#002B5E] shadow-md shadow-blue-900/10 transition-all active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-5 text-center items-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Terminate Employee?</h3>
            <p className="text-slate-500 font-medium text-sm">This action cannot be undone. All data associated with this employee will be permanently removed.</p>
            <div className="flex w-full gap-3 mt-4">
              <button 
                onClick={() => setEmployeeToDelete(null)} 
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleDeleteEmployee(employeeToDelete); setEmployeeToDelete(null); }} 
                className="flex-1 py-3 bg-rose-600 rounded-xl text-sm font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-900/10 transition-colors"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Admin Confirmation Modal */}
      {employeeToMakeAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
          {employees.find(e => e.id === employeeToMakeAdmin)?.systemRole === 'ADMIN' ? (
            <>
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-black text-center text-slate-800 mb-2 tracking-tight">Revoke Admin Privileges?</h2>
              <p className="text-center text-slate-500 font-medium mb-8 text-sm px-4">
                This employee will lose access to system settings and user management.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-black text-center text-slate-800 mb-2 tracking-tight">Grant Admin Privileges?</h2>
              <p className="text-center text-slate-500 font-medium mb-8 text-sm px-4">
                This employee will have full access to the dashboard, including user management and system settings.
              </p>
            </>
          )}
          
          <div className="flex gap-4">
            <button 
              onClick={() => setEmployeeToMakeAdmin(null)}
              className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleGrantAdmin(employeeToMakeAdmin)}
              className={`flex-1 px-6 py-3.5 text-white rounded-xl font-bold shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${
                employees.find(e => e.id === employeeToMakeAdmin)?.systemRole === 'ADMIN' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
              }`}
            >
              <Shield size={16} /> Confirm
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesContent;
