var storageKey = "theme";
var rootElement = document.documentElement;
var themeSwitcher = document.getElementById("theme-switcher");
var metaThemeColor = document.querySelector("meta[name='theme-color']");
var storedTheme = localStorage.getItem(storageKey);

metaThemeColor.setAttribute(
  "content",
  storedTheme === "dark" ? "#2f2f2f" : "#fbfbfb",
);
themeSwitcher.innerText = storedTheme === "dark" ? "light" : "dark";

var tweets = document.querySelectorAll(".twitter-tweet");
tweets.forEach(function (tweet) {
  tweet.setAttribute("data-theme", storedTheme);
});

themeSwitcher.onclick = function () {
  const theme = rootElement.getAttribute("data-theme");
  const targetTheme = theme === "dark" ? "light" : "dark";

  metaThemeColor.setAttribute(
    "content",
    targetTheme === "dark" ? "#2f2f2f" : "#fbfbfb",
  );
  document.querySelector(".logo").innerText =
    targetTheme === "dark" ? "#a5ebec" : "#2aa298";
  themeSwitcher.innerText = theme;
  rootElement.setAttribute("data-theme", targetTheme);
  localStorage.setItem(storageKey, targetTheme);

  const tweets = document.querySelectorAll("[data-tweet-id]");
  tweets.forEach(function (tweet) {
    var src = tweet.getAttribute("src");
    tweet.setAttribute(
      "src",
      src.replace(/theme=(light|dark)/, "theme=" + targetTheme),
    );
  });
};
