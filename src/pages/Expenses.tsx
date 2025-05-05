import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ExpenseCategory } from '../types';
import { createExpense } from '../services/firebase';
import firebase from 'firebase';

const ExpensesPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { expenses, currentFamily, loading } = state;
  const { currentUser } = useAuth();
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: ExpenseCategory.FOOD,
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
    userId: state.currentUser?.id || '',
    familyId: currentFamily?.id || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentFamily) return;

    try {
      const createdExpense = await createExpense({
        ...newExpense,
        userId: state.currentUser?.id || '',
        familyId: currentFamily.id,
        date: firebase.firestore.Timestamp.fromDate(new Date(newExpense.date))
      });
      setNewExpense({
        title: '',
        amount: 0,
        category: ExpenseCategory.FOOD,
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: '',
        userId: state.currentUser?.id || '',
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
    <div className="p-4 max-w-2xl mx-auto bg-[#18181b] min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Expenses</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#f3f4f6]">Title</label>
          <input
            type="text"
            value={newExpense.title}
            onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#f3f4f6]">Amount</label>
          <input
            type="number"
            value={newExpense.amount}
            onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#f3f4f6]">Category</label>
          <select
            value={newExpense.category as ExpenseCategory}
            onChange={e => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
            className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {Object.values(ExpenseCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#f3f4f6]">Date</label>
          <input
            type="date"
            value={newExpense.date}
            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#f3f4f6]">Location</label>
          <input
            type="text"
            value={newExpense.location}
            onChange={e => setNewExpense({ ...newExpense, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Notes</label>
          <textarea
            value={newExpense.notes}
            onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-900 text-white placeholder-gray-400"
            placeholder="Enter notes"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-orange-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      {/* Expenses List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Recent Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-[#a1a1aa]">No expenses yet.</p>
        ) : (
          <ul className="space-y-4">
            {expenses.map((expense, idx) => (
              <li key={expense.id || idx} className="bg-[#23272f] rounded-lg p-4 text-white flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{expense.title}</div>
                  <div className="text-sm text-[#a1a1aa]">{expense.category} | {expense.location}</div>
                  <div className="text-xs text-[#a1a1aa]">{expense.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{expense.amount.toFixed(2)}</div>
                  <button
                    className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => expense.id && dispatch({
                      type: 'DELETE_EXPENSE',
                      payload: expense.id
                    })}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;