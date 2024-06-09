// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4l90QEb86PCNBmC5RHGPDXUhF_ddus4w",
  authDomain: "discusteam-294e5.firebaseapp.com",
  projectId: "discusteam-294e5",
  storageBucket: "discusteam-294e5.appspot.com",
  messagingSenderId: "74485087276",
  appId: "1:74485087276:web:7e3a968febdfe72ef26589",
  measurementId: "G-MQRY9NNBG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app)

export const db = getFirestore(app);