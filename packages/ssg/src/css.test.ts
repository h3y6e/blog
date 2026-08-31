import { describe, expect, it } from "vite-plus/test";
import { checkCssLowering } from "./css.ts";

describe("checkCssLowering", () => {
  it("when every source marker survives and no fallback vars appear, passes", () => {
    // Arrange
    const markers = ["light-dark(", "@starting-style"];
    const output = "a{color:light-dark(#000,#fff)}@starting-style{a{opacity:0}}";
    // Act & Assert
    expect(() => checkCssLowering(markers, output)).not.toThrow();
  });

  it("when the output contains a --lightningcss- fallback var, throws suggesting cssTarget", () => {
    // Arrange
    const output = "a{--lightningcss-light:initial;color:var(--lightningcss-light,#000)}";
    // Act & Assert
    expect(() => checkCssLowering([], output)).toThrow(/--lightningcss-.*cssTarget/s);
  });

  it("when a source marker is missing from the output, throws naming the lost marker and suggesting cssTarget", () => {
    // Arrange
    const markers = ["light-dark(", "@view-transition"];
    const output = "a{color:#000}@view-transition{navigation:auto}";
    // Act & Assert
    expect(() => checkCssLowering(markers, output)).toThrow(/light-dark\(.*cssTarget/s);
  });

  it("when the source has no markers and the output is plain, passes", () => {
    // Act & Assert
    expect(() => checkCssLowering([], "a{color:red}")).not.toThrow();
  });
});
