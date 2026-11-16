import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Web app configuration. These values identify the Firebase project;
// authorization must be enforced with Firebase Authentication and Firestore Rules.
const firebaseConfig = {
  apiKey: "AIzaSyDD4RgD-VekKiQfQ8Pqv-JVuN3iggVSGWQ",
  authDomain: "football-dynasty-864f2.firebaseapp.com",
  projectId: "football-dynasty-864f2",
  storageBucket: "football-dynasty-864f2.firebasestorage.app",
  messagingSenderId: "22080766462",
  appId: "1:22080766462:web:c1e83a17d598c7359b80af",
  measurementId: "G-T5X12RTM9R",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
