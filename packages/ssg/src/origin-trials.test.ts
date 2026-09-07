import { describe, expect, it } from "vite-plus/test";
import { checkOriginTrials, type OriginTrial } from "./origin-trials.ts";

const trial = (over: Partial<OriginTrial> = {}): OriginTrial => ({
  feature: "SomeFeature",
  token: "AaBbCc==",
  expires: "2026-12-31",
  ...over,
});

const now = new Date("2026-08-24T00:00:00Z");

describe("checkOriginTrials", () => {
  it("when no trials are configured, returns no warnings", () => {
    // Act & Assert
    expect(checkOriginTrials([], now)).toEqual([]);
  });

  it("when a token expires far in the future, returns no warnings", () => {
    // Act & Assert
    expect(checkOriginTrials([trial()], now)).toEqual([]);
  });

  it("when a token expires within 14 days, returns a warning naming the feature and expiry", () => {
    // Arrange
    const trials = [trial({ expires: "2026-09-01" })];
    // Act
    const warnings = checkOriginTrials(trials, now);
    // Assert
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("SomeFeature");
    expect(warnings[0]).toContain("2026-09-01");
  });

  it("when a token is already expired, throws an error naming the feature", () => {
    // Arrange
    const trials = [trial({ expires: "2026-08-01" })];
    // Act & Assert
    expect(() => checkOriginTrials(trials, now)).toThrow(/SomeFeature.*2026-08-01/);
  });

  it("when now is still within the expiry date's calendar day, does not throw", () => {
    // Arrange
    const trials = [trial({ expires: "2026-08-24" })];
    // Act & Assert
    expect(() => checkOriginTrials(trials, now)).not.toThrow();
  });

  it("when now is past the end of the expiry date's calendar day, throws", () => {
    // Arrange
    const trials = [trial({ expires: "2026-08-23" })];
    // Act & Assert
    expect(() => checkOriginTrials(trials, now)).toThrow(/SomeFeature.*2026-08-23/);
  });

  it("when a token's expires date is unparseable, throws naming the feature", () => {
    // Arrange
    const trials = [trial({ expires: "not-a-date" })];
    // Act & Assert
    expect(() => checkOriginTrials(trials, now)).toThrow(/SomeFeature.*not-a-date/);
  });
});
