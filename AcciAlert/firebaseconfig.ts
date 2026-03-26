import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAi6tdoRIjagl7jOrAHw6Sd_K_vz8pH1ZI",
  authDomain: "accialert-289dd.firebaseapp.com",
  projectId: "accialert-289dd",
  storageBucket: "accialert-289dd.firebasestorage.app",
  messagingSenderId: "979292157192",
  appId: "1:979292157192:web:e8a8325b03251dea9be8bd",
  measurementId: "G-Q6K3VYXB93"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);  // ✅ default persistence
export const db = getFirestore(app);
export default app;