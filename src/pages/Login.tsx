import React, { useState } from 'react';
import { DollarSign, Home, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { User, Family } from '../types';
import { CURRENCIES } from '../utils/helpers';

const LoginPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [joinFamilyId, setJoinFamilyId] = useState('');
  const [isJoiningFamily, setIsJoiningFamily] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!isLogin) {
      if (!name.trim()) newErrors.name = 'Name is required';
      if (!isJoiningFamily && !familyName.trim()) newErrors.familyName = 'Family name is required';
      if (isJoiningFamily && !joinFamilyId.trim()) newErrors.joinFamilyId = 'Family ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user's family information
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          // User exists, navigate to home
          navigate('/');
        } else {
          setErrors({ email: 'User data not found. Please try again.' });
        }
      } else {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with name
        await updateProfile(user, { displayName: name });

        let familyRef;
        if (isJoiningFamily) {
          // Join existing family
          const familiesRef = collection(db, 'families');
          const q = query(familiesRef, where('id', '==', joinFamilyId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            familyRef = querySnapshot.docs[0].ref;
            // Update family members
            await updateDoc(familyRef, {
              memberIds: [...querySnapshot.docs[0].data().memberIds, user.uid],
              updatedAt: serverTimestamp()
            });
          } else {
            throw new Error('Family not found');
          }
        } else {
          // Create new family
          const familyData = {
            name: familyName,
            ownerId: user.uid,
            memberIds: [user.uid],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            defaultCurrency: CURRENCIES[0]
          };
          familyRef = await addDoc(collection(db, 'families'), familyData);
        }

        // Create user document
        const userData = {
          id: user.uid,
          name,
          email: user.email,
          isAdmin: !isJoiningFamily, // Only admin if creating new family
          familyId: familyRef.id,
          currency: CURRENCIES[0],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'users'), userData);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered. Please sign in instead.' });
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrors({ email: 'Invalid email or password.' });
      } else if (error.message === 'Family not found') {
        setErrors({ joinFamilyId: 'Family not found. Please check the Family ID.' });
      } else {
        setErrors({ email: 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const Logo = () => (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <div className="absolute inset-0 bg-teal-500 rounded-full blur-lg opacity-50"></div>
        <div className="relative bg-gradient-to-br from-teal-400 to-teal-600 p-4 rounded-full shadow-xl">
          <Wallet className="h-12 w-12 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mt-4">Family Finance</h1>
      <p className="text-gray-400 text-sm">Track, manage, and share expenses together</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsJoiningFamily(!isJoiningFamily)}
                    className="text-sm text-teal-400 hover:text-teal-300"
                  >
                    {isJoiningFamily ? 'Create new family' : 'Join existing family'}
                  </button>
                </div>

                {isJoiningFamily ? (
                  <div>
                    <label htmlFor="joinFamilyId" className="block text-sm font-medium text-gray-200">
                      Family ID
                    </label>
                    <div className="mt-1">
                      <input
                        id="joinFamilyId"
                        name="joinFamilyId"
                        type="text"
                        required
                        value={joinFamilyId}
                        onChange={(e) => setJoinFamilyId(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                      {errors.joinFamilyId && (
                        <p className="mt-2 text-sm text-red-400">{errors.joinFamilyId}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="familyName" className="block text-sm font-medium text-gray-200">
                      Family Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="familyName"
                        name="familyName"
                        type="text"
                        required
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                      {errors.familyName && (
                        <p className="mt-2 text-sm text-red-400">{errors.familyName}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setIsJoiningFamily(false);
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500"
              >
                {isLogin ? 'Create a new account' : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
