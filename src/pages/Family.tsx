import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Family, User } from '../types';
import { CURRENCIES } from '../utils/helpers';

// Interface for the Firestore family document
interface FamilyDoc {
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
  defaultCurrency: typeof CURRENCIES[0];
}

const FamilyPage: React.FC = () => {
  const { currentFamily, loading, setCurrentFamily } = useAppContext();
  const { currentUser } = useAuth();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const createFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      // Create the initial family member
      const initialMember: User = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        email: currentUser.email || '',
        isAdmin: true,
        familyId: '',  // Will be updated after family creation
        currency: CURRENCIES[0]
      };

      // Create the family document
      const familyData: FamilyDoc = {
        name: newFamilyName,
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultCurrency: CURRENCIES[0]
      };

      const docRef = await addDoc(collection(db, 'families'), familyData);
      
      // Create the Family object with the member
      const newFamily: Family = {
        id: docRef.id,
        name: familyData.name,
        ownerId: familyData.ownerId,
        members: [initialMember],
        createdAt: familyData.createdAt,
        defaultCurrency: familyData.defaultCurrency
      };

      setCurrentFamily(newFamily);
      setNewFamilyName('');
      setError('');
    } catch (err) {
      setError('Failed to create family');
      console.error('Error creating family:', err);
    }
  };

  const joinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const familyRef = doc(db, 'families', joinCode);
      await updateDoc(familyRef, {
        memberIds: arrayUnion(currentUser.uid),
        updatedAt: new Date().toISOString()
      });

      // Fetch the updated family data
      const familyDoc = await getDoc(familyRef);
      if (familyDoc.exists()) {
        const familyData = familyDoc.data() as FamilyDoc;
        
        // Create the current user object
        const member: User = {
          id: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email || '',
          isAdmin: false,
          familyId: familyDoc.id,
          currency: familyData.defaultCurrency
        };

        // Create the Family object
        const family: Family = {
          id: familyDoc.id,
          name: familyData.name,
          ownerId: familyData.ownerId,
          members: [member], // We only add the current user for now
          createdAt: familyData.createdAt,
          defaultCurrency: familyData.defaultCurrency
        };

        setCurrentFamily(family);
      }

      setJoinCode('');
      setError('');
    } catch (err) {
      setError('Failed to join family. Please check the family code.');
      console.error('Error joining family:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Family Management</h1>

      {currentFamily ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Family</h2>
          <div className="mb-4">
            <p className="text-gray-600">Name: {currentFamily.name}</p>
            <p className="text-gray-600">Family ID: {currentFamily.id}</p>
            <p className="text-gray-600">Members: {currentFamily.members.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Share this Family ID with family members:</p>
            <p className="text-lg font-mono mt-2">{currentFamily.id}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Create Family Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Family</h2>
            <form onSubmit={createFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Family Name
                </label>
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Family
              </button>
            </form>
          </div>

          {/* Join Family Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Join Existing Family</h2>
            <form onSubmit={joinFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Family Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Join Family
              </button>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FamilyPage;