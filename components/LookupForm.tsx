"use client";

import { useState } from "react";
import styles from "./LookupForm.module.css";

const EXAMPLES = ["Brickell Flatiron", "Porsche Design Tower", "Las Olas by the River"];

export default function LookupForm() {
  const [q, setQ] = useState("");

  function submit() {
    // Placeholder: search is wired to Supabase in a later task.
    // For now this is a no-op that keeps the form interactive.
    if (!q.trim()) return;
    // eslint-disable-next-line no-console
    console.log("lookup:", q);
  }

  return (
    <div className={styles.lookup}>
      <div className={styles.lh}>
        <span className={styles.dot} /> Building verification lookup
      </div>
      <div className={styles.lb}>
        <label htmlFor="q">Enter a building name or street address</label>
        <div className={styles.searchrow}>
          <input
            id="q"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Brickell Flatiron, or 1450 Ocean Dr"
            aria-label="Building name or address"
          />
          <button onClick={submit}>Look up record</button>
        </div>
        <div className={styles.exs}>
          Examples:{" "}
          {EXAMPLES.map((ex, i) => (
            <span key={ex}>
              <a onClick={() => setQ(ex)}>{ex}</a>
              {i < EXAMPLES.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
      </div>
      <div className={`${styles.lf} mono`}>
        <span>17,773 buildings on file</span>
        <span>Records updated monthly</span>
      </div>
    </div>
  );
}
