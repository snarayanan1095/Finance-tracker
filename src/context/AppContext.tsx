import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ActionType, User, Family, Expense, ExpenseCategory } from '../types';

// Create initial demo data
const demoFamily: Family = {
  id: uuidv4(),
  name: 'My Family',
  createdAt: new Date().toISOString(),
  ownerId: '1',
  members: []
};

const demoUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  isAdmin: true,
  familyId: demoFamily.id
};

// Update the demo family with the demo user
demoFamily.members = [demoUser];

// Create demo expenses
const demoExpenses: Expense[] = [
  {
    id: uuidv4(),
    title: 'Grocery Shopping',
    amount: 120.50,
    location: 'Whole Foods',
    date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.FOOD,
    notes: 'Weekly grocery run',
    userId: demoUser.id,
    familyId: demoFamily.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Gas',
    amount: 45.75,
    location: 'Shell',
    date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.TRANSPORTATION,
    userId: demoUser.id,
    familyId: demoFamily.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialState: AppState = {
  currentUser: demoUser,
  currentFamily: demoFamily,
  expenses: demoExpenses,
  families: [demoFamily],
  users: [demoUser]
};

const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload]
      };
    case 'EDIT_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense => 
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
        families: state.families.map(family => 
          family.id === action.payload.familyId 
            ? { ...family, members: [...family.members, action.payload] }
            : family
        )
      };
    case 'EDIT_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
        families: state.families.map(family => 
          family.id === action.payload.familyId 
            ? { 
                ...family, 
                members: family.members.map(member => 
                  member.id === action.payload.id ? action.payload : member
                ) 
              }
            : family
        ),
        currentUser: state.currentUser?.id === action.payload.id 
          ? action.payload 
          : state.currentUser
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        families: state.families.map(family => ({
          ...family,
          members: family.members.filter(member => member.id !== action.payload)
        }))
      };
    case 'ADD_FAMILY':
      return {
        ...state,
        families: [...state.families, action.payload]
      };
    case 'EDIT_FAMILY':
      return {
        ...state,
        families: state.families.map(family => 
          family.id === action.payload.id ? action.payload : family
        ),
        currentFamily: state.currentFamily?.id === action.payload.id 
          ? action.payload 
          : state.currentFamily
      };
    case 'DELETE_FAMILY':
      return {
        ...state,
        families: state.families.filter(family => family.id !== action.payload),
        expenses: state.expenses.filter(expense => expense.familyId !== action.payload),
        currentFamily: state.currentFamily?.id === action.payload 
          ? null 
          : state.currentFamily
      };
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload
      };
    case 'SET_CURRENT_FAMILY':
      return {
        ...state,
        currentFamily: action.payload
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null
});

// Create provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on app initialization
  useEffect(() => {
    const savedData = localStorage.getItem('expenseTrackerData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('expenseTrackerData', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);