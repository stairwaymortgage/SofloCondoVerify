/**
 * Disclosure copy for the audience landing pages.
 *
 * Everything in this file is regulatory text rendered verbatim to the public,
 * so it lives in one place rather than being retyped per page — four pages
 * carrying four near-identical hand-typed disclosures is four chances for
 * them to drift apart, and drift is the failure mode that matters here.
 */

/**
 * INTERIM — pending Jim's final wording.
 *
 * This is a neutral general-education disclosure standing in for the
 * compliance-reviewed text, because the placeholder tokens it replaced were
 * rendering raw to visitors. It is deliberately generic: it makes no claim
 * about any building, quotes no rate or term, and promises no outcome.
 *
 * Jim supplies the reviewed wording; replace the string here and every
 * audience page picks it up. Do not fork this per page, and do not edit it
 * into something more specific than it is.
 */
export const INTERIM_DISCLOSURE =
  "General information only. This describes financing categories in general " +
  "and is not a statement about any specific building, a loan offer, or a " +
  "commitment to lend. Speak with a licensed professional about your " +
  "situation.";

/**
 * TCPA express written consent, shown beside the required consent checkbox on
 * the audience-page lead form.
 *
 * Supplied wording, reproduced verbatim. This is the language the checkbox
 * attests to, so it is the language that would have to be produced as evidence
 * of consent — do not reword, reflow, abridge or "tidy" it, and do not let a
 * page pass its own variant. One string, one meaning, every form.
 *
 * The named party is the entity that will be calling and texting. If that ever
 * stops being Olgas Friends LLC, this string is wrong and must be reissued
 * rather than edited around.
 */
export const consentText =
  "By checking this box and providing my phone number, I consent to receive " +
  "calls, text messages, and/or pre-recorded voicemails from Olgas Friends " +
  "LLC via automated technology at the number provided regarding my inquiries " +
  "and mortgage updates, even if I'm on a Do Not Call list. Consent is not a " +
  "condition of purchase. Message frequency varies. Message and data rates " +
  "may apply. Reply STOP to opt out or HELP for help. SMS consent is not " +
  "shared with third parties.";
