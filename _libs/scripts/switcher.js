var storageKey="theme",rootElement=document.documentElement,themeSwitcher=document.getElementById("theme-switcher"),metaThemeColor=document.querySelector("meta[name='theme-color']"),storedTheme=localStorage.getItem(storageKey);metaThemeColor.setAttribute("content","dark"===storedTheme?"#2f2f2f":"#fbfbfb"),themeSwitcher.innerText="dark"===storedTheme?"light":"dark",document.querySelectorAll(".twitter-tweet").forEach(function(e){e.setAttribute("data-theme",storedTheme)}),themeSwitcher.onclick=function(){var e=rootElement.getAttribute("data-theme"),t="dark"===e?"light":"dark";document.getElementById("menu-trigger").checked=!1,metaThemeColor.setAttribute("content","dark"===t?"#2f2f2f":"#fbfbfb"),document.querySelector(".logo").innerText="dark"===t?"#a5ebec":"#2aa298",themeSwitcher.innerText=e,rootElement.setAttribute("data-theme",t),localStorage.setItem(storageKey,t),document.querySelectorAll("[data-tweet-id]").forEach(function(e){var r=e.getAttribute("src");e.setAttribute("src",r.replace(/theme=(light|dark)/,"theme="+t))})};