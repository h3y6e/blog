const targets = document.querySelectorAll<HTMLElement>("[data-webmention-target]");
if (targets.length > 0) {
  const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (local) {
    for (const el of targets) {
      if (!el.hasAttribute("data-webmention-api")) {
        el.setAttribute("data-webmention-api", "https://webmention.io/api/example/mentions.jf2");
      }
    }
  }

  const css = "https://webmention.io/assets/webmention-render.css";
  if (!document.querySelector(`link[href="${css}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = css;
    const first = document.querySelector('link[rel="stylesheet"]');
    if (first) first.before(link);
    else document.head.appendChild(link);
  }

  const js = "https://webmention.io/js/webmention-render.js";
  if (!document.querySelector(`script[src="${js}"]`)) {
    const script = document.createElement("script");
    script.src = js;
    script.defer = true;
    document.body.appendChild(script);
  }
}
