import React from 'react';
import StatsGrid from './StatsGrid';
import LowerContent from './LowerContent';

const MainContent = ({ activeTab }) => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      <StatsGrid />
      <LowerContent />
    </div>
  );
};

export default MainContent;
