import React from 'react';
import { Paperclip, MessageSquare, Zap, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

const columns = [
  {
    id: 'new',
    title: 'New',
    count: 4,
    items: [
      { id: 1, name: 'Sarah Jenkins', time: '2h ago', course: 'UI/UX Design Masterclass', initials: 'SJ', icon: 'paperclip' },
      { id: 2, name: 'Michael Chen', time: '5h ago', course: 'Full-Stack Development', initials: 'MC', icon: 'message' },
      { id: 3, name: 'Elena Rodriguez', time: 'Yesterday', course: 'Data Science Specialization', initials: 'ER', icon: 'none' }
    ]
  },
  {
    id: 'contacted',
    title: 'Contacted',
    count: 3,
    items: [
      { id: 4, name: 'David Miller', time: '2d ago', course: 'Digital Marketing Pro', badge: 'Follow-up sent' },
      { id: 5, name: 'Aisha Khan', time: '3d ago', course: 'Corporate Leadership', badge: '' }
    ]
  },
  {
    id: 'interested',
    title: 'Interested',
    count: 6,
    items: [
      { id: 6, name: 'Robert Wilson', time: '1w ago', course: 'Cloud Computing Arch.', hotLead: true, initials: 'RW' },
      { id: 7, name: 'Sophie Martin', time: '5d ago', course: 'Python for Beginners', hotLead: false, initials: 'SM' }
    ]
  },
  {
    id: 'enrolled',
    title: 'Enrolled',
    count: 12,
    items: [
      { id: 8, name: 'Lucas Silva', time: '', course: 'Cybersecurity Fundamentals', status: 'enrolled', date: 'Enrolled Oct 24, 2023' }
    ]
  },
  {
    id: 'lost',
    title: 'Lost',
    count: 2,
    items: [
      { id: 9, name: 'Thomas Anderson', time: '', course: 'AI & Machine Learning', status: 'lost', reason: 'Budget constraints' }
    ]
  }
];

const SalesCrmContent = () => {
  return (
    <div className="p-[24px] h-full flex flex-col w-full overflow-hidden">
      
      {/* Kanban Board */}
      <div className="flex gap-[24px] h-full overflow-x-auto pb-[24px]" style={{scrollbarWidth: 'thin'}}>
        
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col min-w-[300px] w-[300px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-[16px]">
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-bold text-slate-900">{col.title}</h3>
                <span className="bg-[#F3F4F6] text-[#555F6B] text-[11px] font-bold px-[8px] py-[2px] rounded-full">{col.count}</span>
              </div>
              {col.id === 'new' && (
                <button className="text-[#555F6B] hover:text-slate-900"><MoreHorizontal size={18} /></button>
              )}
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-[12px] flex-1 overflow-y-auto pr-[4px]" style={{scrollbarWidth: 'none'}}>
              {col.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-[8px] p-[16px] border ${col.id === 'interested' && item.hotLead ? 'border-l-[3px] border-l-[#003F87] border-y-[#C2C6D4] border-r-[#C2C6D4]' : 'border-[#C2C6D4]'} shadow-sm flex flex-col gap-[12px] cursor-grab hover:shadow-md transition-shadow shrink-0 min-h-[118px]`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-[14px] font-bold text-[#003F87] leading-tight">{item.name}</h4>
                    {item.time && <span className="text-[11px] text-[#555F6B] font-medium">{item.time}</span>}
                    {item.status === 'enrolled' && <CheckCircle size={16} className="text-[#008A2E]" />}
                    {item.status === 'lost' && <XCircle size={16} className="text-[#D80000]" />}
                  </div>
                  
                  <p className="text-[12px] text-[#555F6B] leading-snug">{item.course}</p>
                  
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    {/* Bottom Left */}
                    <div>
                      {item.initials && col.id !== 'interested' && (
                        <div className="w-[24px] h-[24px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[10px] flex items-center justify-center">
                          {item.initials}
                        </div>
                      )}
                      {item.badge && (
                        <span className="bg-[#F3F4F6] text-[#555F6B] px-[8px] py-[4px] text-[10px] font-bold rounded-[4px]">
                          {item.badge}
                        </span>
                      )}
                      {item.hotLead && (
                        <span className="flex items-center gap-1 text-[#003F87] font-bold text-[11px]">
                          <Zap size={12} className="fill-[#003F87]" /> Hot Lead
                        </span>
                      )}
                      {item.date && (
                        <span className="text-[11px] text-[#C2C6D4] font-medium">{item.date}</span>
                      )}
                      {item.reason && (
                        <span className="text-[11px] text-[#C2C6D4] font-medium">{item.reason}</span>
                      )}
                    </div>
                    
                    {/* Bottom Right */}
                    <div>
                      {item.icon === 'paperclip' && <Paperclip size={14} className="text-[#555F6B]" />}
                      {item.icon === 'message' && <MessageSquare size={14} className="text-[#555F6B]" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default SalesCrmContent;
