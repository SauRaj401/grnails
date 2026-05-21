import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdxWME-_kttSrmhX0gIw1OTe-2nf1SyM8",
  authDomain: "grnails-cf63b.firebaseapp.com",
  projectId: "grnails-cf63b",
  storageBucket: "grnails-cf63b.firebasestorage.app",
  messagingSenderId: "204017962825",
  appId: "1:204017962825:web:385d389734398c6a229498",
  measurementId: "G-EET6PJHTG6",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
