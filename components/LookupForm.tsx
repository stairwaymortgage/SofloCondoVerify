"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./LookupForm.module.css";
import { track } from "@/lib/analytics";
import { chipLabel, fhaTone, vaTone, type Tone } from "@/lib/signals";
import type { SearchResult } from "@/app/api/search/route";

const EXAMPLES = ["Brickell Flatiron", "Porsche Design Tower", "Las Olas by the River"];
const DEBOUNCE_MS = 300;
const MIN_QUERY = 2;

export default function LookupForm({
  buildingCountLabel,
}: {
  /** Live tri-county count, formatted by the server. */
  buildingCountLabel: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks the newest request so a slow earlier response can't overwrite it.
  const requestRef = useRef(0);

  const search = useCallback(async (term: string) => {
    const trimmed = term.trim();
    const requestId = ++requestRef.current;

    if (trimmed.length < MIN_QUERY) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (requestId !== requestRef.current) return; // superseded
      if (!response.ok) throw new Error(`Search failed (${response.status})`);

      const payload = (await response.json()) as { results: SearchResult[] };
      if (requestId !== requestRef.current) return;
      setResults(payload.results);

      // Only settled searches are reported: the 300ms debounce collapses a
      // burst of typing into one request, and superseded responses return
      // above rather than reaching here. A slow typist still produces a few
      // events per query — acceptable, and the zero-result ones are the
      // interesting ones anyway.
      track("search_performed", {
        search_term: trimmed,
        results_count: payload.results.length,
      });
    } catch {
      if (requestId !== requestRef.current) return;
      setResults(null);
      setError("Search is temporarily unavailable. Please try again.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  // Debounced search-as-you-type.
  useEffect(() => {
    const timer = setTimeout(() => void search(q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q, search]);

  function submit() {
    void search(q);
  }

  const showEmpty =
    !loading && !error && results !== null && results.length === 0 &&
    q.trim().length >= MIN_QUERY;

  return (
    <div>
      <div className={styles.lookup}>
        <div className={styles.lh}>
          <span className={styles.dot} /> Building verification lookup
        </div>
        <div className={styles.lb}>
          <label htmlFor="q">Enter a building name, street address, or ZIP</label>
          <div className={styles.searchrow}>
            <input
              id="q"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Brickell Flatiron, or 1450 Ocean Dr"
              aria-label="Building name, address, or ZIP"
              autoComplete="off"
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
          <span>{buildingCountLabel} buildings on file</span>
          <span>Records updated monthly</span>
        </div>
      </div>

      <div className={styles.results} aria-live="polite" aria-busy={loading}>
        {loading && (
          <div className={`${styles.state} mono`}>
            <span className={styles.spinner} aria-hidden /> Searching records…
          </div>
        )}

        {error && <div className={`${styles.state} ${styles.stateErr}`}>{error}</div>}

        {showEmpty && (
          <div className={styles.state}>
            <b>No building on file matches “{q.trim()}”.</b>
            <span className={styles.stateHint}>
              Try the building name without “Condominium”, a street address, or a ZIP code.
            </span>
          </div>
        )}

        {!loading &&
          results?.map((building) => (
            <ResultCard key={building.id} building={building} />
          ))}
      </div>
    </div>
  );
}

function ResultCard({ building }: { building: SearchResult }) {
  const location = [building.city, building.zip].filter(Boolean).join(" · ");

  return (
    <Link href={`/building/${building.id}`} className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.cardName}>
          {building.building_name ?? "Unnamed building"}
        </div>
        <div className={`${styles.cardAddr} mono`}>
          {building.address ?? "Address not on file"}
          {location ? ` · ${location}` : ""}
        </div>
        <div className={styles.chips}>
          <Chip
            label={`FHA ${chipLabel(building.fha_status, "none on file")}`}
            tone={fhaTone(building)}
          />
          <Chip
            label={`VA ${chipLabel(building.va_status, "not listed")}`}
            tone={vaTone(building)}
          />
          {!!building.signal_count && (
            <span className={`${styles.chip} ${styles.chipCount} mono`}>
              {building.signal_count} signal{building.signal_count === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
      <span className={styles.cardGo} aria-hidden>
        View record →
      </span>
    </Link>
  );
}

function Chip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`${styles.chip} ${styles[`chip_${tone}`]}`}>
      <span className={styles.chipDot} aria-hidden />
      {label}
    </span>
  );
}
