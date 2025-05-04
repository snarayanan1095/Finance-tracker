import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AppState, ActionType } from '../types';
import {
  getUser,
  getFamily,
  getExpenses,
  subscribeToFamily,
  subscribeToExpenses
} from '../services/firebase';

const initialState: AppState = {
  currentUser: null,
  currentFamily: null,
  expenses: [],
  families: [],
  users: [],
  loading: false
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null
});

const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload
      };
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
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'EDIT_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'SET_FAMILIES':
      return {
        ...state,
        families: action.payload
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
        currentFamily: state.currentFamily?.id === action.payload.id ? action.payload : state.currentFamily
      };
    case 'DELETE_FAMILY':
      return {
        ...state,
        families: state.families.filter(family => family.id !== action.payload)
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { currentUser: authUser } = useAuth();

  // Load initial data when auth user changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!authUser) {
        dispatch({ type: 'LOAD_DATA', payload: initialState });
        return;
      }

      try {
        // Get user data
        const userData = await getUser(authUser.uid);
        if (!userData) return;

        dispatch({ type: 'SET_CURRENT_USER', payload: userData });

        // Get family data
        const familyData = await getFamily(userData.familyId);
        if (!familyData) return;

        dispatch({ type: 'SET_CURRENT_FAMILY', payload: familyData });

        // Get expenses
        const expenses = await getExpenses(userData.familyId);
        dispatch({ type: 'SET_EXPENSES', payload: expenses });

      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [authUser]);

  // Subscribe to real-time updates when family is set
  useEffect(() => {
    if (!state.currentFamily) return;

    const familyUnsubscribe = subscribeToFamily(
      state.currentFamily.id,
      (family) => {
        dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
      },
      (error) => {
        console.error('Family subscription error:', error);
      }
    );

    const expensesUnsubscribe = subscribeToExpenses(
      state.currentFamily.id,
      (expenses) => {
        dispatch({ type: 'SET_EXPENSES', payload: expenses });
      },
      (error) => {
        console.error('Expenses subscription error:', error);
      }
    );

    return () => {
      familyUnsubscribe();
      expensesUnsubscribe();
    };
  }, [state.currentFamily?.id]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
