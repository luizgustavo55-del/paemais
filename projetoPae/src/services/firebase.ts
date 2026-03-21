import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBwK29KzyIGLSE14ZIkq_KgsTtbXx8waVs",
  authDomain: "paemais.firebaseapp.com",
  databaseURL: "https://paemais-default-rtdb.firebaseio.com",
  projectId: "paemais",
  storageBucket: "paemais.firebasestorage.app",
  messagingSenderId: "306902344153",
  appId: "1:306902344153:web:fd89954e92f81cf7f179c8",
  measurementId: "G-H6PHSKS16K"
};

const app = initializeApp(firebaseConfig);

// 🔐 AUTH
export const auth = getAuth(app);

// 🔥 REALTIME DATABASE
export const db = getDatabase(app);

// ☁️ FIRESTORE (NOVO)
export const firestore = getFirestore(app);

// 📦 STORAGE (NOVO - upload de arquivos)
export const storage = getStorage(app);