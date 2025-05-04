import firebase from 'firebase';
import { auth, db } from '../config/firebase';
import {
  FirestoreExpense,
  FirestoreUser,
  FirestoreFamily,
  Expense,
  User,
  Family,
  Currency
} from '../types';

// Helper functions to convert between Firestore and App types
const convertFirestoreTimestampToString = (timestamp: firebase.firestore.Timestamp): string => {
  return timestamp.toDate().toISOString();
};

const convertExpenseFromFirestore = (doc: FirestoreExpense): Expense => ({
  ...doc,
  date: convertFirestoreTimestampToString(doc.date),
  createdAt: convertFirestoreTimestampToString(doc.createdAt),
  updatedAt: convertFirestoreTimestampToString(doc.updatedAt)
});

const convertUserFromFirestore = (doc: FirestoreUser): User => ({
  ...doc,
  createdAt: convertFirestoreTimestampToString(doc.createdAt),
  updatedAt: convertFirestoreTimestampToString(doc.updatedAt)
});

const convertFamilyFromFirestore = async (doc: FirestoreFamily): Promise<Family> => {
  if (!doc.id) {
    throw new Error('Family document is missing an id. Please notify shwethasogathur@gmail.com.');
  }
  // Fetch all users for this family
  const usersQuery = db.collection('users').where('familyId', '==', doc.id);
  const usersSnapshot = await usersQuery.get();
  const users = usersSnapshot.docs.map(userDoc => convertUserFromFirestore(userDoc.data() as FirestoreUser));

  return {
    ...doc,
    createdAt: convertFirestoreTimestampToString(doc.createdAt),
    updatedAt: convertFirestoreTimestampToString(doc.updatedAt),
    members: users
  };
};

// Auth operations
export const signIn = async (email: string, password: string) => {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  if (!userCredential.user) {
    throw new Error('Authentication failed');
  }
  return userCredential.user;
};

export const signUp = async (email: string, password: string, displayName: string) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  if (!userCredential.user) {
    throw new Error('User creation failed');
  }
  await userCredential.user.updateProfile({ displayName });
  return userCredential.user;
};

export const signOut = async () => {
  await auth.signOut();
};

// User operations
export const getUser = async (userId: string): Promise<User | null> => {
  const userQuery = db.collection('users').where('id', '==', userId);
  const userSnapshot = await userQuery.get();
  
  if (userSnapshot.empty) return null;
  
  return convertUserFromFirestore(userSnapshot.docs[0].data() as FirestoreUser);
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const userQuery = db.collection('users').where('id', '==', userId);
  const userSnapshot = await userQuery.get();
  
  if (userSnapshot.empty) throw new Error('User not found');
  
  const userDoc = userSnapshot.docs[0];
  await userDoc.ref.update({
    ...updates,
    updatedAt: firebase.firestore.Timestamp.now()
  });

  const updatedUser = await userDoc.ref.get();
  return convertUserFromFirestore(updatedUser.data() as FirestoreUser);
};

// Family operations
export const createFamily = async (familyData: Omit<FirestoreFamily, 'createdAt' | 'updatedAt'>): Promise<Family> => {
  const familyDoc = await db.collection('families').add({
    ...familyData,
    createdAt: firebase.firestore.Timestamp.now(),
    updatedAt: firebase.firestore.Timestamp.now()
  });

  const newFamily = await familyDoc.get();
  const data = newFamily.data() as FirestoreFamily;
  data.id = newFamily.id;
  return convertFamilyFromFirestore(data);
};

export const getFamily = async (familyId: string): Promise<Family | null> => {
  const familyDoc = await db.collection('families').doc(familyId).get();
  if (!familyDoc.exists) return null;
  // Add the document ID to the data object
  const data = familyDoc.data() as FirestoreFamily;
  data.id = familyDoc.id;
  return convertFamilyFromFirestore(data);
};

export const updateFamily = async (familyId: string, updates: Partial<FirestoreFamily>): Promise<Family> => {
  const familyRef = db.collection('families').doc(familyId);
  await familyRef.update({
    ...updates,
    updatedAt: firebase.firestore.Timestamp.now()
  });

  const updatedFamily = await familyRef.get();
  return convertFamilyFromFirestore(updatedFamily.data() as FirestoreFamily);
};

// Expense operations
export const createExpense = async (expenseData: Omit<FirestoreExpense, 'createdAt' | 'updatedAt'>): Promise<Expense> => {
  const expenseDoc = await db.collection('expenses').add({
    ...expenseData,
    createdAt: firebase.firestore.Timestamp.now(),
    updatedAt: firebase.firestore.Timestamp.now()
  });

  const newExpense = await expenseDoc.get();
  return convertExpenseFromFirestore(newExpense.data() as FirestoreExpense);
};

export const getExpenses = async (familyId: string): Promise<Expense[]> => {
  const expensesQuery = db.collection('expenses')
    .where('familyId', '==', familyId)
    .orderBy('date', 'desc');
  
  const expensesSnapshot = await expensesQuery.get();
  return expensesSnapshot.docs.map(doc => 
    convertExpenseFromFirestore(doc.data() as FirestoreExpense)
  );
};

export const updateExpense = async (expenseId: string, updates: Partial<FirestoreExpense>): Promise<Expense> => {
  const expenseRef = db.collection('expenses').doc(expenseId);
  await expenseRef.update({
    ...updates,
    updatedAt: firebase.firestore.Timestamp.now()
  });

  const updatedExpense = await expenseRef.get();
  return convertExpenseFromFirestore(updatedExpense.data() as FirestoreExpense);
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  await db.collection('expenses').doc(expenseId).delete();
};

// Real-time listeners
export const subscribeToFamily = (
  familyId: string,
  onUpdate: (family: Family) => void,
  onError: (error: Error) => void
) => {
  const familyRef = db.collection('families').doc(familyId);
  return familyRef.onSnapshot(
    async (snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data() as FirestoreFamily;
        data.id = snapshot.id;
        const family = await convertFamilyFromFirestore(data);
        onUpdate(family);
      }
    },
    onError
  );
};

export const subscribeToExpenses = (
  familyId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError: (error: Error) => void
) => {
  const expensesQuery = db.collection('expenses')
    .where('familyId', '==', familyId)
    .orderBy('date', 'desc');
  
  return expensesQuery.onSnapshot(
    (snapshot) => {
      const expenses = snapshot.docs.map(doc => 
        convertExpenseFromFirestore(doc.data() as FirestoreExpense)
      );
      onUpdate(expenses);
    },
    onError
  );
};

// Firestore operations
export const createUserDocument = async (userData: {
  id: string;
  name: string;
  email: string | null;
  isAdmin: boolean;
  familyId: string;
  currency: Currency;
}) => {
  if (!userData.email) throw new Error('User email is required');
  // Check for existing user with this email
  const existing = await db.collection('users').where('email', '==', userData.email).get();
  if (!existing.empty) {
    // Update the first found user document
    const docRef = existing.docs[0].ref;
    await docRef.update({
      ...userData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef;
  }
  // Otherwise, create new user doc with UID
  const userRef = db.collection('users').doc(userData.id);
  await userRef.set({
    ...userData,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return userRef;
};

function generateFamilyCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createFamilyWithMember = async (familyData: {
  name: string;
  ownerId: string;
  defaultCurrency: Currency;
}, userData: {
  id: string;
  name: string;
  email: string | null;
}) => {
  if (!familyData.name || !familyData.ownerId || !familyData.defaultCurrency) {
    throw new Error('Invalid family data. Please notify shwethasogathur@gmail.com.');
  }
  if (!userData.id || !userData.name) {
    throw new Error('Invalid user data for family creation. Please notify shwethasogathur@gmail.com.');
  }
  const joinCode = generateFamilyCode();
  // Create family document
  const familyRef = await db.collection('families').add({
    name: familyData.name,
    ownerId: familyData.ownerId,
    memberIds: [familyData.ownerId],
    defaultCurrency: familyData.defaultCurrency,
    joinCode,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Create user document
  await createUserInFamily({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    isAdmin: true,
    familyId: familyRef.id,
    currency: familyData.defaultCurrency
  });

  // Get the complete family data
  const familyDoc = await familyRef.get();
  const familyDataObj = familyDoc.data() as FirestoreFamily;
  if (!familyDataObj) {
    throw new Error('Failed to fetch created family document. Please notify shwethasogathur@gmail.com.');
  }
  familyDataObj.id = familyRef.id;
  return convertFamilyFromFirestore(familyDataObj);
};

export const createFamilyDocument = async (familyData: {
  name: string;
  ownerId: string;
  memberIds: string[];
  defaultCurrency: Currency;
}) => {
  const joinCode = generateFamilyCode();
  const familyRef = await db.collection('families').add({
    ...familyData,
    joinCode,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return familyRef;
};

export const updateFamilyMembers = async (familyId: string, userId: string) => {
  const familyRef = db.collection('families').doc(familyId);
  await familyRef.update({
    memberIds: firebase.firestore.FieldValue.arrayUnion(userId),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return familyRef;
};

// Helper function to convert Firestore timestamps to ISO strings
export const convertTimestamp = (timestamp: firebase.firestore.Timestamp) => {
  return timestamp.toDate().toISOString();
};

export const createUserInFamily = async (userData: {
  id: string;
  name: string;
  email: string | null;
  isAdmin: boolean;
  familyId: string;
  currency: Currency;
}) => {
  if (!userData.email) throw new Error('User email is required');
  // Check for existing user with this email
  const existing = await db.collection('users').where('email', '==', userData.email).get();
  if (!existing.empty) {
    // Update the first found user document
    const docRef = existing.docs[0].ref;
    await docRef.update({
      ...userData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef;
  }
  // Otherwise, create new user doc with UID
  const userRef = db.collection('users').doc(userData.id);
  await userRef.set({
    ...userData,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return userRef;
};

export const joinExistingFamily = async (familyId: string, userData: {
  id: string;
  name: string;
  email: string | null;
}) => {
  if (!familyId) {
    throw new Error('Family ID is required to join a family. Please notify shwethasogathur@gmail.com.');
  }
  if (!userData.id || !userData.name) {
    throw new Error('Invalid user data for joining family. Please notify shwethasogathur@gmail.com.');
  }
  // Check if family exists
  const familyRef = db.collection('families').doc(familyId);
  const familyDoc = await familyRef.get();
  
  if (!familyDoc.exists) {
    throw new Error('Family not found');
  }

  const familyData = familyDoc.data() as FirestoreFamily;
  if (!familyData) {
    throw new Error('Family data is invalid. Please notify shwethasogathur@gmail.com.');
  }
  familyData.id = familyId;

  // Add user to family
  await familyRef.update({
    memberIds: firebase.firestore.FieldValue.arrayUnion(userData.id),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Create user document
  await createUserInFamily({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    isAdmin: false,
    familyId: familyId,
    currency: familyData.defaultCurrency
  });

  // Get the updated family data
  const updatedFamilyDoc = await familyRef.get();
  const updatedFamilyData = updatedFamilyDoc.data() as FirestoreFamily;
  if (!updatedFamilyData) {
    throw new Error('Failed to fetch updated family document. Please notify shwethasogathur@gmail.com.');
  }
  updatedFamilyData.id = familyId;
  return convertFamilyFromFirestore(updatedFamilyData);
};

export const joinFamilyByCode = async (joinCode: string, userData: {
  id: string;
  name: string;
  email: string | null;
}) => {
  if (!joinCode) {
    throw new Error('Family code is required to join a family. Please notify shwethasogathur@gmail.com.');
  }
  if (!userData.id || !userData.name) {
    throw new Error('Invalid user data for joining family. Please notify shwethasogathur@gmail.com.');
  }
  // Find the family by joinCode
  const familyQuery = await db.collection('families').where('joinCode', '==', joinCode).get();
  if (familyQuery.empty) {
    throw new Error('Family not found with this code.');
  }
  const familyDoc = familyQuery.docs[0];
  const familyData = familyDoc.data() as FirestoreFamily;
  if (!familyData) {
    throw new Error('Family data is invalid. Please notify shwethasogathur@gmail.com.');
  }
  familyData.id = familyDoc.id;

  // Add user to family
  await familyDoc.ref.update({
    memberIds: firebase.firestore.FieldValue.arrayUnion(userData.id),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Create user document
  await createUserInFamily({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    isAdmin: false,
    familyId: familyDoc.id,
    currency: familyData.defaultCurrency
  });

  // Get the updated family data
  const updatedFamilyDoc = await familyDoc.ref.get();
  const updatedFamilyData = updatedFamilyDoc.data() as FirestoreFamily;
  if (!updatedFamilyData) {
    throw new Error('Failed to fetch updated family document. Please notify shwethasogathur@gmail.com.');
  }
  updatedFamilyData.id = familyDoc.id;
  return convertFamilyFromFirestore(updatedFamilyData);
}; 