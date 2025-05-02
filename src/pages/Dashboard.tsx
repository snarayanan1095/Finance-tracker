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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-500">
            Hi, {userName}!
          </h1>
          <p className="text-gray-500">Here's an overview of your family finances</p>
        </div>
        <button
          onClick={() => navigate('/expenses/new')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
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