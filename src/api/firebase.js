import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlpFXHbXF3uizXZejB6ny4R5o3kanNpwc",
  authDomain: "stud-teacher-appoint-booking.firebaseapp.com",
  databaseURL: "https://stud-teacher-appoint-booking-default-rtdb.firebaseio.com",
  projectId: "stud-teacher-appoint-booking",
  storageBucket: "stud-teacher-appoint-booking.firebasestorage.app",
  messagingSenderId: "471484412875",
  appId: "1:471484412875:web:32fab2aaf5a2a42fb93c4e",
  measurementId: "G-Z942FDZD4H"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 
export const auth = getAuth(app);
