import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Copy, Check } from 'lucide-react';
import { createFamilyWithMember, joinFamilyByCode } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../utils/helpers';

const FamilyPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser: firebaseUser } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleCopyCode = () => {
    if (state.currentFamily?.joinCode) {
      navigator.clipboard.writeText(state.currentFamily.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    }
  };

  const handleCopyId = () => {
    if (state.currentFamily?.id) {
      navigator.clipboard.writeText(state.currentFamily.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!familyName.trim() || !firebaseUser) return;
    setCreating(true);
    try {
      const family = await createFamilyWithMember(
        {
          name: familyName.trim(),
          ownerId: firebaseUser.uid,
          defaultCurrency: currency,
        },
        {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || 'User',
          email: firebaseUser.email,
        }
      );
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
      setFamilyName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create family.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!joinCode.trim() || !firebaseUser) return;
    setJoining(true);
    try {
      const family = await joinFamilyByCode(joinCode.trim(), {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || 'User',
        email: firebaseUser.email,
      });
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
      setJoinCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to join family.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-[#18181b] min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Family Information</h1>
      {state.currentFamily ? (
        <div className="space-y-4">
          <div className="bg-[#23272f] shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#f3f4f6] mb-2">Join Code</h2>
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono bg-[#1e293b] px-3 py-2 rounded text-white">{state.currentFamily.joinCode}</span>
              <button
                onClick={handleCopyCode}
                className="ml-4 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center"
              >
                {copiedCode ? (
                  <>
                    <Check size={16} className="mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-1" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#23272f] bg-opacity-90 shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-2 text-white">Family Members</h2>
            <ul>
              {state.currentFamily?.members.map(member => (
                <li key={member.id} className="py-2 border-b border-[#23272f] last:border-b-0 flex flex-col sm:flex-row sm:items-center sm:justify-between text-white">
                  <span>
                    <span className="font-medium text-white">{member.name}</span>
                    <span className="ml-2 text-[#a1a1aa] text-sm">{member.email}</span>
                  </span>
                  {member.id === state.currentFamily?.ownerId && (
                    <span className="ml-2 text-xs bg-teal-700 text-white px-2 py-0.5 rounded">Owner</span>
                  )}
                  {member.isAdmin && member.id !== state.currentFamily?.ownerId && (
                    <span className="ml-2 text-xs bg-blue-700 text-white px-2 py-0.5 rounded">Admin</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-[#a1a1aa]">
              Family ID: <span className="font-mono">{state.currentFamily.id}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-[#23272f] shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#f3f4f6] mb-4">Create a Family</h2>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f3f4f6] mb-1">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter family name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#f3f4f6] mb-1">Currency</label>
                <select
                  value={currency.code}
                  onChange={e => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
                  className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:bg-teal-300"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Family'}
              </button>
            </form>
          </div>

          <div className="bg-[#23272f] shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#f3f4f6] mb-4">Join a Family</h2>
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f3f4f6] mb-1">Family Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-[#1e293b] bg-[#18181b] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter join code"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Family'}
              </button>
            </form>
          </div>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default FamilyPage;