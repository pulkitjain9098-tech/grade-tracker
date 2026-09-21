import { useEffect, useState } from "react";
import Head from "next/head";
import { watchAuth, watchSubmissions, logOut } from "../lib/firebase";
import Login from "../components/Login";
import { SUBJECTS } from "../lib/config";

const ADMIN_EMAIL = "25ucs113@lnmiit.ac.in";

export default function AdminPage() {
  const [user, setUser] = useState(undefined);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const unsub = watchAuth((u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = watchSubmissions(setRows);
    return unsub;
  }, [user]);

  const subjectLabel = (id) => {
    const s = SUBJECTS.find((s) => s.id === id);
    return s ? s.label : id;
  };

  return (
    <div className="container">
      <Head>
        <title>Grade Tracker - Admin</title>
      </Head>

      <div className="top-bar">
        <div>
          <h1>Admin</h1>
          <p className="subtitle">All submissions, with who submitted them.</p>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="email-tag">{user.email}</span>
            <button className="secondary" onClick={logOut}>Sign out</button>
          </div>
        )}
      </div>

      {user === undefined && <p>Loading…</p>}

      {user === null && (
        <>
          <Login />
          <p style={{ color: "#9aa7b2", fontSize: "0.85rem", marginTop: 12 }}>
            This page is restricted to a single account.
          </p>
        </>
      )}

      {user && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.email}</td>
                    <td>{subjectLabel(r.subject)}</td>
                    <td>{r.marks}</td>
                    <td>{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: "#9aa7b2", fontSize: "0.8rem", marginTop: "12px", marginBottom: 0 }}>
            {rows.length} total submission{rows.length === 1 ? "" : "s"}.
          </p>
        </div>
      )}
    </div>
  );
}
