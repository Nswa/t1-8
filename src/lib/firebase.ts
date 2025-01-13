import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
    apiKey: "AIzaSyAKC7-cMMvDDfyyM2bV0-wHePePzfCUoRo",
    authDomain: "genesis-9986f.firebaseapp.com",
    projectId: "genesis-9986f",
    storageBucket: "genesis-9986f.firebasestorage.app",
    messagingSenderId: "108977786773",
    appId: "1:108977786773:web:bde30987154e827892309c",
    measurementId: "G-K5DQSCK1GS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
}

const firebaseAuth = getAuth(firebaseApp);

export { firebaseApp, firebaseAuth };