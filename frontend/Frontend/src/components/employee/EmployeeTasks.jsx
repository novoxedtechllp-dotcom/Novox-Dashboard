import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, Edit2, X, Paperclip, MessageSquare } from 'lucide-react';

const initialTasks = [
  { id: 1, title: 'Update Course Materials', description: 'Review and update the slides for Week 3 of the React course. Ensure all code examples are using React 18 syntax.', assignedBy: 'Sarah Mitchell', due: '2023-10-24', priority: 'High', status: 'In Progress' },
  { id: 2, title: 'Review Student Assignments', description: 'Grade the final projects for the Web Dev cohort.', assignedBy: 'David Chen', due: '2023-10-25', priority: 'Medium', status: 'To Do' },
  { id: 3, title: 'Prepare Monthly Report', description: 'Compile the student attendance and performance report.', assignedBy: 'Admin User', due: '2023-11-01', priority: 'Low', status: 'To Do' },
  { id: 4, title: 'Team Meeting Prep', description: 'Prepare discussion points for the Q3 planning meeting.', assignedBy: 'Sarah Mitchell', due: '2023-10-20', priority: 'Medium', status: 'Completed' },
  { id: 5, title: 'Fix Auth Bug', description: 'Investigate the intermittent logout issue on the mobile app.', assignedBy: 'Tech Lead', due: '2023-10-26', priority: 'High', status: 'Blocked' },
];

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewTask, setViewTask] = useState(null);

  const updateStatus = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Blocked': return 'bg-red-100 text-red-700';
      case 'To Do': default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (prio) => {
    switch(prio) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">My Tasks</h2>
          <p className="text-[#555F6B] text-[14px] mt-1">Manage your assigned tasks and projects.</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-800">{tasks.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Pending (To Do)</p>
          <p className="text-2xl font-bold text-slate-800">{tasks.filter(t=>t.status==='To Do').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-slate-800">{tasks.filter(t=>t.status==='In Progress').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Completed</p>
          <p className="text-2xl font-bold text-slate-800">{tasks.filter(t=>t.status==='Completed').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#C2C6D4] rounded-xl p-4 shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 flex-1">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent outline-none w-full text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="text-sm border border-slate-200 rounded-md px-2 py-1 outline-none">
            <option value="All">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Priority:</span>
          <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} className="text-sm border border-slate-200 rounded-md px-2 py-1 outline-none">
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#C2C6D4]">
              <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Task Name</th>
              <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Assigned By</th>
              <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Due Date</th>
              <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Priority</th>
              <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-semibold text-sm text-slate-800">{task.title}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{task.assignedBy}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{task.due}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select 
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-md outline-none cursor-pointer ${getStatusColor(task.status)}`}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setViewTask(task)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => updateStatus(task.id, 'Completed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md" title="Mark Complete">
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Detail Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Task Details</h2>
              <button onClick={() => setViewTask(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewTask.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getPriorityColor(viewTask.priority)}`}>{viewTask.priority} Priority</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusColor(viewTask.status)}`}>{viewTask.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Assigned By</p>
                  <p className="text-sm font-semibold text-slate-800">{viewTask.assignedBy}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Due Date</p>
                  <p className="text-sm font-semibold text-slate-800">{viewTask.due}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{viewTask.description}</p>
              </div>

              <div className="border-t border-slate-200 pt-4 flex gap-4">
                <button className="flex items-center gap-2 text-sm font-semibold text-[#003F87] hover:underline">
                  <Paperclip size={16} /> Attachments (0)
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-[#003F87] hover:underline">
                  <MessageSquare size={16} /> Comments (0)
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => setViewTask(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md font-semibold text-sm hover:bg-slate-300 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
