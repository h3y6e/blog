// Cross-document view transitions for the post list: only the link actually
// involved in the navigation gets a view-transition-name, so the other titles
// don't each become their own animation group. Without pageswap/pagereveal
// support no name is ever set and navigation swaps plain.
const NAME = "post-title";

const postLink = (url: string): HTMLElement | null => {
  const path = new URL(url).pathname;
  return path.startsWith("/posts/") ? document.querySelector(`.postlist a[href="${path}"]`) : null;
};

// Leaving the list for a post: name the clicked link on the old page.
addEventListener("pageswap", (e) => {
  const url = e.activation?.entry.url;
  const el = url && postLink(url);
  if (el) el.style.viewTransitionName = NAME;
});

// Arriving at the list from a post: name that post's link on the new page,
// and drop the name once the transition ends so later swaps start clean.
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
