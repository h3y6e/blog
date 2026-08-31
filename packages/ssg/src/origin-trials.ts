export type OriginTrial = {
  /** feature name, for build diagnostics only */
  feature: string;
  /** token from https://developer.chrome.com/origintrials */
  token: string;
  /** token expiry date, e.g. "2026-12-31" */
  expires: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WARN_WINDOW_MS = 14 * DAY_MS;

/** Returns warnings for tokens expiring within 14 days; throws for expired ones. */
export function checkOriginTrials(trials: OriginTrial[], now: Date = new Date()): string[] {
  // `expires` is a date-only string (UTC midnight); the token is valid through
  // the end of that day, so expiry is one day past the parsed instant.
  const withExpiry = trials.map((t) => {
    const expiresAt = new Date(t.expires).getTime();
    if (Number.isNaN(expiresAt)) {
      throw new Error(
        `origin trial token for ${t.feature} has an unparseable expires date: ${t.expires}`,
      );
    }
    return { trial: t, expiresAt: expiresAt + DAY_MS };
  });

  const expired = withExpiry.filter(({ expiresAt }) => expiresAt <= now.getTime());
  if (expired.length > 0) {
    const list = expired
      .map(({ trial }) => `${trial.feature} (expired ${trial.expires})`)
      .join(", ");
    throw new Error(`origin trial token(s) expired: ${list}`);
  }
  return withExpiry
    .filter(({ expiresAt }) => expiresAt - now.getTime() <= WARN_WINDOW_MS)
    .map(
      ({ trial }) =>
        `origin trial token for ${trial.feature} expires within 14 days (${trial.expires})`,
    );
}
