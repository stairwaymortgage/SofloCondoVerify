/**
 * Number formatting for a US audience.
 *
 * Bare `toLocaleString()` follows the *server's* locale, which on this machine
 * grouped 182,760 as "1,82,760". Every count the site prints goes through here
 * so the output doesn't depend on where it was rendered.
 */
const US = new Intl.NumberFormat("en-US");

export function num(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? "0"
    : US.format(value);
}
