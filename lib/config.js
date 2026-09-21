// Edit this file each semester to match the actual subjects and grade scale.
// Nothing else in the app needs to change.

export const ALLOWED_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "lnmiit.ac.in";

// Subjects freshers are reporting on. `id` must be stable (used as a doc-id
// fragment) - if you rename a subject, keep the same `id` or old data will
// no longer merge with it.
export const SUBJECTS = [
  { id: "tce", label: "TCE" },
  { id: "code", label: "CODE" },
  { id: "clp", label: "CLP" },
  { id: "pps", label: "PPS" },
  { id: "be", label: "BE" },
  { id: "be-lab", label: "BE-LAB" },
];

// Grades, ordered from highest to lowest - this order drives the table.
// Adjust to match your institute's actual relative-grading scale.
export const GRADES = ["A", "AB", "B", "BC", "C", "CD", "D", "F"];

// Any grade in this list counts as "passed" when computing the passing-marks line.
export const PASSING_GRADES = GRADES.filter((g) => g !== "F");
