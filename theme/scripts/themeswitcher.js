var storageKey = "theme";
var rootElement = document.documentElement;
var themeSwitcher = document.getElementById("theme-switcher");
var storedTheme = localStorage.getItem(storageKey);

function toggle(theme) {
  return theme === "dark" ? "light" : "dark";
}

themeSwitcher.innerText = toggle(storedTheme);

var tweets = document.querySelectorAll(".twitter-tweet");
tweets.forEach(function (tweet) {
  tweet.setAttribute("data-theme", storedTheme);
});

themeSwitcher.onclick = function () {
  const theme = rootElement.getAttribute("data-theme");
  const targetTheme = toggle(theme);

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
