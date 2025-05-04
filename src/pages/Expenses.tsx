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
    userId: currentUser?.uid || '',
    familyId: currentFamily?.id || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentFamily) return;

    try {
      const createdExpense = await createExpense({
        ...newExpense,
        userId: currentUser.uid,
        familyId: currentFamily.id,
        date: firebase.firestore.Timestamp.fromDate(new Date(newExpense.date))
      });
      dispatch({ type: 'ADD_EXPENSE', payload: createdExpense });
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
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Expenses</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Title</label>
          <input
            type="text"
            value={newExpense.title}
            onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-900 text-white placeholder-gray-400"
            placeholder="Enter title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Amount</label>
          <input
            type="number"
            value={newExpense.amount}
            onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-900 text-white placeholder-gray-400"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Category</label>
          <select
            value={newExpense.category}
            onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-900 text-white"
          >
            {Object.values(ExpenseCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Date</label>
          <input
            type="date"
            value={newExpense.date}
            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-900 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Location</label>
          <input
            type="text"
            value={newExpense.location}
            onChange={e => setNewExpense({ ...newExpense, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-900 text-white placeholder-gray-400"
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
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
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
                  onClick={() => expense.id && dispatch({
                    type: 'DELETE_EXPENSE',
                    payload: expense.id
                  })}
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