import { useEffect, useState } from "react";
import Head from "next/head";
import { watchAuth, logOut, isAllowedEmail, fetchSummaries } from "../lib/firebase";
import Login from "../components/Login";
import GradeTable from "../components/GradeTable";

export default function ViewPage() {
  const [user, setUser] = useState(undefined);
  const [summaries, setSummaries] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = watchAuth((u) => {
      if (u && isAllowedEmail(u.email)) setUser(u);
      else setUser(null);
    });
    return unsub;
  }, []);

  async function load(force) {
    setError("");
    try {
      setSummaries(await fetchSummaries(force));
    } catch (e) {
      setError("Could not load data right now. Please try again later.");
    }
  }

  useEffect(() => {
    if (user) load(false);
  }, [user]);

  return (
    <div className="container">
      <Head>
        <title>Grade Tracker - View</title>
      </Head>

      <div className="top-bar">
        <div>
          <h1>Grade Tracker</h1>
          <p className="subtitle">Minimum marks reported for each grade.</p>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="email-tag">{user.email}</span>
            <button className="secondary" onClick={() => load(true)}>Refresh</button>
            <button className="secondary" onClick={logOut}>Sign out</button>
          </div>
        )}
      </div>

      {user === undefined && <p>Loading…</p>}
      {user === null && <Login />}
      {error && <p style={{ color: "#f87171" }}>{error}</p>}
      {user && <GradeTable summaries={summaries} />}
    </div>
  );
}