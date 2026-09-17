import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function getAdminFirestore() {
  if (!getApps().length) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    initializeApp({ credential: json ? cert(JSON.parse(json)) : applicationDefault(), projectId: "itsshopagent" });
  }
  return getFirestore();
}
