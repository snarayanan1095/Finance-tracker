import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Expense, ExpenseCategory } from '../types';

const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, loading, currentFamily } = useAppContext();
  const { currentUser } = useAuth();
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: ExpenseCategory.FOOD,
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
    userId: currentUser?.uid || '',
    familyId: currentFamily?.id || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentFamily) return;

    try {
      await addExpense({
        ...newExpense,
        userId: currentUser.uid,
        familyId: currentFamily.id
      });
      setNewExpense({
        title: '',
        amount: 0,
        category: ExpenseCategory.FOOD,
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: '',
        userId: currentUser.uid,
        familyId: currentFamily.id
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  if (loading) {
    return <div>Loading expenses...</div>;
  }

  if (!currentFamily) {
    return <div>Please select or create a family first.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      
      {/* Add Expense Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={newExpense.title}
            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(ExpenseCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={newExpense.location}
            onChange={(e) => setNewExpense({ ...newExpense, location: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={newExpense.notes}
            onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Expense
        </button>
      </form>

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{expense.title}</h3>
                <p className="text-gray-500">{expense.category}</p>
                <p className="text-gray-500">{expense.date}</p>
                {expense.location && <p className="text-gray-500">{expense.location}</p>}
                {expense.notes && <p className="text-gray-500">{expense.notes}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">${expense.amount.toFixed(2)}</span>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesPage;