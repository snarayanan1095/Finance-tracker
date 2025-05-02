import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
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
const convertFirestoreTimestampToString = (timestamp: Timestamp): string => {
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
  // Fetch all users for this family
  const usersQuery = query(collection(db, 'users'), where('familyId', '==', doc.id));
  const usersSnapshot = await getDocs(usersQuery);
  const users = usersSnapshot.docs.map(userDoc => convertUserFromFirestore(userDoc.data() as FirestoreUser));

  return {
    ...doc,
    createdAt: convertFirestoreTimestampToString(doc.createdAt),
    updatedAt: convertFirestoreTimestampToString(doc.updatedAt),
    members: users
  };
};

// User operations
export const createUser = async (userData: Omit<FirestoreUser, 'createdAt' | 'updatedAt'>): Promise<User> => {
  const userDoc = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  const newUser = await getDoc(userDoc);
  return convertUserFromFirestore(newUser.data() as FirestoreUser);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userQuery = query(collection(db, 'users'), where('id', '==', userId));
  const userSnapshot = await getDocs(userQuery);
  
  if (userSnapshot.empty) return null;
  
  return convertUserFromFirestore(userSnapshot.docs[0].data() as FirestoreUser);
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const userQuery = query(collection(db, 'users'), where('id', '==', userId));
  const userSnapshot = await getDocs(userQuery);
  
  if (userSnapshot.empty) throw new Error('User not found');
  
  const userDoc = userSnapshot.docs[0];
  await updateDoc(userDoc.ref, {
    ...updates,
    updatedAt: Timestamp.now()
  });

  const updatedUser = await getDoc(userDoc.ref);
  return convertUserFromFirestore(updatedUser.data() as FirestoreUser);
};

// Family operations
export const createFamily = async (familyData: Omit<FirestoreFamily, 'createdAt' | 'updatedAt'>): Promise<Family> => {
  const familyDoc = await addDoc(collection(db, 'families'), {
    ...familyData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  const newFamily = await getDoc(familyDoc);
  return convertFamilyFromFirestore(newFamily.data() as FirestoreFamily);
};

export const getFamily = async (familyId: string): Promise<Family | null> => {
  const familyDoc = await getDoc(doc(db, 'families', familyId));
  if (!familyDoc.exists()) return null;
  
  return convertFamilyFromFirestore(familyDoc.data() as FirestoreFamily);
};

export const updateFamily = async (familyId: string, updates: Partial<FirestoreFamily>): Promise<Family> => {
  const familyRef = doc(db, 'families', familyId);
  await updateDoc(familyRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });

  const updatedFamily = await getDoc(familyRef);
  return convertFamilyFromFirestore(updatedFamily.data() as FirestoreFamily);
};

// Expense operations
export const createExpense = async (expenseData: Omit<FirestoreExpense, 'createdAt' | 'updatedAt'>): Promise<Expense> => {
  const expenseDoc = await addDoc(collection(db, 'expenses'), {
    ...expenseData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  const newExpense = await getDoc(expenseDoc);
  return convertExpenseFromFirestore(newExpense.data() as FirestoreExpense);
};

export const getExpenses = async (familyId: string): Promise<Expense[]> => {
  const expensesQuery = query(
    collection(db, 'expenses'),
    where('familyId', '==', familyId),
    orderBy('date', 'desc')
  );
  
  const expensesSnapshot = await getDocs(expensesQuery);
  return expensesSnapshot.docs.map(doc => 
    convertExpenseFromFirestore(doc.data() as FirestoreExpense)
  );
};

export const updateExpense = async (expenseId: string, updates: Partial<FirestoreExpense>): Promise<Expense> => {
  const expenseRef = doc(db, 'expenses', expenseId);
  await updateDoc(expenseRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });

  const updatedExpense = await getDoc(expenseRef);
  return convertExpenseFromFirestore(updatedExpense.data() as FirestoreExpense);
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  await deleteDoc(doc(db, 'expenses', expenseId));
};

// Real-time listeners
export const subscribeToFamily = (
  familyId: string,
  onUpdate: (family: Family) => void,
  onError: (error: Error) => void
) => {
  const familyRef = doc(db, 'families', familyId);
  return onSnapshot(
    familyRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const family = await convertFamilyFromFirestore(snapshot.data() as FirestoreFamily);
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
  const expensesQuery = query(
    collection(db, 'expenses'),
    where('familyId', '==', familyId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const expenses = snapshot.docs.map(doc => 
        convertExpenseFromFirestore(doc.data() as FirestoreExpense)
      );
      onUpdate(expenses);
    },
    onError
  );
}; 