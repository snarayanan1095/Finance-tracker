import React from 'react';
import ExpenseSummary from '../components/Dashboard/ExpenseSummary';
import CategoryBreakdown from '../components/Dashboard/CategoryBreakdown';
import RecentExpenses from '../components/Dashboard/RecentExpenses';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const userName = state.currentUser?.name.split(' ')[0] || 'there';
  
  return (
    <div className="space-y-6 bg-[#000000] min-h-screen p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f3f4f6]">
            Hi, {userName}!
          </h1>
          <p className="text-[#a1a1aa]">Here's an overview of your family finances</p>
        </div>
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Expense
        </button>
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