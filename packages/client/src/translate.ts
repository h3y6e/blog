type TranslatorOptions = { sourceLanguage: string; targetLanguage: string };

type TranslatorApi = {
  availability: (
    options: TranslatorOptions,
  ) => Promise<"unavailable" | "downloadable" | "downloading" | "available">;
  create: (
    options: TranslatorOptions & { monitor: (m: CreateMonitor) => void },
  ) => Promise<TranslatorInstance>;
};

type TranslatorInstance = { translate: (input: string) => Promise<string> };

type CreateMonitor = {
  addEventListener: (type: "downloadprogress", listener: (e: ProgressEvent) => void) => void;
};

// oxlint-disable-next-line typescript/consistent-type-definitions, eslint/no-unused-vars
interface Window {
  Translator?: TranslatorApi;
}

const Translator = self.Translator;
const source = document.documentElement.lang;
const target = navigator.languages.find((l) => new Intl.Locale(l).language !== source);

const translatable = (node: Node): node is Text => {
  const parent = node.parentElement;
  return (
    node instanceof Text &&
    parent instanceof HTMLElement &&
    parent.translate &&
    !(parent instanceof HTMLScriptElement || parent instanceof HTMLStyleElement) &&
    node.data.trim() !== ""
  );
};

const textNodes = (root: Node): Text[] => {
  if (root instanceof Text) return translatable(root) ? [root] : [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      translatable(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node instanceof Text; node = walker.nextNode())
    nodes.push(node);
  return nodes;
};

class TranslatePost extends HTMLElement {
  #options: TranslatorOptions = { sourceLanguage: source, targetLanguage: target! };
  #label = `Translate to ${new Intl.DisplayNames(["en"], { type: "language" }).of(target!)}`;
  #button = this.querySelector("button")!;
  #root = this.closest(".h-entry")!;
  #translator: Promise<TranslatorInstance> | undefined;
  #cache = new Map<string, Promise<string>>();
  #applied = new WeakMap<Text, { original: string; translated: string }>();
  #observer = new MutationObserver((records) => {
    void this.#translate(
      records.flatMap((r) =>
        r.type === "characterData" ? textNodes(r.target) : [...r.addedNodes].flatMap(textNodes),
      ),
    );
  });

  async connectedCallback(): Promise<void> {
    if ((await Translator!.availability(this.#options)) === "unavailable") return;
    this.#show(false, this.#label);
    this.#button.addEventListener("click", () => void this.#toggle());
    this.#button.hidden = false;
  }

  #show(translated: boolean, title: string): void {
    this.#button.ariaPressed = String(translated);
    this.#button.title = title;
    this.#button.ariaLabel = title;
  }

  async #toggle(): Promise<void> {
    if (this.#root.hasAttribute("lang")) {
      this.#observer.disconnect();
      for (const node of textNodes(this.#root)) {
        const applied = this.#applied.get(node);
        if (applied?.translated === node.data) node.data = applied.original;
      }
      this.#root.removeAttribute("lang");
      this.#show(false, this.#label);
      return;
    }
    this.#button.disabled = true;
    try {
      this.#observer.observe(this.#root, { subtree: true, childList: true, characterData: true });
      await this.#translate(textNodes(this.#root));
      this.#root.setAttribute("lang", target!);
      this.#show(true, "Show original");
    } finally {
      this.#button.disabled = false;
    }
  }

  async #translate(nodes: Text[]): Promise<void> {
    const jobs = nodes
      .filter((node) => this.#applied.get(node)?.translated !== node.data)
      .map((node) => ({ node, original: node.data }));
    const translations = await Promise.all(jobs.map((job) => this.#translateText(job.original)));
    for (const [i, { node, original }] of jobs.entries()) {
      if (node.data !== original) continue;
      const translated = translations[i]!;
      this.#applied.set(node, { original, translated });
      node.data = translated;
    }
  }

  #translateText(text: string): Promise<string> {
    const translated = this.#cache.get(text) ?? this.#translateBody(text);
    this.#cache.set(text, translated);
    return translated;
  }

  async #translateBody(text: string): Promise<string> {
    this.#translator ??= this.#createTranslator();
    const [, lead, body, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
    return lead + (await (await this.#translator).translate(body!)) + trail;
  }

  async #createTranslator(): Promise<TranslatorInstance> {
    const translator = await Translator!.create({
      ...this.#options,
      monitor: (m) =>
        m.addEventListener("downloadprogress", (e) => {
          this.#button.title = `Downloading ${Math.round(e.loaded * 100)}%`;
        }),
    });
    this.#button.title = "Translating…";
    return translator;
  }
}

if (Translator && target) customElements.define("translate-post", TranslatePost);
