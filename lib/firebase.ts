import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyDcPhSOu2lNAAm-CnTfLoOGp4ysF-McC0A",
  authDomain: "itsshopagent.firebaseapp.com",
  projectId: "itsshopagent",
  storageBucket: "itsshopagent.firebasestorage.app",
  messagingSenderId: "593213347251",
  appId: "1:593213347251:web:3ebfb83ef51aaef72f27c6",
  measurementId: "G-T3MQ94SK9V",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
