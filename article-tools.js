(function () {
  "use strict";

  const menuIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const shareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></svg>';

  function getShareSummary() {
    const description = document.querySelector('meta[name="description"]');
    if (description && description.content) return description.content;

    const article = document.querySelector("#post-article, #projects-article");
    if (!article) return "A post by David Olutunde.";

    const paragraphs = Array.from(article.querySelectorAll("p"));
    const summary = paragraphs.find(function (paragraph) {
      const text = paragraph.textContent.trim();
      return text.length > 70 && !/^Published:/i.test(text);
    });
    if (!summary) return "A post by David Olutunde.";

    const text = summary.textContent.replace(/\s+/g, " ").trim();
    return text.length > 180 ? text.slice(0, 177).trimEnd() + "…" : text;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error("Copy failed"));
  }

  function init() {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/article-tools.css?v=20260901";
    document.head.appendChild(stylesheet);

    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.className = "article-tools-button article-menu-button";
    menuButton.setAttribute("aria-label", "Open site navigation");
    menuButton.setAttribute("aria-controls", "article-navigation");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.innerHTML = menuIcon;

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.className = "article-tools-button article-share-button";
    shareButton.setAttribute("aria-label", "Share this page");
    shareButton.innerHTML = shareIcon + '<span class="article-share-label">Share</span>';

    const backdrop = document.createElement("div");
    backdrop.className = "article-drawer-backdrop";
    backdrop.innerHTML =
      '<aside class="article-drawer" id="article-navigation" aria-label="Site navigation" aria-hidden="true">' +
        '<div class="article-drawer-header">' +
          '<a class="article-drawer-brand" href="/">David Olutunde</a>' +
          '<button class="article-drawer-close" type="button" aria-label="Close site navigation">&times;</button>' +
        '</div>' +
        '<nav>' +
          '<a href="/">Home</a>' +
          '<a href="/posts.html">Posts</a>' +
          '<a href="/projects.html">Projects</a>' +
        '</nav>' +
      '</aside>';

    const toast = document.createElement("div");
    toast.className = "article-share-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    document.body.append(menuButton, shareButton, backdrop, toast);

    const drawer = backdrop.querySelector(".article-drawer");
    const closeButton = backdrop.querySelector(".article-drawer-close");
    const currentSection = location.pathname.startsWith("/posts/") ? "/posts.html" : "/projects.html";
    const currentLink = backdrop.querySelector('a[href="' + currentSection + '"]');
    if (currentLink) currentLink.setAttribute("aria-current", "page");

    let toastTimer;
    function showToast(message) {
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add("is-visible");
      toastTimer = window.setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 2200);
    }

    function openDrawer() {
      backdrop.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      document.body.classList.add("article-drawer-open");
      closeButton.focus();
    }

    function closeDrawer() {
      backdrop.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("article-drawer-open");
      menuButton.focus();
    }

    menuButton.addEventListener("click", openDrawer);
    closeButton.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeDrawer();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && backdrop.classList.contains("is-open")) closeDrawer();
    });

    shareButton.addEventListener("click", async function () {
      const shareData = {
        title: document.title,
        text: getShareSummary(),
        url: location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }
        await copyText(location.href);
        showToast("Link copied — ready to share");
      } catch (error) {
        if (error && error.name === "AbortError") return;
        try {
          await copyText(location.href);
          showToast("Link copied — ready to share");
        } catch (copyError) {
          showToast("Could not copy the link");
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
