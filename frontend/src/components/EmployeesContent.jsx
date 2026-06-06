import { useState, useMemo } from 'react';
import { Briefcase, Phone, Plus, X, Upload, User, Trash2, Pencil } from 'lucide-react';

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
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.message || 'Failed to add employee');
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
    } catch (error) {
      console.error('Error updating employee:', error);
      alert(error.message || 'Failed to update employee');
    }
  };

  const filteredEmployees = useMemo(() => {
    if (deptFilter === 'All Departments') return employees;
    return employees.filter(emp => emp.department === deptFilter);
  }, [employees, deptFilter]);

  const uniqueDepts = ['All Departments', 'Development', 'Marketing', 'Sales', 'HR'];

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-sm transform transition-all duration-300 translate-y-0 opacity-100 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      {/* Top Filter Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col sm:flex-row gap-[24px] h-auto sm:h-[108px] items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-[24px] w-full sm:w-auto flex-1">
          <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
            <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Department</label>
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none"
            >
              {uniqueDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>
        <div className="shrink-0 mt-4 sm:mt-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003F87] text-white px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-[8px] hover:bg-[#002B5E] transition-colors"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px] relative group hover:border-[#003F87] transition-colors">
            
            <div className="absolute top-[16px] right-[16px] flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => { e.stopPropagation(); setEmployeeToEdit(emp); }}
                className="text-slate-400 hover:text-[#003F87]"
                title="Edit Employee"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp.id); }}
                className="text-slate-400 hover:text-[#D80000]"
                title="Delete Employee"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-auto">
              <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                {emp.avatar ? (
                  <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-slate-400" />
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-[2px] border-white rounded-full ${emp.status === 'Active' ? 'bg-[#008A2E]' : emp.status === 'On Leave' ? 'bg-[#B26E00]' : 'bg-red-500'}`}></div>
              </div>
              <div>
                <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">EID: {emp.eid}</span>
                <h3 className="text-[16px] font-bold text-slate-900 leading-tight">{emp.name}</h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 mb-4">
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <Briefcase size={14} /> {emp.department}
              </div>
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <Phone size={14} /> {emp.phone}
              </div>
            </div>
            
            <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-semibold text-[#555F6B]">
                  Status: <span className={`font-bold ${emp.status === 'Active' ? 'text-[#008A2E]' : 'text-[#B26E00]'}`}>{emp.status}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#555F6B]">
                  Joined: <span className="text-[#003F87] font-bold">{emp.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Employee Card */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-[8px] border border-dashed border-[#C2C6D4] p-[24px] flex flex-col items-center justify-center h-[247px] cursor-pointer hover:bg-slate-50 transition-colors text-center"
        >
          <div className="w-[40px] h-[40px] rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#555F6B] mb-3">
            <Plus size={20} />
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Add New Employee</h3>
          <p className="text-[11px] text-[#555F6B] mt-1 max-w-[180px]">Onboard a new team member</p>
        </div>
      </div>

      <div className="w-full flex justify-between items-center pt-[8px]">
        <div className="text-[13px] text-[#555F6B] font-medium">Showing all {filteredEmployees.length} employees</div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Add New Employee</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-[64px] h-[64px] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {newEmployee.avatarUrl ? (
                    <img src={newEmployee.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Profile Picture</label>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded inline-flex items-center gap-2 transition-colors border border-slate-200">
                    <Upload size={14} /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" required value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <input 
                    type="email" value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    placeholder="employee@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Password <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <input 
                    type="text" value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Department</label>
                <select 
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  {uniqueDepts.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="text" required value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Status</label>
                  <select 
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {employeeToEdit && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Edit Employee</h2>
              <button onClick={() => setEmployeeToEdit(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEmployee} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" required value={employeeToEdit.name}
                  onChange={(e) => setEmployeeToEdit({...employeeToEdit, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Department</label>
                <select 
                  value={employeeToEdit.department}
                  onChange={(e) => setEmployeeToEdit({...employeeToEdit, department: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  {uniqueDepts.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="text" required value={employeeToEdit.phone}
                    onChange={(e) => setEmployeeToEdit({...employeeToEdit, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Status</label>
                  <select 
                    value={employeeToEdit.status}
                    onChange={(e) => setEmployeeToEdit({...employeeToEdit, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setEmployeeToEdit(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600">Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => setEmployeeToDelete(null)} 
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleDeleteEmployee(employeeToDelete); setEmployeeToDelete(null); }} 
                className="px-4 py-2 bg-[#D80000] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesContent;
