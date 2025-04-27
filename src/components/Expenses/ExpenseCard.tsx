import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/helpers';

type ExpenseCardProps = {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const { title, amount, category, date, location } = expense;
  const CategoryIcon = getCategoryIcon(category);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-transform hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600">
            <CategoryIcon size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-800">{formatCurrency(amount)}</p>
          <p className="text-xs text-gray-500">{formatDate(date)}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {category}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(expense)} 
            className="p-1 text-gray-500 hover:text-teal-600 transition-colors"
            aria-label="Edit expense"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(expense.id)} 
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Delete expense"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;