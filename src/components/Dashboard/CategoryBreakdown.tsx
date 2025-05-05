import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ExpenseCategory } from '../../types';
import { formatCurrency, getCategoryIcon } from '../../utils/helpers';

const CategoryBreakdown: React.FC = () => {
  const { state } = useAppContext();
  
  const categoryData = useMemo(() => {
    const familyExpenses = state.expenses.filter(
      expense => expense.familyId === state.currentFamily?.id
    );
    
    // Get current month expenses
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthExpenses = familyExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate total amount for the month
    const totalAmount = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount, 
      0
    );
    
    // Group by category
    const categories = Object.values(ExpenseCategory).reduce<Record<string, { amount: number; percentage: number }>>(
      (acc, category) => {
        const categoryExpenses = currentMonthExpenses.filter(
          expense => expense.category === category
        );
        
        const categoryAmount = categoryExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        
        const percentage = totalAmount === 0 
          ? 0 
          : (categoryAmount / totalAmount) * 100;
        
        acc[category] = {
          amount: categoryAmount,
          percentage
        };
        
        return acc;
      },
      {}
    );
    
    // Sort categories by amount (descending)
    return Object.entries(categories)
      .sort((a, b) => b[1].amount - a[1].amount)
      .filter(([_, data]) => data.amount > 0);
  }, [state.expenses, state.currentFamily]);
  
  // Get month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Category Breakdown - {currentMonthName}
      </h2>
      
      {categoryData.length > 0 ? (
        <div className="space-y-4">
          {categoryData.map(([category, data]) => {
            const CategoryIcon = getCategoryIcon(category as ExpenseCategory);
            
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-full bg-orange-100 text-orange-600 mr-2">
                      <CategoryIcon size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(data.amount, state.currentFamily?.defaultCurrency)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({data.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <p>No expenses recorded this month yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
