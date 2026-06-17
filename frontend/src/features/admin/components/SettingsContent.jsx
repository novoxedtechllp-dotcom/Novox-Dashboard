import React, { useState, useMemo, useEffect } from 'react';
import apiClient from '../../../lib/apiClient';
import { 
  CheckCircle, 
  Plus, 
  RotateCcw, 
  UserPlus, 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  CreditCard, 
  MessageSquare, 
  Handshake, 
  Filter,
  Calendar,
  Image,
  FileText,
  Bot 
} from 'lucide-react';



const initialPermissions = {
  'super-admin': {
    students: { view: true, create: true, edit: true, delete: true, export: true },
    employees: { view: true, create: true, edit: true, delete: true, export: true },
    courses: { view: true, create: true, edit: true, delete: true, export: true },
    fees: { view: true, create: true, edit: true, delete: true, export: true },
    whatsapp: { view: true, create: true, edit: true, delete: true, export: true },
    sales: { view: true, create: true, edit: true, delete: true, export: true },
  },
  design: {
    students: { view: true, create: false, edit: false, delete: false, export: false },
    employees: { view: true, create: false, edit: false, delete: false, export: false },
    courses: { view: true, create: true, edit: true, delete: false, export: false },
    fees: { view: false, create: false, edit: false, delete: false, export: false },
    whatsapp: { view: false, create: false, edit: false, delete: false, export: false },
    sales: { view: false, create: false, edit: false, delete: false, export: false },
  },
  development: {
    students: { view: true, create: true, edit: true, delete: false, export: true },
    employees: { view: true, create: false, edit: false, delete: false, export: false },
    courses: { view: true, create: true, edit: true, delete: true, export: true },
    fees: { view: false, create: false, edit: false, delete: false, export: false },
    whatsapp: { view: true, create: true, edit: true, delete: false, export: false },
    sales: { view: false, create: false, edit: false, delete: false, export: false },
  },
  sales: {
    students: { view: true, create: true, edit: true, delete: false, export: true },
    employees: { view: false, create: false, edit: false, delete: false, export: false },
    courses: { view: true, create: false, edit: false, delete: false, export: false },
    fees: { view: true, create: true, edit: true, delete: false, export: true },
    whatsapp: { view: true, create: true, edit: true, delete: false, export: true },
    sales: { view: true, create: true, edit: true, delete: true, export: true },
  },
  marketing: {
    students: { view: true, create: false, edit: false, delete: false, export: false },
    employees: { view: false, create: false, edit: false, delete: false, export: false },
    courses: { view: true, create: false, edit: false, delete: false, export: false },
    fees: { view: false, create: false, edit: false, delete: false, export: false },
    whatsapp: { view: true, create: true, edit: true, delete: true, export: true },
    sales: { view: true, create: true, edit: true, delete: false, export: true },
  },
  hr: {
    students: { view: true, create: true, edit: true, delete: true, export: true },
    employees: { view: true, create: true, edit: true, delete: true, export: true },
    courses: { view: true, create: true, edit: true, delete: false, export: true },
    fees: { view: true, create: true, edit: true, delete: false, export: true },
    whatsapp: { view: true, create: false, edit: false, delete: false, export: false },
    sales: { view: false, create: false, edit: false, delete: false, export: false },
  },
  accountant: {
    students: { view: true, create: false, edit: false, delete: false, export: true },
    employees: { view: true, create: false, edit: false, delete: false, export: true },
    courses: { view: true, create: false, edit: false, delete: false, export: false },
    fees: { view: true, create: true, edit: true, delete: true, export: true },
    whatsapp: { view: false, create: false, edit: false, delete: false, export: false },
    sales: { view: false, create: false, edit: false, delete: false, export: false },
  }
};

const initialStaff = {
  'super-admin': [],
  design: [],
  development: [],
  sales: [],
  marketing: [],
  hr: [],
  accountant: []
};

const SettingsContent = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('Permissions saved successfully.');

  // Roles & Permissions state
  const [roles, setRoles] = useState([{ id: 'super-admin', name: 'Super Admin', desc: 'Full system access' }]);
  const [selectedRoleId, setSelectedRoleId] = useState('super-admin');
  const [permissions, setPermissions] = useState({});
  const [staff, setStaff] = useState({});
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [assignFilter, setAssignFilter] = useState('all');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get('/roles');
        if (data?.data) {
          const fetchedRoles = data.data.roles.map(r => ({
            id: r.id,
            name: r.role_name,
            desc: r.description || 'Role'
          }));
          
          const fetchedPerms = {};
          data.data.roles.forEach(r => {
            fetchedPerms[r.id] = r.permissions || {};
          });

          // Add super admin locally
          fetchedRoles.unshift({ id: 'super-admin', name: 'Super Admin', desc: 'Full system access' });
          
          // Full access for super-admin
          fetchedPerms['super-admin'] = {
            students: { view: true, create: true, edit: true, delete: true, export: true },
            employees: { view: true, create: true, edit: true, delete: true, export: true },
            courses: { view: true, create: true, edit: true, delete: true, export: true },
            fees: { view: true, create: true, edit: true, delete: true, export: true },
            sales: { view: true, create: true, edit: true, delete: true, export: true },
            attendance: { view: true, create: true, edit: true, delete: true, export: true },
            gallery: { view: true, create: true, edit: true, delete: true, export: true },
            leave: { view: true, create: true, edit: true, delete: true, export: true },
            'work-reports': { view: true, create: true, edit: true, delete: true, export: true },
            'blog-agent': { view: true, create: true, edit: true, delete: true, export: true }
          };

          setRoles(fetchedRoles);
          setPermissions(fetchedPerms);

          // Map staff
          const staffMap = { 'super-admin': [] };
          data.data.roles.forEach(r => staffMap[r.id] = []);
          
          if (data.data.staff) {
            data.data.staff.forEach(s => {
              if (s.role_id && staffMap[s.role_id]) {
                staffMap[s.role_id].push({
                  name: `${s.first_name} ${s.last_name}`,
                  role: s.designation,
                  avatar: s.avatar_url || `${s.first_name[0]}${s.last_name[0]}`
                });
              }
            });
          }
          setStaff(staffMap);
        }
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    fetchRoles();
  }, []);


  const filteredStaffList = useMemo(() => {
    const list = staff[selectedRoleId] || [];
    if (assignFilter === 'all') return list;
    return list.filter(member => 
      member.role.toLowerCase().includes(assignFilter.toLowerCase()) || 
      selectedRoleId === assignFilter
    );
  }, [staff, selectedRoleId, assignFilter]);

  const handleCreateRoleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleName) return;
    const roleId = newRoleName.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (roles.some(r => r.id === roleId)) {
      setToastText(`Role '${newRoleName}' already exists!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setRoles(prev => [...prev, { id: roleId, name: newRoleName, desc: newRoleDesc || `${newRoleName} Role` }]);
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        students: { view: false, create: false, edit: false, delete: false, export: false },
        employees: { view: false, create: false, edit: false, delete: false, export: false },
        courses: { view: false, create: false, edit: false, delete: false, export: false },
        fees: { view: false, create: false, edit: false, delete: false, export: false },
        whatsapp: { view: false, create: false, edit: false, delete: false, export: false },
        sales: { view: false, create: false, edit: false, delete: false, export: false }
      }
    }));
    setStaff(prev => ({ ...prev, [roleId]: [] }));
    setSelectedRoleId(roleId);

    setIsCreateRoleOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setToastText(`Role '${newRoleName}' created successfully!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePermissionsSave = () => {
    setToastText('Permissions saved successfully.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetPermissions = () => {
    setPermissions(prev => {
      const reset = { ...initialPermissions };
      roles.forEach(role => {
        if (!reset[role.id]) {
          reset[role.id] = {
            students: { view: false, create: false, edit: false, delete: false, export: false },
            employees: { view: false, create: false, edit: false, delete: false, export: false },
            courses: { view: false, create: false, edit: false, delete: false, export: false },
            fees: { view: false, create: false, edit: false, delete: false, export: false },
            whatsapp: { view: false, create: false, edit: false, delete: false, export: false },
            sales: { view: false, create: false, edit: false, delete: false, export: false }
          };
        }
      });
      return reset;
    });
    setToastText('Permissions reset to defaults.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const togglePermission = (moduleKey, permType) => {
    setPermissions(prev => {
      const rolePerms = { ...(prev[selectedRoleId] || {}) };
      const modulePerms = { ...(rolePerms[moduleKey] || { view: false, create: false, edit: false, delete: false, export: false }) };
      modulePerms[permType] = !modulePerms[permType];
      rolePerms[moduleKey] = modulePerms;
      return {
        ...prev,
        [selectedRoleId]: rolePerms
      };
    });
  };

  const toggleSelectAllView = () => {
    setPermissions(prev => {
      const rolePerms = { ...(prev[selectedRoleId] || {}) };
      const allViewSelected = Object.keys(rolePerms).length > 0 && Object.keys(rolePerms).every(k => rolePerms[k]?.view);
      
      const newRolePerms = {};
      Object.keys(rolePerms).forEach(k => {
        newRolePerms[k] = {
          ...rolePerms[k],
          view: !allViewSelected
        };
      });

      return {
        ...prev,
        [selectedRoleId]: newRolePerms
      };
    });
  };

  const isAllViewChecked = useMemo(() => {
    const rolePerms = permissions[selectedRoleId];
    if (!rolePerms) return false;
    return Object.keys(rolePerms).every(k => rolePerms[k]?.view);
  }, [permissions, selectedRoleId]);

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffRole) return;
    
    const initials = newStaffName.split(' ').map(n => n[0]).join('').toUpperCase();
    const newMember = {
      name: newStaffName,
      role: newStaffRole,
      avatar: initials
    };

    setStaff(prev => ({
      ...prev,
      [selectedRoleId]: [...prev[selectedRoleId], newMember]
    }));

    setIsAddStaffOpen(false);
    setNewStaffName('');
    setNewStaffRole('');
    setToastText(`${newStaffName} assigned to ${selectedRoleId} role!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative pb-[100px] bg-[#F8FAFC]">
      
      {/* Page Header (direct, matching figma title placement) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">Roles & Permissions Management</h2>
          <p className="text-slate-500 text-[14px] mt-1">Configure granular access control for institutional staff and faculty members.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setToastText("Audit log exported successfully!");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
            className="border border-[#C2C6D4] hover:bg-slate-50 text-[#555F6B] px-4 py-2 rounded-lg text-[13px] font-bold transition-colors bg-white shadow-sm"
          >
            Audit Log
          </button>
          <button 
            onClick={() => setIsCreateRoleOpen(true)}
            className="bg-[#003F87] hover:bg-[#002B5E] text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid (taking up full width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* Left Side: System Roles Column */}
        <div className="lg:col-span-4 bg-white border border-[#C2C6D4] rounded-xl overflow-hidden shadow-sm flex flex-col p-4 gap-3">
          <h4 className="text-[12px] font-bold text-[#555F6B] uppercase tracking-wider px-2.5 py-1">System Roles</h4>
          
          <div className="flex flex-col gap-1.5">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all flex justify-between items-center ${
                  selectedRoleId === role.id 
                    ? 'bg-[#E5F0FF] border-[#003F87] text-[#003F87] font-bold' 
                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-[14px] font-bold leading-tight">{role.name}</div>
                  <div className={`text-[11px] mt-1 ${selectedRoleId === role.id ? 'text-[#003F87]/75 font-semibold' : 'text-slate-400'}`}>
                    {role.desc}
                  </div>
                </div>
                {selectedRoleId === role.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003F87]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Permissions Matrix Table */}
        <div className="lg:col-span-8 bg-white border border-[#C2C6D4] rounded-xl overflow-hidden shadow-sm flex flex-col">
          
          {/* Table Header */}
          <div className="px-6 py-4.5 border-b border-[#C2C6D4] flex justify-between items-center flex-wrap gap-3">
            <h4 className="text-[14px] font-bold text-slate-900 leading-tight">
              Permissions Matrix - <span className="text-[#003F87] font-extrabold">{roles.find(r => r.id === selectedRoleId)?.name || selectedRoleId}</span>
            </h4>
            
            <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 cursor-pointer">
              <input 
                type="checkbox"
                checked={isAllViewChecked}
                onChange={toggleSelectAllView} disabled={selectedRoleId === 'super-admin'}
                className="rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] w-4 h-4 cursor-pointer accent-[#003F87]"
              />
              <span>Select All View</span>
            </label>
          </div>

          {/* Matrix Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-[#C2C6D4] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">System Module</th>
                  <th className="py-3.5 px-4 text-center">View</th>
                  <th className="py-3.5 px-4 text-center">Create</th>
                  <th className="py-3.5 px-4 text-center">Edit</th>
                  <th className="py-3.5 px-4 text-center">Delete</th>
                  <th className="py-3.5 px-4 text-center">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'employees', label: 'Employees', icon: Briefcase },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'fees', label: 'Fees & Revenue', icon: CreditCard },
    { key: 'sales', label: 'Sales CRM', icon: Handshake },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'gallery', label: 'Gallery', icon: Image },
    { key: 'leave', label: 'Leave Management', icon: FileText },
    { key: 'work-reports', label: 'Work Reports', icon: FileText },
    { key: 'blog-agent', label: 'Blog Agent', icon: Bot },
  ].map((mod) => {
                  const currentPerm = (permissions[selectedRoleId] && permissions[selectedRoleId][mod.key]) || { view: false, create: false, edit: false, delete: false, export: false };
                  const Icon = mod.icon;
                  
                  return (
                    <tr key={mod.key} className="hover:bg-slate-50/50 transition-colors text-[13px] text-slate-700">
                      
                      <td className="py-4 px-6 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className="text-slate-400" />
                          <span>{mod.label}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={currentPerm.view}
                          onChange={() => togglePermission(mod.key, 'view')} disabled={selectedRoleId === 'super-admin'}
                          className="rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] w-4.5 h-4.5 cursor-pointer accent-[#003F87]"
                        />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={currentPerm.create}
                          onChange={() => togglePermission(mod.key, 'create')} disabled={selectedRoleId === 'super-admin'}
                          className="rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] w-4.5 h-4.5 cursor-pointer accent-[#003F87]"
                        />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={currentPerm.edit}
                          onChange={() => togglePermission(mod.key, 'edit')} disabled={selectedRoleId === 'super-admin'}
                          className="rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] w-4.5 h-4.5 cursor-pointer accent-[#003F87]"
                        />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={currentPerm.delete}
                          onChange={() => togglePermission(mod.key, 'delete')} disabled={selectedRoleId === 'super-admin'}
                          className="rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] w-4.5 h-4.5 cursor-pointer accent-[#003F87]"
                        />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={currentPerm.export}
                          onChange={() => togglePermission(mod.key, 'export')} disabled={selectedRoleId === 'super-admin'}
                          className="rounded border-slate-300 text-[#003F87] focus:ring-[#003F87] w-4.5 h-4.5 cursor-pointer accent-[#003F87]"
                        />
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-[#C2C6D4] flex justify-end gap-3">
            <button 
              onClick={handleResetPermissions}
              className="px-4 py-2 border border-[#C2C6D4] bg-white hover:bg-slate-100 rounded-lg text-[13px] font-bold text-slate-600 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Discard</span>
            </button>
            
            <button 
              onClick={handlePermissionsSave}
              className="px-5 py-2 bg-[#003F87] hover:bg-[#002B5E] rounded-lg text-[13px] font-bold text-white transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>

        </div>

      </div>

      {/* Assign Employees Section */}
      <div className="bg-white border border-[#C2C6D4] rounded-xl p-6 shadow-sm flex flex-col gap-4 w-full">
        
        {/* Heading & Filter controls */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-[15px] font-bold text-slate-900">Assign Employees</h4>
            <p className="text-[12px] text-slate-500">
              Manage individuals assigned to the <span className="font-bold text-[#003F87]">{roles.find(r => r.id === selectedRoleId)?.name || selectedRoleId}</span> role.
            </p>
          </div>
          
          {/* Filter dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="relative flex items-center bg-white border border-[#C2C6D4] rounded-lg px-3 py-1.5 h-[38px] shadow-sm focus-within:border-[#003F87]">
              <select
                value={assignFilter}
                onChange={(e) => setAssignFilter(e.target.value)}
                className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer border-none focus:ring-0 p-0 pr-8"
              >
                <option value="all">All Roles</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="hr">HR</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
            
            <div className="w-[38px] h-[38px] rounded-lg border border-[#C2C6D4] flex items-center justify-center bg-slate-50/50 text-slate-500 shadow-sm shrink-0">
              <Filter size={15} />
            </div>
          </div>
        </div>

        {/* Employees Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
          
          {/* Assigned members */}
          {filteredStaffList.map((member, idx) => (
            <div key={idx} className="border border-slate-100 hover:border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-[#003F87] font-bold text-[12px] flex items-center justify-center border border-slate-200 shrink-0">
                  {member.avatar}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">{member.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">{member.role}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  const updatedMembers = (staff[selectedRoleId] || []).filter(m => m.name !== member.name);
                  setStaff(prev => ({ ...prev, [selectedRoleId]: updatedMembers }));
                  setToastText(`Removed ${member.name} from ${selectedRoleId} role.`);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="text-slate-300 hover:text-red-500 p-1.5 transition-colors text-[16px] leading-none font-bold"
                title="Remove staff"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Add Staff Dotted Card */}
          <button 
            onClick={() => setIsAddStaffOpen(true)}
            className="border-2 border-dashed border-slate-200 hover:border-[#003F87] rounded-xl p-4 flex items-center justify-center gap-2 text-[13px] font-bold text-slate-500 hover:text-[#003F87] transition-all h-[74px] bg-slate-50/30"
          >
            <UserPlus size={16} />
            <span>Add Staff Member</span>
          </button>

        </div>

      </div>

      {/* Bottom Console Info Disclaimer */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-400 px-2 mt-2">
        <div>© 2024 Novox Edtech Admin Console. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span className="hover:underline cursor-pointer">Security Protocol</span>
          <span className="hover:underline cursor-pointer">User Privacy</span>
          <span className="hover:underline cursor-pointer">API Documentation</span>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in scale-in-95 duration-200 border border-slate-100">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-950">Add Staff Member</h2>
              <button 
                onClick={() => setIsAddStaffOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors font-bold text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddStaffSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Staff Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Designation / Sub-role *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Senior UX Analyst"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)} 
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[12px] font-bold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#003F87] hover:bg-[#002B5E] rounded-xl text-[12px] font-bold text-white transition-colors shadow-sm"
                >
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Role Modal */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in scale-in-95 duration-200 border border-slate-100">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-950">Create New Role</h2>
              <button 
                onClick={() => setIsCreateRoleOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors font-bold text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateRoleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Role Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Security Specialist"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description / Subtext *</label>
                <input 
                  type="text"
                  placeholder="e.g. System Security & Logs"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsCreateRoleOpen(false)} 
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[12px] font-bold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#003F87] hover:bg-[#002B5E] rounded-xl text-[12px] font-bold text-white transition-colors shadow-sm"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#003F87] text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 z-[999] animate-in slide-in-from-bottom-5">
          <CheckCircle size={18} className="text-white shrink-0" />
          <p className="text-sm font-semibold">{toastText}</p>
        </div>
      )}
    </div>
  );
};

export default SettingsContent;
