import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import styles from "./page.module.css";

/*
  NOTE FOR JIM — not shown to users.

  This is a working draft written from how the site actually behaves. It has
  NOT been reviewed by a lawyer, and it should be before launch. Points worth
  taking to counsel:

    - Florida has no general consumer privacy statute that clearly covers this
      site, but the FDBR applies over certain revenue thresholds and CCPA/CPRA
      can reach a Florida business with California visitors. Confirm which, if
      any, bind you, and whether a formal "Do Not Sell or Share" mechanism is
      required rather than the contact route below.
    - Passing a lead to more than one professional may count as "sharing" or
      even "selling" personal information under some of those regimes. The text
      says plainly that requests are shared; counsel should confirm the framing
      and whether consent needs to be explicit rather than implied by sending.
    - The 24-month retention period below is a placeholder. Pick one you can
      actually honor, and make sure the deletion actually happens.
    - There is no cookie or analytics disclosure because the site currently
      sets neither. That has to be revisited the moment analytics goes in.
    - TCPA: if anyone in the network will call or text, the consent language on
      the form probably needs to be express written consent, which it is not
      today.
*/

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "What we collect when you send a request, who we share it with, how long we keep it, and how to ask us to stop.",
  alternates: { canonical: "/privacy" },
  // Out of the index while the notice is still a draft — a privacy notice
  // that ranks before counsel has read it is the wrong page to be found on.
  // `follow` stays on so the links out of it still carry.
  robots: { index: false, follow: true },
};

const UPDATED = "10 August 2026";

export default function Privacy() {
  const path = "/privacy";

  return (
    <>
      <JsonLd
        schemas={[
          articleSchema(
            "Privacy notice",
            "What SoFloCondoVerify collects, who it is shared with, how long it is kept, and how to ask us to stop.",
            path,
            "2026-08-10"
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Privacy", path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Privacy" }]} />

          <article className={styles.article}>
            <header className={styles.head}>
              <div className={`${styles.doc} mono`}>Privacy</div>
              <h1>Privacy notice</h1>
              <div className={`${styles.updated} mono`}>
                Last updated {UPDATED}
              </div>
            </header>

            <div className={styles.body}>
              <p className={styles.lede}>
                This notice covers SoFloCondoVerify.com. It is written to be read
                rather than skimmed past, and the short version is this: the only
                personal information we collect is what you type into the
                &ldquo;Get connected&rdquo; form, and the reason we collect it is
                to pass it to licensed professionals who can answer your question.
              </p>

              <h2>What we collect</h2>
              <p>
                <b>From the connect form.</b> Your name, and whichever of email
                address and phone number you give us. Optionally the building
                you&rsquo;re asking about and any message you add. Nothing on the
                form is required beyond your name and one way to reach you.
              </p>
              <p>
                <b>What we don&rsquo;t collect.</b> You can search buildings, read
                records and browse every page on this site without giving us
                anything. There is no account, no login, and no newsletter signup.
                We do not ask for financial details, and you should never send a
                Social Security number, account number or copy of an identity
                document through the form.
              </p>
              <p>
                <b>Cookies and analytics.</b> The site sets no tracking or
                advertising cookies and runs no analytics script. Our hosting
                provider keeps ordinary server logs, which include IP addresses,
                for operational and security purposes. If we add analytics later,
                this notice will be updated before it goes live.
              </p>

              <h2>How we use it, and who we share it with</h2>
              <p>
                We use your request to match you with professionals who can help
                with it, and to follow up on the request itself.
              </p>
              <p className={styles.callout}>
                <b>Your request is shared.</b> When you send the form, your
                details — including your contact information and anything you
                write in the message — may be passed to one or more licensed
                professionals in our network, so they can respond to you directly.
                That sharing is the purpose of the form, and it is the main thing
                to understand before you send it. If you would rather not have your
                details passed on, please don&rsquo;t use the form.
              </p>
              <p>
                We are paid by professionals in our network for those
                introductions. We do not sell mailing lists, and we do not pass
                your details to anyone outside that network for their own
                marketing.
              </p>
              <p>
                Beyond that, we share information only with the service providers
                that run the site for us (hosting and database), and where the law
                requires it — for example in response to a valid legal request.
              </p>

              <h2>Advertising</h2>
              <p>
                Some pages carry paid placements, always inside a box labeled
                Advertisement. Those are plain links: no third-party ad network,
                no tracking pixels, and no sharing of your information with a
                sponsor unless you contact them yourself.
              </p>

              <h2>How long we keep it</h2>
              <p>
                We keep a request for up to <b>24 months</b> from the day you send
                it, so we can follow up and keep a record of what was passed to
                whom, and then delete it. If you ask us to delete it sooner, we
                will, unless we&rsquo;re required to keep it.
              </p>
              <p>
                We can&rsquo;t delete it from the systems of a professional it was
                already shared with — you would need to ask them directly, and we
                will tell you who they were if you ask us.
              </p>

              <h2>Your choices</h2>
              <ul className={styles.plain}>
                <li>
                  <b>Ask what we hold.</b> We&rsquo;ll tell you what we have and
                  who it was shared with.
                </li>
                <li>
                  <b>Ask us to delete it.</b> We&rsquo;ll remove your request from
                  our records.
                </li>
                <li>
                  <b>Ask us to correct it.</b> If a detail is wrong, tell us and
                  we&rsquo;ll fix it.
                </li>
                <li>
                  <b>Do not sell or share.</b> We don&rsquo;t sell personal
                  information. If you want us to stop sharing your request with
                  professionals in our network, tell us and we will — though
                  it means we can&rsquo;t act on the request itself.
                </li>
                <li>
                  <b>Stop hearing from someone.</b> If a professional we matched
                  you with keeps contacting you, ask them to stop, and tell us
                  too.
                </li>
              </ul>

              <h2>Contacting us</h2>
              <p>
                Email <a href="mailto:privacy@soflocondoverify.com">
                  privacy@soflocondoverify.com
                </a>{" "}
                for anything in this notice, including any of the requests above.
                Tell us enough to find your request — the name and email or phone
                number you used. We&rsquo;ll respond within 30 days.
              </p>

              <h2>Children</h2>
              <p>
                This site is for adults dealing with property. It is not directed
                at children, and we do not knowingly collect information from
                anyone under 18. If you believe a child has sent us something, email
                the address above and we&rsquo;ll delete it.
              </p>

              <h2>Changes</h2>
              <p>
                If this notice changes, the date at the top changes with it.
                Material changes to how we share requests will be described here
                rather than made quietly.
              </p>

              <div className={styles.related}>
                <b>Related:</b>{" "}
                <Link href="/how-matching-works">How matching works</Link> explains
                the referral arrangement itself, including who pays us and what
                you are committing to when you send a request.
              </div>
            </div>

            <footer className={styles.foot}>
              <p className="mono">
                Not legal advice · Not affiliated with any government agency
              </p>
            </footer>
          </article>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
