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
  avatar: avatar || employee.avatar_url || null
});

const EmployeesContent = ({ employees = [], setEmployees }) => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

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
      }
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name) return;

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
          avatar_url: newEmployee.avatarUrl?.startsWith('http') ? newEmployee.avatarUrl : null
        };
        if (newEmployee.email) payload.email = newEmployee.email;
        if (newEmployee.password) payload.password = newEmployee.password;

        const response = await fetch('/api/v1/employees', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      const resData = await parseApiResponse(response);
      const addedEmployee = mapEmployeeFromApi(resData.data, newEmployee.avatarUrl || null);

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
    if(!window.confirm("Are you sure you want to grant Admin privileges to this user?")) return;
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`/api/v1/employees/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ grant_admin: true })
      });
      await parseApiResponse(response);

      alert('Admin privileges granted successfully!');
    } catch (error) {
      console.error('Error granting admin:', error);
      alert(error.message || 'Failed to grant admin privileges');
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 relative group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-slate-100/60 shadow-sm cursor-pointer">
            
            {/* Action Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 bg-white/90 backdrop-blur-sm pl-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleGrantAdmin(emp.id); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Grant Admin Access"
              >
                <Shield size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setEmployeeToEdit(emp); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit Employee"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp.id); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Employee"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                {emp.avatar ? (
                  <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-slate-300" />
                )}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full shadow-sm ${getStatusDotColor(emp.status)}`}></div>
            </div>
            
            {/* Details */}
            <div className="flex flex-col flex-1 min-w-0 pr-16">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[15px] font-bold text-slate-800 leading-tight truncate">{emp.name}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getStatusColor(emp.status)}`}>
                  {emp.status}
                </span>
              </div>
              <div className="text-[12px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                <Briefcase size={12} className="text-slate-400" /> {emp.department}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 truncate mt-1 flex items-center gap-1.5">
                <Phone size={10} /> {emp.phone} • EID: {emp.eid}
              </div>
            </div>
            
          </div>
        ))}

        {/* Add Employee Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group min-h-[80px]"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#003F87] group-hover:text-white transition-all duration-300 border border-slate-100">
            <Plus size={20} />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-[14px] font-bold text-slate-700 mb-0.5">Add New Employee</h3>
            <p className="text-[11px] font-medium text-slate-500">Click to onboard a new member</p>
          </div>
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
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email <span className="text-slate-300 normal-case font-normal">(optional)</span></label>
                  <input 
                    type="email" value={newEmployee.email}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number *</label>
                  <input 
                    type="text" required value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
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

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-[#003F87] text-white rounded-xl text-sm font-bold hover:bg-[#002B5E] shadow-md shadow-blue-900/10 transition-all active:scale-95">Add Employee</button>
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
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
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
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
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
            <h3 className="text-xl font-black text-slate-900">Delete Employee?</h3>
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
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-md shadow-rose-900/10 transition-all active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesContent;
