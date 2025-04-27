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

export interface Expense {
  id: string;
  title: string;
  amount: number;
  location: string;
  date: string;
  category: ExpenseCategory;
  notes?: string;
  userId: string;
  familyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  familyId: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
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
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'EDIT_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'EDIT_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_FAMILY'; payload: Family }
  | { type: 'EDIT_FAMILY'; payload: Family }
  | { type: 'DELETE_FAMILY'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_CURRENT_FAMILY'; payload: Family | null }
  | { type: 'LOAD_DATA'; payload: AppState };