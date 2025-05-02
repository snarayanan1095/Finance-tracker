import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { User as AppUser } from '../../types';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  arrayRemove,
  arrayUnion,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const FamilyMembers: React.FC = () => {
  const { currentFamily, setCurrentFamily } = useAppContext();
  const { currentUser: firebaseUser } = useAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    isAdmin: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingMember, setInvitingMember] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Load the current user's full profile from Firestore
    const loadCurrentUser = async () => {
      if (!firebaseUser) {
        setCurrentUser(null);
        return;
      }

      try {
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('id', '==', firebaseUser.uid)
        ));

        if (!userDoc.empty) {
          setCurrentUser({
            id: userDoc.docs[0].id,
            ...userDoc.docs[0].data()
          } as AppUser);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, [firebaseUser]);

  useEffect(() => {
    loadMembers();
  }, [currentFamily]);

  const loadMembers = async () => {
    if (!currentFamily) return;

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('familyId', '==', currentFamily.id));
      const querySnapshot = await getDocs(q);
      
      const loadedMembers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppUser[];

      setMembers(loadedMembers);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFamily || !currentUser) return;
    
    if (!validateForm()) return;

    try {
      setInvitingMember(true);

      // Create invitation in Firestore
      const invitationsRef = collection(db, 'invitations');
      await addDoc(invitationsRef, {
        familyId: currentFamily.id,
        familyName: currentFamily.name,
        invitedEmail: newMember.email.toLowerCase(),
        invitedName: newMember.name,
        invitedByUserId: currentUser.id,
        invitedByName: currentUser.name,
        isAdmin: newMember.isAdmin,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Update family with pending invitation
      const familyRef = doc(db, 'families', currentFamily.id);
      await updateDoc(familyRef, {
        pendingInvites: arrayUnion(newMember.email.toLowerCase()),
        updatedAt: serverTimestamp()
      });

      // Reset form
      setNewMember({
        name: '',
        email: '',
        isAdmin: false
      });
      setShowAddMember(false);

      // Show success message
      alert(`Invitation sent to ${newMember.email}`);
    } catch (error) {
      console.error('Error inviting family member:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInvitingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentFamily || !currentUser) return;

    // Check if user has permission to remove members
    if (!currentUser.isAdmin && currentUser.id !== currentFamily.ownerId) {
      alert("You don't have permission to remove members.");
      return;
    }

    if (members.length <= 1) {
      alert("You can't remove the last member of a family.");
      return;
    }
    
    if (memberId === currentUser.id) {
      alert("You can't remove yourself. Use the 'Leave Family' option instead.");
      return;
    }

    // Check if trying to remove the owner
    const memberToRemove = members.find(m => m.id === memberId);
    if (memberToRemove && memberToRemove.id === currentFamily.ownerId) {
      alert("You can't remove the family owner.");
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const familyRef = doc(db, 'families', currentFamily.id);
        await updateDoc(familyRef, {
          memberIds: arrayRemove(memberId),
          updatedAt: serverTimestamp()
        });

        // Update the user's familyId
        const userRef = doc(db, 'users', memberId);
        await updateDoc(userRef, {
          familyId: null,
          isAdmin: false,
          updatedAt: serverTimestamp()
        });

        // Reload members
        await loadMembers();
      } catch (error) {
        console.error('Error removing family member:', error);
        alert('Failed to remove member. Please try again.');
      }
    }
  };

  const handleToggleAdmin = async (memberId: string) => {
    if (!currentFamily || !currentUser) return;

    // Only family owner can change admin status
    if (currentUser.id !== currentFamily.ownerId) {
      alert("Only the family owner can change admin status.");
      return;
    }

    // Can't change owner's admin status
    if (memberId === currentFamily.ownerId) {
      alert("Can't change the owner's admin status.");
      return;
    }

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      const userRef = doc(db, 'users', memberId);
      await updateDoc(userRef, {
        isAdmin: !member.isAdmin,
        updatedAt: serverTimestamp()
      });

      // Reload members
      await loadMembers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update admin status. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!currentFamily || !currentUser) return null;
  if (loading) return <div>Loading members...</div>;

  const isOwner = currentUser.id === currentFamily.ownerId;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Family Members</h2>
        {(currentUser.isAdmin || isOwner) && (
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
            disabled={invitingMember}
          >
            <UserPlus size={20} className="mr-1" />
            <span>{invitingMember ? 'Sending Invitation...' : 'Invite Member'}</span>
          </button>
        )}
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
              disabled={invitingMember}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:bg-teal-300"
              disabled={invitingMember}
            >
              {invitingMember ? 'Sending...' : 'Send Invitation'}
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
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {member.name}
                  {member.id === currentFamily.ownerId && (
                    <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                      Owner
                    </span>
                  )}
                  {member.isAdmin && member.id !== currentFamily.ownerId && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isOwner && member.id !== currentFamily.ownerId && (
                <button
                  onClick={() => handleToggleAdmin(member.id)}
                  className="text-gray-600 hover:text-gray-800"
                  title={member.isAdmin ? "Remove admin rights" : "Make admin"}
                >
                  <Mail size={18} />
                </button>
              )}
              {((currentUser.isAdmin && !member.isAdmin) || isOwner) && member.id !== currentUser.id && member.id !== currentFamily.ownerId && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove member"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMembers;