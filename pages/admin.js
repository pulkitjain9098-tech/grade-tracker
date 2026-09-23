import { useEffect, useState } from "react";
import Head from "next/head";
import { watchAuth, watchSubmissions, logOut } from "../lib/firebase";
import Login from "../components/Login";
import { SUBJECTS } from "../lib/config";

const ADMIN_EMAIL = "25ucs113@lnmiit.ac.in";

function formatDate(ts) {
  if (!ts) return "—";
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function subjectLabel(id) {
  const s = SUBJECTS.find((s) => s.id === id);
  return s ? s.label : id;
}

export default function AdminPage() {
  const [user, setUser] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [openEmail, setOpenEmail] = useState(null);

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

  // Group entries by email
  const byEmail = {};
  for (const r of rows) {
    if (!byEmail[r.email]) byEmail[r.email] = [];
    byEmail[r.email].push(r);
  }

  const emailGroups = Object.keys(byEmail).map((email) => {
    const entries = byEmail[email];
    const latest = entries.reduce((max, e) => {
      const t = e.updatedAt && typeof e.updatedAt.toDate === "function"
        ? e.updatedAt.toDate().getTime()
        : 0;
      return t > max ? t : max;
    }, 0);
    return { email, entries, latest };
  });

  emailGroups.sort((a, b) => b.latest - a.latest);

  return (
    <div className="container">
      <Head>
        <title>Grade Tracker - Admin</title>
      </Head>

      <div className="top-bar">
        <div>
          <h1>Admin</h1>
          <p className="subtitle">Submissions grouped by student.</p>
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
                  <th>Last submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {emailGroups.map(({ email, entries, latest }) => {
                  const isOpen = openEmail === email;
                  return (
                    <>
                      <tr
                        key={email}
                        onClick={() => setOpenEmail(isOpen ? null : email)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{email}</td>
                        <td>{latest ? formatDate({ toDate: () => new Date(latest) }) : "—"}</td>
                        <td style={{ textAlign: "right" }}>{isOpen ? "▲" : "▼"}</td>
                      </tr>
                      {isOpen && (
                        <tr key={email + "-details"}>
                          <td colSpan={3} style={{ padding: 0 }}>
                            <table style={{ width: "100%", margin: "8px 0 16px" }}>
                              <thead>
                                <tr>
                                  <th>Subject</th>
                                  <th>Marks</th>
                                  <th>Grade</th>
                                  <th>Submitted</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entries.map((e, i) => (
                                  <tr key={i}>
                                    <td>{subjectLabel(e.subject)}</td>
                                    <td>{e.marks}</td>
                                    <td>{e.grade}</td>
                                    <td>{formatDate(e.updatedAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ color: "#9aa7b2", fontSize: "0.8rem", marginTop: "12px", marginBottom: 0 }}>
            {emailGroups.length} student{emailGroups.length === 1 ? "" : "s"} submitted, {rows.length} total entr{rows.length === 1 ? "y" : "ies"}.
          </p>
        </div>
      )}
    </div>
  );
}
