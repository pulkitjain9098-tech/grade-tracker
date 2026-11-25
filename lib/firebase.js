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
async function submitEntryOld({ uid, email, subject, marks, grade }) {
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


import { runTransaction } from "firebase/firestore";

export async function submitEntry({ uid, email, subject, marks, grade }) {
  const m = Number(marks);
  const subRef = doc(db, "submissions", `${uid}_${subject}`);
  const sumRef = doc(db, "summaries", subject);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(sumRef);
    const cur = snap.exists() ? snap.data() : {};
    tx.set(subRef, { uid, email, subject, marks: m, grade, updatedAt: serverTimestamp() });
    if (cur[grade] === undefined || m < cur[grade]) {
      tx.set(sumRef, { ...cur, [grade]: m, updatedAt: serverTimestamp() });
    }
  });
}

export function watchSummaries(callback) {
  return onSnapshot(collection(db, "summaries"), (snap) => {
    const out = {};
    snap.forEach((d) => { out[d.id] = d.data(); });
    callback(out);
  });
}

import { getDocs, deleteDoc } from "firebase/firestore";
import { SUBJECTS, GRADES } from "./config";

export async function fetchSummaries(force = false) {
  const KEY = "gt_summaries_v1";
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    if (!force && c && Date.now() - c.t < 10 * 60 * 1000) return c.d;
  } catch (e) {}
  const snap = await getDocs(collection(db, "summaries"));
  const out = {};
  snap.forEach((d) => {
    const v = { ...d.data() };
    delete v.updatedAt;
    out[d.id] = v;
  });
  try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: out })); } catch (e) {}
  return out;
}

export async function fetchAllSubmissions() {
  const snap = await getDocs(collection(db, "submissions"));
  const rows = [];
  snap.forEach((d) => {
    const v = d.data();
    rows.push({
      id: d.id,
      email: v.email,
      subject: v.subject,
      marks: v.marks,
      grade: v.grade,
      ts: v.updatedAt && v.updatedAt.toMillis ? v.updatedAt.toMillis() : 0,
    });
  });
  return rows;
}

export async function deleteSubmission(id) {
  await deleteDoc(doc(db, "submissions", id));
}

export async function rebuildSummaries(rows) {
  const mins = {};
  SUBJECTS.forEach((s) => { mins[s.id] = {}; });
  rows.forEach((r) => {
    if (!mins[r.subject] || !GRADES.includes(r.grade) || typeof r.marks !== "number") return;
    const cur = mins[r.subject][r.grade];
    if (cur === undefined || r.marks < cur) mins[r.subject][r.grade] = r.marks;
  });
  for (const s of SUBJECTS) {
    await setDoc(doc(db, "summaries", s.id), { ...mins[s.id], updatedAt: serverTimestamp() });
  }
  try { localStorage.removeItem("gt_summaries_v1"); } catch (e) {}
}