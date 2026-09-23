import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { ssg } from "./index.ts";
import type { SiteConfig } from "./types.ts";

const site: SiteConfig = {
  siteUrl: "https://blog.h3y6e.com",
  title: "t",
  description: "d",
  author: "a",
  authorUrl: "https://h3y6e.com",
  postsDir: "posts",
  embedsFile: "embeds.json",
  tagPath: "tags",
  typePath: "types",
  postTypes: [],
};

describe("ssg", () => {
  it("when configuring vite, copies site/public to the site root as the public directory", () => {
    // Arrange
    const root = mkdtempSync(join(tmpdir(), "ssg-"));
    mkdirSync(join(root, "posts"));
    const plugin = ssg(site);
    // Act
    const config = plugin.config({ root });
    // Assert
    expect(config).toMatchObject({ publicDir: "public" });
  });
});
