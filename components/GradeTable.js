import { SUBJECTS, GRADES } from "../lib/config";

export default function GradeTable({ summaries }) {
  const s = summaries || {};
  return (
    <div className="card">
      <h2>Grade cutoffs (minimum marks per grade)</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              {GRADES.map((g) => (
                <th key={g}>{g}</th>
              ))}
              <th>Passing</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map((sub) => {
              const row = s[sub.id] || {};
              const show = (v) => (typeof v === "number" ? v : "—");
              return (
                <tr key={sub.id}>
                  <td>{sub.name || sub.label || sub.id}</td>
                  {GRADES.map((g) => (
                    <td key={g}>{show(row[g])}</td>
                  ))}
                  <td>{show(row.D)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="note">
        Each grade column shows the lowest marks anyone reported for that grade, so it is an estimate of the cutoff. Passing is the D cutoff.
      </p>
    </div>
  );
}