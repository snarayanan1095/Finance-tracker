import React, { useState } from 'react';
import { UserPlus, Trash2, Mail } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';

const FamilyMembers: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    isAdmin: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const family = state.currentFamily;
  
  if (!family) return null;

  const members = family.members || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newMember.name.trim()) newErrors.name = 'Name is required';
    if (!newMember.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newMember.email)) newErrors.email = 'Email is invalid';
    
    // Check if email already exists
    if (
      newMember.email && 
      !newErrors.email && 
      members.some(member => member.email.toLowerCase() === newMember.email.toLowerCase())
    ) {
      newErrors.email = 'A member with this email already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newUser: User = {
      id: uuidv4(),
      name: newMember.name,
      email: newMember.email,
      isAdmin: newMember.isAdmin,
      familyId: family.id
    };
    
    dispatch({ type: 'ADD_USER', payload: newUser });
    
    // Reset form
    setNewMember({
      name: '',
      email: '',
      isAdmin: false
    });
    setShowAddMember(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (members.length <= 1) {
      alert("You can't remove the last member of a family.");
      return;
    }
    
    if (memberId === state.currentUser?.id) {
      alert("You can't remove yourself.");
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this member?')) {
      dispatch({ type: 'DELETE_USER', payload: memberId });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Family Members</h2>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
        >
          <UserPlus size={20} className="mr-1" />
          <span>Add Member</span>
        </button>
      </div>
      
      {showAddMember && (
        <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newMember.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newMember.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                checked={newMember.isAdmin}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded"
              />
              <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                Make admin (can manage family settings)
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>
      )}
      
      <div className="space-y-3">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {member.name}
                  {member.id === state.currentUser?.id && (
                    <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {member.isAdmin && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Mail size={14} className="mr-1" />
                  {member.email}
                </div>
              </div>
            </div>
            
            {state.currentUser?.isAdmin && member.id !== state.currentUser?.id && (
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove member"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMembers;