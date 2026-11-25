import { SUBJECTS, GRADES, PASSING_GRADES } from "../lib/config";

export default function GradeTable({ summaries }) {
  const dash = "\u2014";
  return (
    <div className="card">
      <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Grade cutoffs (minimum marks per grade)</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              {GRADES.map((g) => (<th key={g}>{g}</th>))}
              <th>Passing</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map((s) => {
              const d = (summaries && summaries[s.id]) || {};
              const passVals = PASSING_GRADES.map((g) => d[g]).filter((v) => typeof v === "number");
              const passing = passVals.length ? Math.min(...passVals) : null;
              return (
                <tr key={s.id}>
                  <td>{s.label}</td>
                  {GRADES.map((g) => (<td key={g}>{typeof d[g] === "number" ? d[g] : dash}</td>))}
                  <td>{passing !== null ? passing : dash}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ color: "#9aa7b2", fontSize: "0.8rem", marginTop: "12px", marginBottom: 0 }}>
        Each grade column shows the lowest marks anyone reported for that grade, so it is an estimate of the cutoff.
      </p>
    </div>
  );
}
