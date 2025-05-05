import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, createUserDocument, createFamilyDocument, updateFamilyMembers } from '../services/firebase';
import { CURRENCIES } from '../utils/helpers';

const LoginPage: React.FC = () => {
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
        await signIn(email, password);
        
        // After sign in, just navigate to home (user data will be loaded by context)
        navigate('/');
      } else {
        // Create new account
        const user = await signUp(email, password, name);

        let familyRef;
        if (isJoiningFamily) {
          // Join existing family
          familyRef = await updateFamilyMembers(joinFamilyId, user.uid);
        } else {
          // Create new family
          familyRef = await createFamilyDocument({
            name: familyName,
            ownerId: user.uid,
            memberIds: [user.uid],
            defaultCurrency: CURRENCIES[0]
          });
        }

        // Create user document
        await createUserDocument({
          id: user.uid,
          name,
          email: user.email,
          isAdmin: !isJoiningFamily, // Only admin if creating new family
          familyId: familyRef.id,
          currency: CURRENCIES[0]
        });

        navigate('/');
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const err = error as any;
      const errorMsg = `Please notify shwethasogathur@gmail.com. Error: ${err && err.message ? err.message : err}`;
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: `This email is already registered. Please sign in instead. ${errorMsg}` });
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrors({ email: `Invalid email or password. ${errorMsg}` });
      } else if (err.message === 'Family not found') {
        setErrors({ joinFamilyId: `Family not found. Please check the Family ID. ${errorMsg}` });
      } else {
        setErrors({ email: `An error occurred. ${errorMsg}` });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          src="/family-finance-logo.png"
          alt="Family Finance Logo"
          className="mx-auto mb-4 w-24 h-24"
        />
        <h1 className="text-2xl font-bold text-white text-center">Family Finance</h1>
        <p className="text-gray-400 text-sm text-center mb-4">Track, manage, and share expenses together</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#23272f] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#f3f4f6]">
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
                    className="appearance-none block w-full px-3 py-2 border border-[#1e293b] rounded-md shadow-sm placeholder-[#a1a1aa] bg-[#18181b] text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#f3f4f6]">
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
                  className="appearance-none block w-full px-3 py-2 border border-[#1e293b] rounded-md shadow-sm placeholder-[#a1a1aa] bg-[#18181b] text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#f3f4f6]">
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
                  className="appearance-none block w-full px-3 py-2 border border-[#1e293b] rounded-md shadow-sm placeholder-[#a1a1aa] bg-[#18181b] text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                    className="text-sm text-orange-400 hover:text-orange-300"
                  >
                    {isJoiningFamily ? 'Create new family' : 'Join existing family'}
                  </button>
                </div>

                {isJoiningFamily ? (
                  <div>
                    <label htmlFor="joinFamilyId" className="block text-sm font-medium text-[#f3f4f6]">
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
                        className="appearance-none block w-full px-3 py-2 border border-[#1e293b] rounded-md shadow-sm placeholder-[#a1a1aa] bg-[#18181b] text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                      {errors.joinFamilyId && (
                        <p className="mt-2 text-sm text-red-400">{errors.joinFamilyId}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="familyName" className="block text-sm font-medium text-[#f3f4f6]">
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
                        className="appearance-none block w-full px-3 py-2 border border-[#1e293b] rounded-md shadow-sm placeholder-[#a1a1aa] bg-[#18181b] text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-800 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1e293b]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#23272f] text-[#a1a1aa]">
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
                className="w-full flex justify-center py-2 px-4 border border-[#1e293b] rounded-md shadow-sm text-sm font-medium text-[#f3f4f6] bg-[#23272f] hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#18181b] focus:ring-orange-500"
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
