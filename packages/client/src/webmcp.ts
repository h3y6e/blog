// Read-only WebMCP tool: in-browser agents can enumerate and filter the
// blog's posts without scraping the DOM. Feature-detected — browsers without
// WebMCP (everything outside the Chrome origin trial) pay nothing.
// document.modelContext is current; navigator.modelContext was deprecated in
// Chromium 150 and covers the earlier preview builds.

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  url: string;
};

type Tool<In> = {
  name: string;
  description: string;
  inputSchema: object;
  execute: (input: In) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
};

type ModelContext = {
  registerTool: (tool: Tool<never>) => void;
};

// Script file (no imports/exports): these top-level interfaces merge into
// lib.dom's globals. Merging requires `interface` and looks unused to lint.
// oxlint-disable typescript/consistent-type-definitions, eslint/no-unused-vars
interface Document {
  modelContext?: ModelContext;
}
interface Navigator {
  modelContext?: ModelContext;
}
// oxlint-enable typescript/consistent-type-definitions, eslint/no-unused-vars

const modelContext = document.modelContext ?? navigator.modelContext;

const postsIndex = async (): Promise<PostMeta[]> => {
  const res = await fetch("/posts.json");
  return res.json();
};

if (modelContext && "registerTool" in modelContext) {
  modelContext.registerTool({
    name: "list_posts",
    description:
      "Lists this blog's posts, newest first, as {slug, title, date (YYYY-MM-DD), tags, description, url}. " +
      "Posts are written in Japanese. Returns every post unless filtered.",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Return only posts carrying exactly this tag." },
        query: {
          type: "string",
          description: "Case-insensitive substring match against title, description and tags.",
        },
      },
    },
    async execute(input: { tag?: string; query?: string }) {
      const posts = await postsIndex();
      const q = input.query?.toLowerCase();
      // Chrome's WebMCP examples return strings, so tools serialize themselves.
      return JSON.stringify(
        posts.filter(
          (p) =>
            (!input.tag || p.tags.includes(input.tag)) &&
            (!q || `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q)),
        ),
      );
    },
    annotations: { readOnlyHint: true },
  });

  modelContext.registerTool({
    name: "get_post",
    description:
      "Fetches one post's full content as Markdown (Japanese), including its title, date, " +
      "tags and canonical URL. Take the slug from list_posts.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "The post's slug, as returned by list_posts." },
      },
      required: ["slug"],
    },
    async execute(input: { slug: string }) {
      // Every post ships a markdown mirror (see @blog/ssg's llms.ts).
      const res = await fetch(`/posts/${encodeURIComponent(input.slug)}/index.md`);
      if (!res.ok) return `Unknown slug "${input.slug}"; pick one from list_posts.`;
      return res.text();
    },
    annotations: { readOnlyHint: true },
  });
}
