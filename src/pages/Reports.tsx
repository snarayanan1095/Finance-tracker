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
  
  // Helper to normalize date to 'YYYY-MM-DD'
  function normalizeDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      if (date.includes('T')) return date.split('T')[0];
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const [month, day, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return date;
    }
    if (date.toDate) {
      const d = date.toDate();
      return d.toISOString().split('T')[0];
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }
  
  // Get filtered expenses based on timeframe
  const filteredExpenses = useMemo(() => {
    const currentDate = new Date();
    
    if (timeframe === 'week') {
      // Get start of week (Sunday)
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return familyExpenses.filter(expense => {
        const expDate = new Date(normalizeDate(expense.date));
        return expDate >= startOfWeek;
      });
    } else if (timeframe === 'month') {
      // Get start of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return familyExpenses.filter(expense => {
        const expDate = new Date(normalizeDate(expense.date));
        return expDate >= startOfMonth;
      });
    } else if (timeframe === 'year') {
      // Get start of year
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      return familyExpenses.filter(expense => {
        const expDate = new Date(normalizeDate(expense.date));
        return expDate >= startOfYear;
      });
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
  
  // Debug logs
  console.log('state.users:', state.users);
  console.log('filteredExpenses:', filteredExpenses);
  console.log('userData:', userData);
  
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );
  
  return (
    <div className="p-4 max-w-5xl mx-auto bg-[#000000] min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Reports</h1>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">Analyze your family's spending habits</p>
        </div>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeframe === 'week'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-200`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeframe === 'year'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-200`}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Category breakdown */}
        <div className="bg-[#23272f] rounded-lg shadow-sm p-6 flex-1 min-h-[340px] flex flex-col justify-between">
          <div className="flex items-center">
            <PieChart size={20} className="text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-[#f3f4f6]">Spending by Category</h2>
          </div>
          
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-[#a1a1aa] border-b border-[#1e293b] pb-2">
                <span>Category</span>
                <span>Amount</span>
              </div>
              
              {categoryData.map(([category, amount]) => {
                const percentage = (amount / totalAmount) * 100;
                const CategoryIcon = getCategoryIcon(category as ExpenseCategory);
                
                return (
                  <div key={category} className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className="p-1 rounded-full bg-orange-100 text-orange-600 mr-2">
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-medium text-[#f3f4f6]">{category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#f3f4f6]">
                          {formatCurrency(amount)}
                        </span>
                        <span className="text-xs text-[#a1a1aa] ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-[#1e293b] rounded-full h-1.5">
                      <div 
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#f3f4f6]">Total</span>
                  <span className="font-bold text-[#f3f4f6]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-[#a1a1aa]">
              <p>No expenses recorded in this timeframe.</p>
            </div>
          )}
        </div>
        
        {/* User spending comparison */}
        <div className="bg-[#23272f] rounded-lg shadow-sm p-6 flex-1 min-h-[340px] flex flex-col justify-between">
          <div className="flex items-center mb-4">
            <BarChart3 size={20} className="text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold text-[#f3f4f6]">Spending by Family Member</h2>
          </div>
          
          {userData.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-[#a1a1aa] border-b border-[#1e293b] pb-2">
                <span>Member</span>
                <span>Amount</span>
              </div>
              
              {userData.map(([userId, data]) => {
                const percentage = (data.amount / totalAmount) * 100;
                
                return (
                  <div key={userId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 font-bold mr-2">
                          {data.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-[#f3f4f6]">
                          {data.name}
                          {userId === state.currentUser?.id && (
                            <span className="ml-1 text-xs text-[#a1a1aa]">(You)</span>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#f3f4f6]">
                          {formatCurrency(data.amount)}
                        </span>
                        <span className="text-xs text-[#a1a1aa] ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-[#1e293b] rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t border-[#1e293b]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#f3f4f6]">Total</span>
                  <span className="font-bold text-[#f3f4f6]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-[#a1a1aa]">
              <p>No expenses recorded in this timeframe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;