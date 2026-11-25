import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCfkSDZu41FQc8a-h0gxZrUgZpMllz01_g',
  authDomain: 'enganement-6a822.firebaseapp.com',
  projectId: 'enganement-6a822',
  storageBucket: 'enganement-6a822.firebasestorage.app',
  messagingSenderId: '624768352040',
  appId: '1:624768352040:web:67a79a7ed05304898bda1d',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
