import firebase from 'firebase';

// Your web app's Firebase configuration
// Replace these with your Firebase project configuration
const firebaseConfig = {
    apiKey: 'AIzaSyAvIO6A8WjL5CpADaVaOhl6ujNj2wwRiW0',
    authDomain: 'finance-tracker-b7ae8.firebaseapp.com',
    projectId: 'finance-tracker-b7ae8',
    storageBucket: 'finance-tracker-b7ae8.appspot.com',
    messagingSenderId: '870365046438',
    appId: '1:870365046438:web:234119fa5dfe49ac173667',
    measurementId: 'G-Z34N6N2YZX'
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();

export default app; 