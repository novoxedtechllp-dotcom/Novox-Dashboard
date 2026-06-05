import React from 'react';
import { Plus } from 'lucide-react';

const Fab = () => {
  return (
    <button className="absolute right-[32px] bottom-[32px] w-[56px] h-[56px] bg-[#003F87] rounded-[12px] text-white flex items-center justify-center shadow-lg hover:bg-[#002B5E] transition-all transform hover:scale-105 z-50">
      <Plus size={24} />
    </button>
  );
};

export default Fab;
