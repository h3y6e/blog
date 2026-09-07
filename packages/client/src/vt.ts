const NAME = "post-title";

const postLink = (url: string): HTMLElement | null => {
  const path = new URL(url).pathname;
  return path.startsWith("/posts/") ? document.querySelector(`.postlist a[href="${path}"]`) : null;
};

addEventListener("pageswap", (e) => {
  const url = e.activation?.entry.url;
  const el = url && postLink(url);
  if (el) el.style.viewTransitionName = NAME;
});

addEventListener("pagereveal", (e) => {
  const transition = e.viewTransition;
  const url = navigation.activation?.from?.url;
  const el = transition && url && postLink(url);
  if (el) {
    el.style.viewTransitionName = NAME;
    void transition.finished.finally(() => {
      el.style.viewTransitionName = "";
    });
  }
});
