// Theme toggle. Colors are pure CSS (color-scheme + light-dark()); this only
// covers what CSS cannot: persistence, button label, logo text, meta
// theme-color, and twitter embeds.
const style = document.documentElement.style;
const byId = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el;
};
const switcher = byId("theme-switcher");
const metaThemeColor = document.querySelector("meta[name='theme-color']");
if (!metaThemeColor) throw new Error("meta[name='theme-color'] missing");
const theme = (): "light" | "dark" => (style.colorScheme === "light" ? "light" : "dark");

const apply = (target: "light" | "dark"): void => {
  style.colorScheme = target;
  metaThemeColor.setAttribute("content", target === "dark" ? "#2f2f2f" : "#fbfbfb");
  const logo = document.querySelector<HTMLElement>(".logo");
  if (logo) logo.innerText = target === "dark" ? "#a5ebec" : "#2aa298";
  switcher.innerText = target === "dark" ? "light" : "dark";
  for (const tweet of document.querySelectorAll(".twitter-tweet")) {
    tweet.setAttribute("data-theme", target);
  }
  for (const tweet of document.querySelectorAll<HTMLIFrameElement>("[data-tweet-id]")) {
    tweet.src = tweet.src.replace(/theme=(light|dark)/, `theme=${target}`);
  }
};

const stored = (): "light" | "dark" =>
  localStorage.getItem("theme") === "light" ? "light" : "dark";

apply(stored());

// Prerendered (speculation rules) and bfcached pages ran their scripts with
// the theme of that moment; re-sync when they are actually shown.
addEventListener("prerenderingchange", () => apply(stored()));
addEventListener("pageshow", (e) => {
  if (e.persisted) apply(stored());
});

switcher.addEventListener("click", () => {
  document.querySelector<HTMLInputElement>("#menu-trigger")!.checked = false;
  const target = theme() === "dark" ? "light" : "dark";
  apply(target);
  localStorage.setItem("theme", target);
});
