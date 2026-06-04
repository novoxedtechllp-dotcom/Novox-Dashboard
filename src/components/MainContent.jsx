import React from 'react';
import StatsGrid from './StatsGrid';
import LowerContent from './LowerContent';

const MainContent = ({ activeTab, employees = [] }) => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      <StatsGrid />
      <LowerContent employees={employees} />
    </div>
  );
};

export default MainContent;
