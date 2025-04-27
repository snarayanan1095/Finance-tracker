import { Coffee, Home, Car, Music, Zap, Stethoscope, BookOpen, ShoppingBag, Plane, User, Package } from 'lucide-react';
import { ExpenseCategory, Currency } from '../types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

// Default currency to use when none is specified
const DEFAULT_CURRENCY: Currency = CURRENCIES[0]; // USD

// Format currency
export const formatCurrency = (amount: number, currency?: Currency): string => {
  const currencyToUse = currency || DEFAULT_CURRENCY;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyToUse.code,
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
