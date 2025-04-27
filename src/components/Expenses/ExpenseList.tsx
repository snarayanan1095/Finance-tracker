import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import ExpenseCard from './ExpenseCard';
import ExpenseForm from './ExpenseForm';
import { Expense, ExpenseCategory } from '../../types';
import { groupExpensesByDate } from '../../utils/helpers';

const ExpenseList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'All'>('All');

  const userExpenses = state.expenses.filter(
    expense => expense.familyId === state.currentFamily?.id
  );

  const filteredExpenses = userExpenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedExpenses = groupExpensesByDate(filteredExpenses);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-500">Manage and track your expenses</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'All')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Categories</option>
            {Object.values(ExpenseCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.keys(groupedExpenses).length > 0 ? (
          Object.entries(groupedExpenses)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([date, expenses]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-gray-50 py-2">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No expenses found. Add your first expense!</p>
          </div>
        )}
      </div>
      
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default ExpenseList;