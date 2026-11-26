import { useEffect, useState } from "react";
import Head from "next/head";
import {
  watchAuth, logOut, isAllowedEmail,
  fetchAllSubmissions, deleteSubmission, rebuildSummaries,
} from "../lib/firebase";
import Login from "../components/Login";

const ADMIN_EMAIL = "25ucs113@lnmiit.ac.in";

export default function Admin() {
  const [user, setUser] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = watchAuth((u) => {
      if (u && isAllowedEmail(u.email)) setUser(u);
      else setUser(null);
    });
    return unsub;
  }, []);

  const isAdmin = user && user.email.toLowerCase() === ADMIN_EMAIL;

  async function load() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetchAllSubmissions();
      r.sort((a, b) => (a.email || "").localeCompare(b.email || "") || (a.subject || "").localeCompare(b.subject || ""));
      setRows(r);
    } catch (e) {
      setMsg("Load failed: " + e.message);
    }
    setBusy(false);
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  async function rebuild() {
    setBusy(true);
    try {
      await rebuildSummaries(rows);
      setMsg("Summaries rebuilt from " + rows.length + " entries.");
    } catch (e) {
      setMsg("Rebuild failed: " + e.message);
    }
    setBusy(false);
  }

  async function remove(r) {
    if (!confirm("Delete " + r.email + " / " + r.subject + " / " + r.marks + " / " + r.grade + "?")) return;
    setBusy(true);
    try {
      await deleteSubmission(r.id);
      const rest = rows.filter((x) => x.id !== r.id);
      setRows(rest);
      await rebuildSummaries(rest);
      setMsg("Deleted and summaries rebuilt.");
    } catch (e) {
      setMsg("Delete failed: " + e.message);
    }
    setBusy(false);
  }

  const students = new Set(rows.map((r) => r.email)).size;

  return (
    <div className="container">
      <Head>
        <title>Grade Tracker - Admin</title>
      </Head>
      <div className="top-bar">
        <div>
          <h1>Admin</h1>
          <p className="subtitle">All submissions. Deleting an entry also rebuilds the cutoff table.</p>
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
      {user && !isAdmin && <p>This page is for the admin only.</p>}
      {isAdmin && (
        <div className="card">
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button className="secondary" disabled={busy} onClick={load}>Refresh</button>
            <button disabled={busy || rows.length === 0} onClick={rebuild}>Rebuild summaries</button>
          </div>
          {msg && <p>{msg}</p>}
          <p>{students} students submitted, {rows.length} total entries.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Email</th><th>Subject</th><th>Marks</th><th>Grade</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.email}</td>
                    <td>{r.subject}</td>
                    <td>{r.marks}</td>
                    <td>{r.grade}</td>
                    <td><button className="secondary" disabled={busy} onClick={() => remove(r)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}