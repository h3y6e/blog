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
      // originTrials: [
      //   { feature: "FeatureName", token: "A1b2C3...==", expires: "2026-12-31" },
      // ],
    }),
  ],
});
