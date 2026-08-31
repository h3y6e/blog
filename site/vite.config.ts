import { defineConfig } from "vite-plus";
import { ssg } from "@blog/ssg";

export default defineConfig({
  build: {
    // Baseline Newly available browsers (AGENTS.md policy): keep modern CSS
    // like light-dark() untranspiled instead of lowering to broken fallbacks.
    cssTarget: ["chrome123", "edge123", "firefox120", "safari17.5"],
  },
  plugins: [
    ssg({
      siteUrl: "https://blog.h3y6e.com",
      title: "#a5ebec",
      description: "へいほぅの殴り書き",
      author: "heyhoe",
      authorUrl: "https://h3y6e.com",
      postsDir: "posts",
      embedsFile: "embeds.json",
      tagPath: "tags",
      // Chrome origin trial tokens (https://developer.chrome.com/origintrials);
      // expired tokens fail the build, soon-to-expire ones warn.
      originTrials: [
        {
          feature: "WebMCP",
          token:
            "Al8C6tCMIZKvAcPP/oqix4f5unLD9ELH4t+Cnt9AjEcz9k8bZw5FwVmMemYUggTIepT0bx8lftOFVl7aY3h3sQsAAABOeyJvcmlnaW4iOiJodHRwczovL2Jsb2cuaDN5NmUuY29tOjQ0MyIsImZlYXR1cmUiOiJXZWJNQ1AiLCJleHBpcnkiOjE3OTQ4NzM2MDB9",
          expires: "2026-11-17",
        },
        {
          feature: "SpeculationRulesModerateViewportHeuristicsControl",
          token:
            "AhsWPIMw9ehIglTdISfST3wZXLybgrWvF8j4Gv2R6H7tZqAA+Nguo5jZCOWZavBg30CKwNcmKLWbfs5PkQHW8AQAAAB5eyJvcmlnaW4iOiJodHRwczovL2Jsb2cuaDN5NmUuY29tOjQ0MyIsImZlYXR1cmUiOiJTcGVjdWxhdGlvblJ1bGVzTW9kZXJhdGVWaWV3cG9ydEhldXJpc3RpY3NDb250cm9sIiwiZXhwaXJ5IjoxNzk2Njg4MDAwfQ==",
          expires: "2026-12-08",
        },
        {
          feature: "SpeculationMeasurement",
          token:
            "AvdeqqAX5eUXiTadQBoBXWc5Bk1K9ubxyiZbIrP1cNetNBKq4DLJkuIVDXfocjD2HglTnMi9n7mNrSW+2gcEbQYAAABeeyJvcmlnaW4iOiJodHRwczovL2Jsb2cuaDN5NmUuY29tOjQ0MyIsImZlYXR1cmUiOiJTcGVjdWxhdGlvbk1lYXN1cmVtZW50IiwiZXhwaXJ5IjoxNzkzNjY0MDAwfQ==",
          expires: "2026-11-03",
        },
      ],
    }),
  ],
});
