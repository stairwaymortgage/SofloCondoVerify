import type { Metadata } from "next";
import Masthead from "@/components/Masthead";

export const metadata: Metadata = {
  title: "Advertise — SoFloCondoVerify",
  description:
    "Reach high-intent South Florida condo traffic. For licensed lenders, agents, foreign-national specialists, and HOA-approval firms.",
  alternates: { canonical: "/advertise" },
};

export default function Advertise() {
  return (
    <>
      <Masthead />
      <section style={{ padding: "56px 0", minHeight: "50vh" }}>
        <div className="wrap">
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--teal)",
            }}
          >
            For licensed professionals
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.015em",
              marginTop: 8,
              maxWidth: "22ch",
              lineHeight: 1.12,
            }}
          >
            Reach high-intent South Florida condo traffic.
          </h1>
          <p style={{ color: "var(--ink-2)", marginTop: 12, maxWidth: "58ch", fontSize: 16 }}>
            People land here at the exact moment they’re deciding on a specific
            building. Place a labeled banner in front of that intent, or join the
            matching network. Available to licensed lenders, agents,
            foreign-national specialists, and HOA-approval firms.
          </p>
          <p style={{ color: "var(--ink-3)", marginTop: 24, fontFamily: "var(--font-roboto-mono)", fontSize: 13 }}>
            Placement form coming in a later build task.
          </p>
        </div>
      </section>
    </>
  );
}
