(function () {
  var root = document.documentElement;
  var ORDER = ["system", "light", "dark"];

  function read() {
    try {
      var t = localStorage.getItem("theme");
      return t === "light" || t === "dark" ? t : "system";
    } catch (e) {
      return "system";
    }
  }

  function apply(choice) {
    if (choice === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", choice);
    root.setAttribute("data-theme-choice", choice);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      var label = btn.getAttribute("data-label-" + choice) || choice;
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }
  }

  var current = read();
  apply(current);

  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
      try {
        if (current === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", current);
      } catch (e) {}
      apply(current);
    });
  }

  var filters = document.querySelectorAll("[data-filter]");
  var sections = document.querySelectorAll("[data-cat]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      sections.forEach(function (s) {
        s.hidden = cat !== "all" && s.getAttribute("data-cat") !== cat;
      });
    });
  });
  // Hover / touch prefetch of in-site pages for browsers without Speculation Rules (Safari, Firefox).
  var supportsRules = HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules");
  if (!supportsRules) {
    var fetched = {};
    var prefetch = function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.origin !== location.origin || a.pathname.indexOf("/v2/") !== 0) return;
      var href = a.origin + a.pathname;
      if (fetched[href] || href === location.origin + location.pathname) return;
      fetched[href] = true;
      var link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    };
    document.addEventListener("mouseover", prefetch, { passive: true });
    document.addEventListener("touchstart", prefetch, { passive: true });
  }
})();
