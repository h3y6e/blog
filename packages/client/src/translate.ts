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

const translatable = (node: Node, root: Element): node is Text => {
  const parent = node.parentElement;
  const scope = parent?.closest("[lang]");
  return (
    node instanceof Text &&
    parent instanceof HTMLElement &&
    parent.translate &&
    (scope === root || scope?.getAttribute("lang") === source) &&
    !(parent instanceof HTMLScriptElement || parent instanceof HTMLStyleElement) &&
    node.data.trim() !== ""
  );
};

const textNodes = (node: Node, root: Element): Text[] => {
  if (node instanceof Text) return translatable(node, root) ? [node] : [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      translatable(n, root) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n instanceof Text; n = walker.nextNode()) nodes.push(n);
  return nodes;
};

class TranslatePost extends HTMLElement {
  #options: TranslatorOptions = { sourceLanguage: source, targetLanguage: target! };
  #label = `Translate to ${new Intl.DisplayNames(["en"], { type: "language" }).of(target!)}`;
  #button = this.querySelector("button")!;
  #root = this.closest(".h-entry")!;
  #translated = false;
  #translator: TranslatorInstance | undefined;
  #cache = new Map<string, Promise<string>>();
  #applied = new WeakMap<Text, { original: string; translated: string }>();
  #observer = new MutationObserver((records) => {
    void this.#translate(
      records.flatMap((r) =>
        r.type === "characterData"
          ? textNodes(r.target, this.#root)
          : [...r.addedNodes].flatMap((n) => textNodes(n, this.#root)),
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
    if (this.#translated) {
      this.#restore();
      return;
    }
    this.#button.disabled = true;
    try {
      this.#translator ??= await this.#createTranslator();
      this.#translated = true;
      this.#observer.observe(this.#root, { subtree: true, childList: true, characterData: true });
      await this.#translate(textNodes(this.#root, this.#root));
      this.#root.setAttribute("lang", target!);
      this.#show(true, "Show original");
    } catch (error) {
      this.#restore();
      throw error;
    } finally {
      this.#button.disabled = false;
    }
  }

  #restore(): void {
    this.#translated = false;
    this.#observer.disconnect();
    for (const node of textNodes(this.#root, this.#root)) {
      const applied = this.#applied.get(node);
      if (applied?.translated === node.data) node.data = applied.original;
    }
    this.#root.removeAttribute("lang");
    this.#show(false, this.#label);
  }

  async #translate(nodes: Text[]): Promise<void> {
    const jobs = nodes
      .filter((node) => this.#applied.get(node)?.translated !== node.data)
      .map((node) => ({ node, original: node.data }));
    const translations = await Promise.all(jobs.map((job) => this.#translateText(job.original)));
    for (const [i, { node, original }] of jobs.entries()) {
      if (!this.#translated || node.data !== original) continue;
      const translated = translations[i]!;
      this.#applied.set(node, { original, translated });
      node.data = translated;
    }
  }

  #translateText(text: string): Promise<string> {
    const cached = this.#cache.get(text);
    if (cached) return cached;
    const translated = this.#translateBody(text);
    this.#cache.set(text, translated);
    translated.catch(() => this.#cache.delete(text));
    return translated;
  }

  async #translateBody(text: string): Promise<string> {
    const [, lead, body, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
    return lead + (await this.#translator!.translate(body!)) + trail;
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
