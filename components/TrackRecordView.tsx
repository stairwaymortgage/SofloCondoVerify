"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** The kinds of record a page can be. Sent as `record_type`. */
export type RecordType =
  | "building"
  | "risk"
  | "preconstruction"
  | "developer"
  | "association";

interface Props {
  recordType: RecordType;
  /** Stable identifier for the record — buildings.id, or a url slug. */
  recordId: string | number;
  /** Human-readable name, so GA reports don't read as a list of ids. */
  recordName?: string | null;
}

/**
 * Fires `record_viewed` once per mount. Rendered by the server record pages,
 * which cannot reach gtag themselves.
 *
 * The dependency list is the record identity rather than `[]`: App Router
 * reuses this component across sibling records (building 1 → building 2 is
 * one navigation, not a remount), and an empty list would report only the
 * first of them.
 */
export default function TrackRecordView({
  recordType,
  recordId,
  recordName,
}: Props) {
  useEffect(() => {
    track("record_viewed", {
      record_type: recordType,
      record_id: String(recordId),
      record_name: recordName ?? undefined,
    });
  }, [recordType, recordId, recordName]);

  return null;
}
