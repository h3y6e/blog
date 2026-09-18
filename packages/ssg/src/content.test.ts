import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { loadPosts, postEntries } from "./content.ts";

const FRONTMATTER = '---\ntitle: "t"\ndate: 2020-12-18\ntags: []\nrss_description: "d"\n';

const site = (dir: string, body: string, files: string[] = []): string => {
  const root = mkdtempSync(join(tmpdir(), "posts-"));
  const post = join(root, dir);
  mkdirSync(post, { recursive: true });
  writeFileSync(join(post, "index.md"), `${FRONTMATTER}---\n${body}`);
  for (const f of files) writeFileSync(join(post, f), "");
  writeFileSync(join(root, "embeds.json"), "{}");
  return root;
};

describe("loadPosts", () => {
  it("when a post lives at YYYY/MM/DD/slug/index.md, its slug is the directory and relative media resolve under its URL", async () => {
    // Arrange
    const root = site("2020/12/18/a2net", "![r](rack.jpg)\n", ["rack.jpg"]);
    // Act
    const [post] = await loadPosts(root, join(root, "embeds.json"));
    // Assert
    expect(post).toMatchObject({ slug: "a2net", date: "2020-12-18" });
    expect(post!.html).toContain('src="/posts/2020/12/18/a2net/rack.jpg"');
  });

  it("when the directory does not match the frontmatter date, loading throws", async () => {
    // Arrange
    const root = site("2020/12/19/a2net", "");
    // Act & Assert
    await expect(loadPosts(root, join(root, "embeds.json"))).rejects.toThrow(
      "date 2020-12-18 does not match directory 2020/12/19/a2net",
    );
  });

  it("when the cover is missing from the post directory, loading throws", async () => {
    // Arrange
    const root = mkdtempSync(join(tmpdir(), "posts-"));
    const post = join(root, "2020/12/18/a2net");
    mkdirSync(post, { recursive: true });
    writeFileSync(join(post, "index.md"), `${FRONTMATTER}cover: "rack.jpg"\n---\n`);
    writeFileSync(join(root, "embeds.json"), "{}");
    // Act & Assert
    await expect(loadPosts(root, join(root, "embeds.json"))).rejects.toThrow(
      "cover not found: rack.jpg",
    );
  });

  it("when a relative image is missing from the post directory, loading throws", async () => {
    // Arrange
    const root = site("2020/12/18/a2net", "![r](rack.jpg)\n");
    // Act & Assert
    await expect(loadPosts(root, join(root, "embeds.json"))).rejects.toThrow(
      "media not found: rack.jpg",
    );
  });

  it("when index.ts and index.css sit beside index.md, the post records their paths; otherwise it has none", async () => {
    // Arrange
    const root = site("2020/12/18/a2net", "", ["index.ts", "index.css"]);
    const plain = site("2020/12/18/plain", "");
    // Act
    const [both] = await loadPosts(root, join(root, "embeds.json"));
    const [neither] = await loadPosts(plain, join(plain, "embeds.json"));
    // Assert
    expect(both).toMatchObject({
      script: join(root, "2020/12/18/a2net/index.ts"),
      style: join(root, "2020/12/18/a2net/index.css"),
    });
    expect(neither!.script).toBeUndefined();
    expect(neither!.style).toBeUndefined();
  });
});

describe("postEntries", () => {
  it("when scanning the posts dir, maps each index.ts / index.css beside an index.md to its page URL and ignores other files", () => {
    // Arrange
    const root = site("2020/12/18/a2net", "", ["index.ts", "other.ts"]);
    mkdirSync(join(root, "2020/12/19/styled"), { recursive: true });
    writeFileSync(join(root, "2020/12/19/styled/index.md"), `${FRONTMATTER}---\n`);
    writeFileSync(join(root, "2020/12/19/styled/index.css"), "");
    // Act & Assert
    expect(postEntries(root)).toEqual([
      { url: "/posts/2020/12/18/a2net/index.js", path: join(root, "2020/12/18/a2net/index.ts") },
      {
        url: "/posts/2020/12/19/styled/index.css",
        path: join(root, "2020/12/19/styled/index.css"),
      },
    ]);
  });
});
