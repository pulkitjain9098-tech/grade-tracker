import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ALLOWED_EMAIL_DOMAIN } from "./config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
// Hints Google's account picker to the college domain. This is a UX nicety
// only - the real enforcement is (a) the isAllowed() check below and
// (b) the Firestore security rules, which reject writes from anyone else
// even if they bypass the UI.
provider.setCustomParameters({ hd: ALLOWED_EMAIL_DOMAIN });

export function isAllowedEmail(email) {
  if (!email) return false;
  return email.toLowerCase().endsWith("@" + ALLOWED_EMAIL_DOMAIN.toLowerCase());
}

export async function signIn() {
  const result = await signInWithPopup(auth, provider);
  if (!isAllowedEmail(result.user.email)) {
    await signOut(auth);
    throw new Error(
      `Only @${ALLOWED_EMAIL_DOMAIN} accounts can use this. Please sign in with your college account.`
    );
  }
  return result.user;
}

export function logOut() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// One document per (user, subject) - id is deterministic so a resubmission
// overwrites their own earlier entry instead of creating a duplicate.
export async function submitEntry({ uid, email, subject, marks, grade }) {
  const docId = `${uid}_${subject}`;
  await setDoc(doc(db, "submissions", docId), {
    uid,
    email,
    subject,
    marks: Number(marks),
    grade,
    updatedAt: serverTimestamp(),
  });
}

export function watchSubmissions(callback) {
  return onSnapshot(collection(db, "submissions"), (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push(d.data()));
    callback(rows);
  });
}
