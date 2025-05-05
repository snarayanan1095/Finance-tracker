import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/helpers';

const RecentExpenses: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  // Get family expenses
  const familyExpenses = state.expenses.filter(
    expense => expense.familyId === state.currentFamily?.id
  );
  
  // Sort by date (most recent first) and limit to 5
  const recentExpenses = [...familyExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
        <button 
          onClick={() => navigate('/expenses')}
          className="text-teal-600 hover:text-teal-700 text-sm flex items-center transition-colors"
        >
          View all
          <ChevronRight size={16} />
        </button>
      </div>
      
      {recentExpenses.length > 0 ? (
        <div className="space-y-4">
          {recentExpenses.map((expense, idx) => {
            const CategoryIcon = getCategoryIcon(expense.category);
            
            return (
              <div key={expense.id || idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    <CategoryIcon size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.title}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{expense.location}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">
                  {formatCurrency(expense.amount, state.currentFamily?.defaultCurrency)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500">
          <DollarSign size={32} className="mx-auto mb-2 text-gray-400" />
          <p>No expenses recorded yet.</p>
          <button
            onClick={() => navigate('/expenses')}
            className="mt-2 text-teal-600 hover:text-teal-700 text-sm"
          >
            Add your first expense
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
