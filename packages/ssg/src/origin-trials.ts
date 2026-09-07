export type OriginTrial = {
  feature: string;
  token: string;
  expires: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WARN_WINDOW_MS = 14 * DAY_MS;

export function checkOriginTrials(trials: OriginTrial[], now: Date = new Date()): string[] {
  // Valid through the end of the `expires` day.
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
