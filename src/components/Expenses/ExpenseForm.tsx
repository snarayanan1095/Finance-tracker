import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { useAppContext } from '../../context/AppContext';

type ExpenseFormProps = {
  expense?: Expense;
  onClose: () => void;
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onClose }) => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'userId' | 'familyId' | 'createdAt' | 'updatedAt'>>({
    title: '',
    amount: 0,
    location: '',
    date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.MISCELLANEOUS,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        location: expense.location,
        date: expense.date,
        category: expense.category,
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const now = new Date().toISOString();
    
    if (expense) {
      // Edit existing expense
      const updatedExpense: Expense = {
        ...expense,
        ...formData,
        updatedAt: now
      };
      
      dispatch({ type: 'EDIT_EXPENSE', payload: updatedExpense });
    } else {
      // Create new expense
      const newExpense: Expense = {
        id: uuidv4(),
        ...formData,
        userId: state.currentUser?.id || '',
        familyId: state.currentFamily?.id || '',
        createdAt: now,
        updatedAt: now
      };
      
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="What was the expense for?"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full pl-8 px-3 py-2 border rounded-md ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Object.values(ExpenseCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Where was the expense made?"
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Any additional details about the expense"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              {expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;