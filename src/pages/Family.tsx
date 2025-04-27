import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FamilyMembers from '../components/Family/FamilyMembers';

const FamilyPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [familyName, setFamilyName] = useState(state.currentFamily?.name || '');
  
  const handleUpdateFamilyName = () => {
    if (!state.currentFamily || !familyName.trim()) return;
    
    const updatedFamily = {
      ...state.currentFamily,
      name: familyName.trim()
    };
    
    dispatch({ type: 'EDIT_FAMILY', payload: updatedFamily });
    setIsEditing(false);
  };
  
  if (!state.currentFamily) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Family</h1>
          <p className="text-gray-500">Manage your family members and settings</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Family Settings</h2>
          {!isEditing && state.currentUser?.isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Settings size={18} className="mr-1" />
              <span>Edit</span>
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Family Name</p>
            {isEditing ? (
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter family name"
                />
                <button
                  onClick={handleUpdateFamilyName}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setFamilyName(state.currentFamily?.name || '');
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-800">{state.currentFamily.name}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Family ID</p>
            <p className="text-gray-800 font-mono bg-gray-50 px-3 py-2 rounded-md">
              {state.currentFamily.id}
            </p>
            <p className="text-xs text-gray-500 mt-1">This is your unique family identifier for sharing</p>
          </div>
        </div>
      </div>
      
      <FamilyMembers />
    </div>
  );
};

export default FamilyPage;