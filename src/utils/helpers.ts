import { Coffee, Home, Car, Music, Zap, Stethoscope, BookOpen, ShoppingBag, Plane, User, Package } from 'lucide-react';
import { ExpenseCategory } from '../types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Group expenses by date
export const groupExpensesByDate = (expenses: any[]) => {
  return expenses.reduce((groups: Record<string, any[]>, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});
};

// Get icon for category
export const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case ExpenseCategory.FOOD:
      return Coffee;
    case ExpenseCategory.HOUSING:
      return Home;
    case ExpenseCategory.TRANSPORTATION:
      return Car;
    case ExpenseCategory.ENTERTAINMENT:
      return Music;
    case ExpenseCategory.UTILITIES:
      return Zap;
    case ExpenseCategory.HEALTHCARE:
      return Stethoscope;
    case ExpenseCategory.EDUCATION:
      return BookOpen;
    case ExpenseCategory.SHOPPING:
      return ShoppingBag;
    case ExpenseCategory.TRAVEL:
      return Plane;
    case ExpenseCategory.PERSONAL:
      return User;
    case ExpenseCategory.MISCELLANEOUS:
    default:
      return Package;
  }
};