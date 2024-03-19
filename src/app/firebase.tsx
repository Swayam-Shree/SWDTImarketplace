// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBPRwgZ7WhdSBO9jHQXBiaQ1mL6d1C4xMY",
  authDomain: "swdtimarketplace.firebaseapp.com",
  projectId: "swdtimarketplace",
  storageBucket: "swdtimarketplace.appspot.com",
  messagingSenderId: "330800308284",
  appId: "1:330800308284:web:b1e8c00aa653d4b391e339"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);