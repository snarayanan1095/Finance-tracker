import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User, Family } from '../types';

const LoginPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User, Family } from '../types';

const LoginPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!isLogin && !name.trim()) newErrors.name = 'Name is required';
    if (!isLogin && !familyName.trim()) newErrors.familyName = 'Family name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isLogin) {
      // Try to find the user by email
      const user = state.users.find(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // User found, set as current user
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        
        // Find and set the user's family
        const family = state.families.find(family => family.id === user.familyId);
        if (family) {
          dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
        }
        
        navigate('/');
      } else {
        setErrors({ email: 'User not found. Please check your email or sign up.' });
      }
    } else {
      // Create a new family
      const familyId = uuidv4();
      const userId = uuidv4();
      
      const newUser: User = {
        id: userId,
        name,
        email,
        isAdmin: true,
        familyId
      };
      
      const newFamily: Family = {
        id: familyId,
        name: familyName,
        createdAt: new Date().toISOString(),
        ownerId: userId,
        members: [newUser]
      };
      
      // Add the new family and user
      dispatch({ type: 'ADD_FAMILY', payload: newFamily });
      dispatch({ type: 'ADD_USER', payload: newUser });
      
      // Set the current user and family
      dispatch({ type: 'SET_CURRENT_USER', payload: newUser });
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: newFamily });
      
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-teal-500 p-3 rounded-full">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          FamilyFinance
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin 
            ? 'Sign in to manage your family finances' 
            : 'Create a new account to start tracking expenses'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-gray-700">
                  Family Name
                </label>
                <div className="mt-1">
                  <input
                    id="familyName"
                    name="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.familyName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder="Smith Family"
                  />
                  {errors.familyName && <p className="mt-1 text-sm text-red-500">{errors.familyName}</p>}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to FamilyFinance?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isLogin ? 'Create a new account' : 'Sign in with existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!isLogin && !name.trim()) newErrors.name = 'Name is required';
    if (!isLogin && !familyName.trim()) newErrors.familyName = 'Family name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isLogin) {
      // Try to find the user by email
      const user = state.users.find(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // User found, set as current user
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        
        // Find and set the user's family
        const family = state.families.find(family => family.id === user.familyId);
        if (family) {
          dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
        }
        
        navigate('/');
      } else {
        setErrors({ email: 'User not found. Please check your email or sign up.' });
      }
    } else {
      // Create a new family
      const familyId = uuidv4();
      const userId = uuidv4();
      
      const newUser: User = {
        id: userId,
        name,
        email,
        isAdmin: true,
        familyId
      };
      
      const newFamily: Family = {
        id: familyId,
        name: familyName,
        createdAt: new Date().toISOString(),
        ownerId: userId,
        members: [newUser]
      };
      
      // Add the new family and user
      dispatch({ type: 'ADD_FAMILY', payload: newFamily });
      dispatch({ type: 'ADD_USER', payload: newUser });
      
      // Set the current user and family
      dispatch({ type: 'SET_CURRENT_USER', payload: newUser });
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: newFamily });
      
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-teal-500 p-3 rounded-full">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          FamilyFinance
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin 
            ? 'Sign in to manage your family finances' 
            : 'Create a new account to start tracking expenses'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-gray-700">
                  Family Name
                </label>
                <div className="mt-1">
                  <input
                    id="familyName"
                    name="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.familyName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder="Smith Family"
                  />
                  {errors.familyName && <p className="mt-1 text-sm text-red-500">{errors.familyName}</p>}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to FamilyFinance?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isLogin ? 'Create a new account' : 'Sign in with existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
