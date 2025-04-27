import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ExpenseCategory, Expense } from '../types';
import { formatCurrency, getCategoryIcon } from '../utils/helpers';

const ReportsPage: React.FC = () => {
  const { state } = useAppContext();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  
  const familyExpenses = state.expenses.filter(
    expense => expense.familyId === state.currentFamily?.id
  );
  
  // Get filtered expenses based on timeframe
  const filteredExpenses = useMemo(() => {
    const currentDate = new Date();
    
    if (timeframe === 'week') {
      // Get start of week (Sunday)
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      return familyExpenses.filter(expense => 
        new Date(expense.date) >= startOfWeek
      );
    } else if (timeframe === 'month') {
      // Get start of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      return familyExpenses.filter(expense => 
        new Date(expense.date) >= startOfMonth
      );
    } else if (timeframe === 'year') {
      // Get start of year
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      
      return familyExpenses.filter(expense => 
        new Date(expense.date) >= startOfYear
      );
    }
    
    return familyExpenses;
  }, [familyExpenses, timeframe]);
  
  // Group by category
  const categoryData = useMemo(() => {
    const categories = Object.values(ExpenseCategory).reduce<Record<string, number>>(
      (acc, category) => {
        const categoryExpenses = filteredExpenses.filter(
          expense => expense.category === category
        );
        
        acc[category] = categoryExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        
        return acc;
      },
      {}
    );
    
    // Sort categories by amount (descending)
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, amount]) => amount > 0);
  }, [filteredExpenses]);
  
  // Group by user
  const userData = useMemo(() => {
    const userExpenses = state.users.reduce<Record<string, { name: string; amount: number }>>(
      (acc, user) => {
        const userExpenses = filteredExpenses.filter(
          expense => expense.userId === user.id
        );
        
        acc[user.id] = {
          name: user.name,
          amount: userExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        };
        
        return acc;
      },
      {}
    );
    
    // Sort users by amount (descending)
    return Object.entries(userExpenses)
      .sort((a, b) => b[1].amount - a[1].amount)
      .filter(([_, data]) => data.amount > 0);
  }, [filteredExpenses, state.users]);
  
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500">Analyze your family's spending habits</p>
        </div>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeframe === 'week'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'month'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-200`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeframe === 'year'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <PieChart size={20} className="text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Spending by Category</h2>
          </div>
          
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500 border-b pb-2">
                <span>Category</span>
                <span>Amount</span>
              </div>
              
              {categoryData.map(([category, amount]) => {
                const percentage = (amount / totalAmount) * 100;
                const CategoryIcon = getCategoryIcon(category as ExpenseCategory);
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-full bg-teal-100 text-teal-600 mr-2">
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(amount)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No expenses recorded in this timeframe.</p>
            </div>
          )}
        </div>
        
        {/* User spending comparison */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BarChart3 size={20} className="text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Spending by Family Member</h2>
          </div>
          
          {userData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500 border-b pb-2">
                <span>Member</span>
                <span>Amount</span>
              </div>
              
              {userData.map(([userId, data]) => {
                const percentage = (data.amount / totalAmount) * 100;
                
                return (
                  <div key={userId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-2">
                          {data.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {data.name}
                          {userId === state.currentUser?.id && (
                            <span className="ml-1 text-xs text-gray-500">(You)</span>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(data.amount)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No expenses recorded in this timeframe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;