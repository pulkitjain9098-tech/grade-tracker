import { useEffect, useState } from "react";
import Head from "next/head";
import { watchSummaries } from "../lib/firebase";
import GradeTable from "../components/GradeTable";

export default function ViewPage() {
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    const unsub = watchSummaries(setSummaries);
    return unsub;
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Grade Tracker - View</title>
      </Head>

      <div className="top-bar">
        <div>
          <h1>Grade Tracker</h1>
          <p className="subtitle">Crowdsourced grade cutoffs, updated live.</p>
        </div>
      </div>

      <GradeTable summaries={summaries} />
    </div>
  );
}

