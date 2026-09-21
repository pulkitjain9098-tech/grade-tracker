import { SUBJECTS, GRADES, PASSING_GRADES } from "../lib/config";

function aggregate(rows) {
  const bySubject = {};
  for (const s of SUBJECTS) {
    bySubject[s.id] = { entries: [], minBySrade: {} };
  }

  for (const row of rows) {
    if (!bySubject[row.subject]) continue; // subject removed from config, ignore
    bySubject[row.subject].entries.push(row);
  }

  const result = {};
  for (const s of SUBJECTS) {
    const entries = bySubject[s.id].entries;
    if (entries.length === 0) {
      result[s.id] = null;
      continue;
    }

    const minByGrade = {};
    for (const g of GRADES) {
      const marksForGrade = entries.filter((e) => e.grade === g).map((e) => e.marks);
      minByGrade[g] = marksForGrade.length ? Math.min(...marksForGrade) : null;
    }

    const passingMarks = entries
      .filter((e) => PASSING_GRADES.includes(e.grade))
      .map((e) => e.marks);
    const passing = passingMarks.length ? Math.min(...passingMarks) : null;

    const avg =
      entries.reduce((sum, e) => sum + e.marks, 0) / entries.length;

    result[s.id] = {
      count: entries.length,
      minByGrade,
      passing,
      avg: Math.round(avg * 10) / 10,
    };
  }
  return result;
}

export default function GradeTable({ rows }) {
  const agg = aggregate(rows);

  return (
    <div className="card">
      <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Live grade cutoffs</h2>
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
            {SUBJECTS.map((s) => {
              const a = agg[s.id];
              return (
                <tr key={s.id}>
                  <td>
                    {s.label}
                    {a && <span className="count"> ({a.count})</span>}
                  </td>
                  {GRADES.map((g) => (
                    <td key={g}>{a && a.minByGrade[g] != null ? a.minByGrade[g] : "—"}</td>
                  ))}
                  <td>{a && a.passing != null ? a.passing : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ color: "#9aa7b2", fontSize: "0.8rem", marginTop: "12px", marginBottom: 0 }}>
        Each grade column shows the lowest marks anyone reported getting that
        grade in - i.e. an estimate of the cutoff. The number in brackets is
        how many people have submitted for that subject; treat cutoffs with
        very few responses as unreliable.
      </p>
    </div>
  );
}
