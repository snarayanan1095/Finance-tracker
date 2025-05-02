import { Timestamp } from 'firebase/firestore';

// Define core types for the application

export enum ExpenseCategory {
  FOOD = 'Food',
  HOUSING = 'Housing',
  TRANSPORTATION = 'Transportation',
  ENTERTAINMENT = 'Entertainment',
  UTILITIES = 'Utilities',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  SHOPPING = 'Shopping',
  TRAVEL = 'Travel',
  PERSONAL = 'Personal',
  MISCELLANEOUS = 'Miscellaneous'
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Firestore document types
export interface FirestoreExpense {
  id: string;
  title: string;
  amount: number;
  location: string;
  date: Timestamp;
  category: ExpenseCategory;
  notes?: string;
  userId: string;
  familyId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  familyId: string;
  currency: Currency;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreFamily {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: string;
  memberIds: string[];
  defaultCurrency: Currency;
}

// Application state types (after conversion from Firestore)
export interface Expense extends Omit<FirestoreExpense, 'date' | 'createdAt' | 'updatedAt'> {
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends Omit<FirestoreUser, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface Family extends Omit<FirestoreFamily, 'createdAt' | 'updatedAt' | 'memberIds'> {
  createdAt: string;
  updatedAt: string;
  members: User[];
}

export interface AppState {
  currentUser: User | null;
  currentFamily: Family | null;
  expenses: Expense[];
  families: Family[];
  users: User[];
}

export type ActionType = 
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'EDIT_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'EDIT_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_FAMILIES'; payload: Family[] }
  | { type: 'ADD_FAMILY'; payload: Family }
  | { type: 'EDIT_FAMILY'; payload: Family }
  | { type: 'DELETE_FAMILY'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_CURRENT_FAMILY'; payload: Family | null }
  | { type: 'LOAD_DATA'; payload: AppState };
