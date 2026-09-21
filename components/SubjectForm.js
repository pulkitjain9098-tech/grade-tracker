import { useState } from "react";
import { submitEntry } from "../lib/firebase";
import { SUBJECTS, GRADES } from "../lib/config";

export default function SubjectForm({ user }) {
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState(GRADES[0]);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', msg }
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    const marksNum = Number(marks);
    if (marks === "" || Number.isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      setStatus({ type: "error", msg: "Enter marks between 0 and 100." });
      return;
    }

    setSaving(true);
    try {
      await submitEntry({
        uid: user.uid,
        email: user.email,
        subject,
        marks: marksNum,
        grade,
      });
      setStatus({ type: "ok", msg: "Saved. Table below updates live." });
      setMarks("");
    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label>Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Marks (out of 100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="e.g. 78"
          />
        </div>

        <div className="field">
          <label>Grade</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
      <p style={{ color: "#9aa7b2", fontSize: "0.82rem", margin: "4px 0 0" }}>
        Submitting again for the same subject overwrites your earlier entry - so
        fix a typo by just resubmitting.
      </p>
      {status && <div className={status.type === "ok" ? "success" : "error"}>{status.msg}</div>}
    </form>
  );
}
