(function () {
  var storageKey = "theme";
  var storedTheme = localStorage.getItem(storageKey) || "dark";

  document.documentElement.setAttribute("data-theme", storedTheme);
  localStorage.setItem(storageKey, storedTheme);
})();
