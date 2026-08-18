import { supabase } from "./supabase";
import type { Statute } from "./database.types";

/**
 * Regulatory explainers.
 *
 * The statutes table is 15 usable rows plus a header row that came through the
 * workbook import (ref "Ref", citation "Citation"). Everything here filters
 * that out rather than papering over it downstream.
 */

export interface RuleTopic {
  slug: string;
  title: string;
  /** Short line under the H1. */
  standfirst: string;
  /** Statute refs (ST-nn) that belong on this page, in order. */
  refs: string[];
  /** Plain-English body. Each entry is a paragraph. */
  body: string[];
  /** What the reader should actually do next. */
  actions: string[];
  /** Where the rule comes from, named rather than linked — see sources below. */
  authority: string;
  /** FAQ cluster whose city answers pair with this topic. */
  faqCluster: string | null;
  /**
   * The complete official text, where one exists to link to.
   *
   * The statute table on a topic page is a summary of selected provisions, and
   * a reader who wants the act itself should not have to go looking for it. We
   * link the source rather than reproducing any of it.
   *
   * The year is pinned, matching the 718.116 link in data/forms.csv: an
   * unpinned URL silently changes underneath a page that carries an as-of
   * date. Bumping the year is a deliberate edit, not a drift.
   */
  fullText?: { label: string; url: string };
}

/**
 * Only ST-15 (SB 4D) is backed by a statute row here; the records-retention
 * rows carry the Chapter 718 page. The lender-side topics have no statute at
 * all — they are investor policy, not law — so those pages say so plainly
 * instead of borrowing a citation that doesn't apply.
 */
export const RULE_TOPICS: RuleTopic[] = [
  {
    slug: "chapter-718-condo-act",
    title: "Chapter 718: what Florida's Condominium Act requires",
    standfirst:
      "The records an association has to keep, how fast it has to produce them, and what happens when it doesn't.",
    refs: [
      "ST-01",
      "ST-02",
      "ST-03",
      "ST-04",
      "ST-05",
      "ST-06",
      "ST-07",
      "ST-08",
      "ST-09",
      "ST-10",
      "ST-11",
      "ST-12",
      "ST-13",
      "ST-14",
    ],
    body: [
      "Chapter 718 of the Florida Statutes is the Condominium Act — the law that governs how condominium associations in Florida operate. For a buyer, a seller or an owner, the part that matters most day to day is s. 718.111(12): the official records provision. It sets out what the association must keep, how long it must keep it, and how quickly it has to let an owner see it.",
      "This matters well beyond paperwork. Reserve studies, milestone inspection reports, budgets, contracts and meeting minutes are the documents that answer the questions a lender, an insurer or a careful buyer will ask about a building. When they are produced quickly, a deal moves. When they aren't, the deal usually stalls long before anyone explains why.",
      "The table below is the retention and response framework as the statute sets it out. It describes obligations on the association — it is not a checklist for judging a building, and a building is not out of compliance simply because a record hasn't reached us.",
    ],
    actions: [
      "Owners: a records request has to be in writing, and the clock starts when the board or its designee receives it.",
      "Buyers: ask for the reserve study, the milestone report and the last 12–24 months of minutes while you still have an inspection period.",
      "Boards: the checklist requirement is easy to miss — records produced and records withheld have to be listed at the same time.",
    ],
    authority: "Florida Statutes, Chapter 718 (the Condominium Act)",
    faqCluster: "Structural/SIRS",
    fullText: {
      label: "Chapter 718, Florida Statutes — the complete Condominium Act",
      url: "https://www.flsenate.gov/Laws/Statutes/2024/Chapter718",
    },
  },
  {
    slug: "sb4d-milestone-inspections",
    title: "SB 4D milestone inspections: which buildings, and by when",
    standfirst:
      "The 2022 law that put structural inspections and funded reserves on a statutory clock.",
    refs: ["ST-15", "ST-08"],
    body: [
      "Senate Bill 4D, enacted on 26 May 2022 in the wake of the Surfside collapse, introduced milestone structural inspections and tightened the budgeting rules that sit behind them. It applies most directly to condominium buildings of three storeys or more.",
      "A milestone inspection is a structural assessment carried out by a licensed engineer or architect on a statutory schedule. Where the first phase raises questions, a second, more detailed phase follows. The resulting report is a record the association has to retain, and it is one of the first documents a lender or insurer will ask to see.",
      "Being enrolled in the milestone programme is a fact about a building — normally that it is three storeys or taller — and not a finding against it. Our building records show milestone status as informational for exactly that reason. What matters for a buyer is whether the inspection has been done, what it found, and what the association has budgeted in response.",
    ],
    actions: [
      "Ask whether the milestone inspection has been completed, and whether it went to a second phase.",
      "Ask what the association budgeted in response, and whether any assessment has been voted on or is under discussion.",
      "If no report has reached the public record, that is unconfirmed — ask the association directly rather than assuming either way.",
    ],
    authority: "SB 4D (2022), and ss. 553.899 and 718.301(4)(p), F.S.",
    faqCluster: "Structural/SIRS",
  },
  {
    slug: "sirs-reserve-studies",
    title: "SIRS: the structural integrity reserve study, in plain English",
    standfirst:
      "What a reserve study is, why lenders ask for it, and what its absence does and doesn't mean.",
    refs: ["ST-07", "ST-08"],
    body: [
      "A structural integrity reserve study — SIRS — prices the building's structural components over their remaining life: roof, load-bearing walls, floor, foundation, fireproofing, plumbing, electrical, waterproofing and windows among them. It tells owners what those elements will cost and when, so reserves can be funded against a real number rather than a hopeful one.",
      "The study has to be retained as part of the association's accounting records for at least fifteen years after it is completed. That long retention is deliberate: a reserve study is a document that stays relevant for the whole of its planning horizon.",
      "When our record shows a reserve study as unconfirmed, it means we did not locate a filing for it in the source we read on the date shown. It does not mean the association failed to commission one, and it is not a finding that a building is underfunded. Associations file in different places and on different schedules; the association itself is the authoritative answer.",
    ],
    actions: [
      "Ask for the study itself, not a summary — the funding schedule is the part that matters.",
      "Ask whether reserves are fully funded, whether they were waived in prior years, and what the current balance is against the plan.",
      "Read it alongside the milestone report; the two answer different halves of the same question.",
    ],
    authority: "s. 718.111(12), F.S. (retention) and SB 4D (scope)",
    faqCluster: "Structural/SIRS",
  },
  {
    slug: "conventional-full-review-2026",
    title: "The August 2026 conventional Full Review change",
    standfirst:
      "Why we publish no conventional status, and what changed for condo buyers using Fannie Mae or Freddie Mac financing.",
    refs: [],
    body: [
      "Conventional financing on a condominium depends on a project review — the lender checks the association's budget, reserves, insurance, owner-occupancy, litigation and structural position against the investor's rules. From 3 August 2026, more South Florida condominium projects fall into the stricter Full Review path rather than the lighter limited review, which means more documents from the association and a longer lead time before a lender can commit.",
      "This is investor policy, not statute. There is no citation to give you here, and that is the honest answer rather than a gap in our data: Fannie Mae and Freddie Mac set these rules through their selling guides and lender letters, and they revise them on their own schedule.",
      "It also explains something you will see on every building record on this site. Conventional standing is not publishable — the project-eligibility lists that lenders work from are not public record, so we show no status for it in either direction. Anyone publishing a green or red conventional badge for a named building is inferring it. A licensed loan officer can check the live position for a specific building in minutes, and that costs you nothing.",
    ],
    actions: [
      "Ask a loan officer to run the specific building before you write an offer — not after.",
      "Boards: the questionnaire your association returns is what the review is built on. A slow or incomplete one reads as a red flag it may not deserve.",
      "Sellers: if conventional review is the obstacle, cash and portfolio buyers aren't affected by it. Price and market accordingly.",
    ],
    authority:
      "Fannie Mae and Freddie Mac selling guides — investor policy, not Florida law",
    faqCluster: "Conventional",
  },
  {
    slug: "fha-approval-and-single-unit",
    title: "FHA condo approval, HRAP, and the single-unit route",
    standfirst:
      "What project approval is, why so few South Florida buildings hold one, and what an expired approval really means.",
    refs: [],
    body: [
      "FHA lends on a condominium unit only where the project itself is approved. Approval is granted at project level through HUD's review process — HRAP, the HUD Review and Approval Process — and it lapses on a fixed cycle unless the association renews it. That renewal is paperwork, not a structural test.",
      "Across South Florida, very few buildings hold a current approval, and the largest single group in our file is not rejected buildings but buildings with nothing on file at all. That usually means nobody ever applied. Absence of an approval is unconfirmed standing, not a rejection, and it is why our records never describe an unapproved building as failing anything.",
      "Where a building is eligible, a lender can pursue single-unit approval for an individual unit rather than the whole project. It is narrower and it is not available everywhere, but it is the route that most often gets an FHA buyer to closing in a building without project approval. An expired approval is the most fixable position of all: the building cleared review once already.",
    ],
    actions: [
      "Buyers: ask a lender whether single-unit approval is available for the specific unit before you rule the building out.",
      "Boards: if your approval has expired, renewal restores a buyer pool you are currently turning away without knowing it.",
      "Everyone: check the date. Approval status changes whenever an association or lender files, and our record shows what was on file when it was pulled.",
    ],
    authority: "HUD Condominium Project Approval (HRAP) — federal programme rules",
    faqCluster: "FHA",
  },
];

export function ruleTopic(slug: string): RuleTopic | null {
  return RULE_TOPICS.find((topic) => topic.slug === slug.toLowerCase()) ?? null;
}

/** The workbook's header row is a data artifact, not a statute. */
function isHeaderRow(row: Statute): boolean {
  return row.ref?.trim().toLowerCase() === "ref";
}

export async function getStatutes(): Promise<Statute[]> {
  const { data, error } = await supabase.from("statutes").select("*").order("id");

  if (error) {
    console.error("[rules]", error.message);
    return [];
  }
  return ((data ?? []) as Statute[]).filter((row) => !isHeaderRow(row));
}

/** Statute rows for a topic, in the order the topic lists them. */
export async function getStatutesForTopic(topic: RuleTopic): Promise<Statute[]> {
  if (topic.refs.length === 0) return [];

  const statutes = await getStatutes();
  const byRef = new Map(statutes.map((row) => [row.ref?.trim(), row]));

  return topic.refs
    .map((ref) => byRef.get(ref))
    .filter((row): row is Statute => row !== undefined);
}
