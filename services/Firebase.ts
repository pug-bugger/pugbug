// services/Firebase.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCWOEgyV9Q3EucxQIcnTZdrqLVSXKd9Hjs",
    authDomain: "pugbug-b9b4f.firebaseapp.com",
    projectId: "pugbug-b9b4f",
    storageBucket: "pugbug-b9b4f.firebasestorage.app",
    messagingSenderId: "794777771004",
    appId: "1:794777771004:web:a53d14991423ab0a447079"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
export const db = getFirestore(app);
