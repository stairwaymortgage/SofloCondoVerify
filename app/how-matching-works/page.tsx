import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How matching works · SoFloCondoVerify",
  description:
    "What happens when you send a request: we pass it to licensed professionals in our network who handle your kind of question. Free to you, no obligation, and you choose whether to proceed.",
  alternates: { canonical: "/how-matching-works" },
};

export default function HowMatchingWorks() {
  const path = "/how-matching-works";

  return (
    <>
      <JsonLd
        schemas={[
          articleSchema(
            "How matching works",
            "How a request on SoFloCondoVerify reaches a licensed professional, who pays for it, and what you are committing to.",
            path,
            "2026-08-10"
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "How matching works", path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[{ name: "Home", href: "/" }, { name: "How matching works" }]}
          />

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.article}>
                <header className={styles.head}>
                  <div className={`${styles.doc} mono`}>How this works</div>
                  <h1>How matching works</h1>
                  <p className={styles.stand}>
                    The whole arrangement in plain English: what happens to your
                    request, who pays for it, and what you are — and
                    aren&rsquo;t — committing to.
                  </p>
                </header>

                <div className={styles.body}>
                  <h2>The short version</h2>
                  <p>
                    You send us a request. We pass it to one or more licensed
                    professionals in our network who handle that kind of question.
                    They contact you directly. You decide whether to go further —
                    with any of them, or none. It costs you nothing.
                  </p>

                  <h2>Step by step</h2>
                  <ol className={styles.steps}>
                    <li>
                      <span className={styles.stepN}>1</span>
                      <span>
                        <b>You send a request.</b> Pick what you need help with,
                        tell us how to reach you, and add anything useful. No
                        account, no fee, and the only required field is your name
                        plus one way to contact you.
                      </span>
                    </li>
                    <li>
                      <span className={styles.stepN}>2</span>
                      <span>
                        <b>We pass it on.</b> Your request — including your
                        contact details — goes to one or more licensed
                        professionals in our network whose work covers what you
                        asked about. A financing question goes to a loan officer,
                        a listing question to an agent.
                      </span>
                    </li>
                    <li>
                      <span className={styles.stepN}>3</span>
                      <span>
                        <b>They contact you.</b> Directly, usually by whichever
                        method you gave us. We are not in the middle of that
                        conversation.
                      </span>
                    </li>
                    <li>
                      <span className={styles.stepN}>4</span>
                      <span>
                        <b>You decide.</b> Sending a request commits you to
                        nothing. You can decline any contact, work with someone
                        else entirely, or drop it.
                      </span>
                    </li>
                  </ol>

                  <h2>Who pays</h2>
                  <p>
                    You don&rsquo;t. We are paid by the professionals in our
                    network, not by the people we match them with. That is the
                    same arrangement behind most referral services, and
                    it&rsquo;s worth knowing because it tells you where our
                    incentive sits: we are paid when a professional gets an
                    introduction, not when you buy, sell or borrow anything.
                  </p>
                  <p>
                    Some pages also carry paid placements. Those are always inside
                    a box labeled <b>Advertisement</b>, always marked{" "}
                    <b>Sponsored</b>, and always separate from the record itself.
                    A sponsor cannot buy a status, a flag or a position in our
                    data, and paying us does not change what any page says about
                    any building.
                  </p>

                  <h2>What we are not</h2>
                  <ul className={styles.plain}>
                    <li>
                      <b>Not a lender, brokerage or law firm.</b> We publish a
                      record and make introductions. We don&rsquo;t underwrite,
                      list, or advise.
                    </li>
                    <li>
                      <b>Not an endorsement.</b> Being in our network means someone
                      is licensed and handles this kind of work. It is not a
                      guarantee of quality, price or outcome — check credentials
                      and take references, exactly as you would with anyone.
                    </li>
                    <li>
                      <b>Not affiliated with any government agency</b>, and not
                      affiliated with HUD, the VA, Fannie Mae or Freddie Mac.
                    </li>
                    <li>
                      <b>Not an exclusive arrangement.</b> Nothing stops you
                      approaching anyone else, including professionals we
                      don&rsquo;t work with.
                    </li>
                  </ul>

                  <h2>The honest-matching promise</h2>
                  <p>
                    The record and the referral are kept apart on purpose. Signals
                    on a building page are drawn from public filings with the date
                    they were read, and no professional in our network — and no
                    sponsor — can change, soften or remove one. A building
                    doesn&rsquo;t look better on this site because someone paid,
                    and it doesn&rsquo;t look worse because nobody did.
                  </p>
                  <p>
                    If we can&rsquo;t help with something, we would rather say so
                    than route you to someone who can&rsquo;t either.
                  </p>

                  <h2>Your data</h2>
                  <p>
                    Sharing your request with professionals in our network is the
                    point of sending it, so that sharing is the core of what
                    happens to your details.{" "}
                    <Link href="/privacy">Our privacy notice</Link> sets out what
                    we collect, who it goes to, how long we keep it, and how to
                    ask us to stop.
                  </p>
                </div>

                <footer className={styles.foot}>
                  <p className="mono">
                    Not legal or financial advice · Not affiliated with any
                    government agency
                  </p>
                </footer>
              </article>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Ready when you are. Tell us what you need and we'll pass it to someone licensed to handle it."
                actions={[
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "sell", label: "Sell my unit" },
                  { intent: "check-building", label: "Check a building" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/privacy">Privacy notice</Link>
                  </li>
                  <li>
                    <Link href="/advertise">Advertise with us</Link>
                  </li>
                  <li>
                    <Link href="/">Look up a building</Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
