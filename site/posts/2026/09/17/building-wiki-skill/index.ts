type Op = "ingest" | "query" | "lint";

const OPS: [Op, string][] = [
  ["ingest", "Ingest: 新しい素材を追加し、schemaに沿って関連ページをまとめて更新する"],
  ["query", "Query: wikiを参照して質問に答え、良い回答は新しいページとしてwikiに戻す"],
  ["lint", "Lint: 矛盾・陳腐化・孤立したページを検知し、修正をwikiに反映する"],
];

class WikiFlow extends HTMLElement {
  #timer: ReturnType<typeof setInterval> | undefined;

  connectedCallback(): void {
    const buttons = new Map<Op, HTMLButtonElement>();
    const nav = document.createElement("div");
    nav.className = "ops";
    nav.setAttribute("role", "tablist");
    const caption = document.createElement("p");
    caption.className = "caption";

    const select = (op: Op): void => {
      this.dataset.op = op;
      caption.textContent = OPS.find(([k]) => k === op)![1];
      for (const [k, b] of buttons) b.setAttribute("aria-selected", String(k === op));
    };
    const ops = OPS.map(([k]) => k);
    for (const op of ops) {
      const b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.textContent = op[0]!.toUpperCase() + op.slice(1);
      b.addEventListener("click", () => {
        clearInterval(this.#timer);
        select(op);
      });
      buttons.set(op, b);
      nav.append(b);
    }
    this.prepend(nav);
    this.append(caption);

    let i = 0;
    select(ops[i]!);
    if (matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      this.#timer = setInterval(() => select(ops[(i = (i + 1) % ops.length)]!), 2500);
    }
  }

  disconnectedCallback(): void {
    clearInterval(this.#timer);
  }
}

customElements.define("wiki-flow", WikiFlow);
