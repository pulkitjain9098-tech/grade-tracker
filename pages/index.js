import { useEffect, useState } from "react";
import Head from "next/head";
import { watchAuth, logOut, isAllowedEmail } from "../lib/firebase";
import Login from "../components/Login";
import SubjectForm from "../components/SubjectForm";

export default function Home() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = watchAuth((u) => {
      if (u && isAllowedEmail(u.email)) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Grade Tracker</title>
      </Head>

      <div className="top-bar">
        <div>
          <h1>Grade Tracker</h1>
          <p className="subtitle">Submit your marks and grade for each subject.</p>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="email-tag">{user.email}</span>
            <button className="secondary" onClick={logOut}>Sign out</button>
          </div>
        )}
      </div>

      {user === undefined && <p>Loading…</p>}
      {user === null && <Login />}
      {user && <SubjectForm user={user} />}
    </div>
  );
}
