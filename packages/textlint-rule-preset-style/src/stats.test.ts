import { describe, expect, it } from "vite-plus/test";
import { band, median, quantile } from "./stats.ts";

describe("quantile", () => {
  it("when the quantile falls between samples, interpolates linearly", () => {
    // Arrange
    const values = [1, 2, 3, 4];

    // Act
    const value = quantile(values, 0.25);

    // Assert
    expect(value).toBeCloseTo(1.75);
  });
});

describe("band", () => {
  it("when values vary, warn spans median±IQR and hard reaches the extremes", () => {
    // Arrange
    const values = [10, 20, 30, 40, 50];

    // Act
    const result = band(values, 0, false);

    // Assert
    expect(result.warnMin).toBeCloseTo(10);
    expect(result.warnMax).toBeCloseTo(50);
    expect(result.hardMin).toBeCloseTo(0);
    expect(result.hardMax).toBeCloseTo(70);
  });

  it("when values barely vary, widens the warn band to the floor", () => {
    // Arrange
    const values = [0.5, 0.5, 0.5];

    // Act
    const result = band(values, 0.08, true);

    // Assert
    expect(result.warnMin).toBeCloseTo(0.42);
    expect(result.warnMax).toBeCloseTo(0.58);
  });

  it("when the metric is a ratio, clamps the upper bound to 1", () => {
    // Arrange
    const values = [0.9, 0.95, 1];

    // Act
    const result = band(values, 0.08, true);

    // Assert
    expect(result.warnMax).toBe(1);
    expect(result.hardMax).toBe(1);
  });

  it("when every value is non-negative, keeps the lower bound at zero", () => {
    // Arrange
    const values = [0, 0, 0.02, 0.05];

    // Act
    const result = band(values, 0.08, true);

    // Assert
    expect(result.warnMin).toBe(0);
    expect(result.hardMin).toBe(0);
  });
});

describe("median", () => {
  it("when given an even number of values, averages the middle two", () => {
    // Arrange
    const values = [4, 1, 3, 2];

    // Act
    const value = median(values);

    // Assert
    expect(value).toBe(2.5);
  });
});
