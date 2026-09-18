type Step = "triage" | "verify" | "risk";
type Outcome = "yes" | "no";
type State = `${Step}-${Outcome}`;

const STEPS: [Step, string, string, Record<Outcome, string>][] = [
  [
    "triage",
    "1 · トリアージ",
    "対応要否・種別・深刻度を振り分ける",
    { yes: "対応要", no: "対応不要" },
  ],
  [
    "verify",
    "2 · 出力検証",
    "PRを開く前に説明と差分の一致・範囲・秘密情報を確認する",
    { yes: "合格", no: "不合格" },
  ],
  [
    "risk",
    "3 · リスク分類",
    "マージ前のPRをリスク等級に振り分け、低リスクは自動マージする",
    { yes: "低リスク", no: "高リスク" },
  ],
];
const CYCLE: State[] = [
  "triage-yes",
  "verify-yes",
  "risk-yes",
  "triage-no",
  "verify-no",
  "risk-no",
];

class JevPipeline extends HTMLElement {
  #timer: ReturnType<typeof setInterval> | undefined;

  connectedCallback(): void {
    const buttons = new Map<State, HTMLButtonElement>();
    const nav = document.createElement("div");
    nav.className = "steps";
    const caption = document.createElement("p");
    caption.className = "caption";

    const select = (state: State): void => {
      this.dataset.state = state;
      caption.textContent = STEPS.find(([k]) => state.startsWith(k))![2];
      for (const [k, b] of buttons) b.setAttribute("aria-pressed", String(k === state));
    };
    const pick = (state: State): void => {
      clearInterval(this.#timer);
      select(state);
    };
    for (const [step, name, , outcomes] of STEPS) {
      const group = document.createElement("div");
      group.className = "group";
      const label = document.createElement("span");
      label.className = "name";
      label.textContent = name;
      const choices = document.createElement("div");
      choices.className = "choices";
      for (const outcome of ["yes", "no"] as const) {
        const state: State = `${step}-${outcome}`;
        const b = document.createElement("button");
        b.textContent = outcomes[outcome];
        b.addEventListener("click", () => pick(state));
        buttons.set(state, b);
        choices.append(b);
      }
      group.append(label, choices);
      nav.append(group);
      this.querySelector(`.node[data-step="${step}"]`)?.addEventListener("click", () =>
        pick(`${step}-yes`),
      );
    }
    this.append(nav, caption);

    let i = 0;
    select(CYCLE[i]!);
    if (matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      this.#timer = setInterval(() => select(CYCLE[(i = (i + 1) % CYCLE.length)]!), 2500);
    }
  }

  disconnectedCallback(): void {
    clearInterval(this.#timer);
  }
}

customElements.define("jev-pipeline", JevPipeline);
