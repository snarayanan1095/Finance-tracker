import React from 'react';
import ExpenseSummary from '../components/Dashboard/ExpenseSummary';
import CategoryBreakdown from '../components/Dashboard/CategoryBreakdown';
import RecentExpenses from '../components/Dashboard/RecentExpenses';
import { useAppContext } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { state } = useAppContext();
  const userName = state.currentUser?.name.split(' ')[0] || 'there';
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {userName}!</h1>
        <p className="text-gray-500">Here's an overview of your family finances</p>
      </div>
      
      <ExpenseSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown />
        <RecentExpenses />
      </div>
    </div>
  );
};

export default Dashboard;