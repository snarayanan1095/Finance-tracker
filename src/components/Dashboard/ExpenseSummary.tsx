import React from 'react';
import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

const ExpenseSummary: React.FC = () => {
  const { state } = useAppContext();
  
  const familyExpenses = state.expenses.filter(
    expense => expense.familyId === state.currentFamily?.id
  );
  
  // Calculate total expenses
  const totalExpenses = familyExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );
  
  // Calculate today's expenses
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = familyExpenses
    .filter(expense => expense.date === today)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate this month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthExpenses = familyExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate last month's expenses for comparison
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthExpenses = familyExpenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === lastMonth && 
             expenseDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate percent change
  const percentChange = lastMonthExpenses === 0 
    ? 0 
    : ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  
  const isIncrease = percentChange > 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
        <div className="bg-purple-100 rounded-full p-3 mr-4">
          <CreditCard className="text-purple-600" size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
        <div className="bg-teal-100 rounded-full p-3 mr-4">
          <CreditCard className="text-teal-600" size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Today's Expenses</p>
          <p className="text-2xl font-semibold text-gray-800">{formatCurrency(todayExpenses)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
        <div className="bg-orange-100 rounded-full p-3 mr-4">
          {isIncrease ? (
            <TrendingUp className="text-orange-600" size={24} />
          ) : (
            <TrendingDown className="text-green-600" size={24} />
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500">This Month</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-800 mr-2">
              {formatCurrency(thisMonthExpenses)}
            </p>
            {lastMonthExpenses > 0 && (
              <span className={`text-xs px-1 py-0.5 rounded ${
                isIncrease 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;