(function () {
  "use strict";

  const root = document.documentElement;
  const themeButton = document.querySelector(".theme-switcher");
  const themeLabel = document.querySelector(".theme-label");
  const themeIcon = document.querySelector(".theme-icon");
  const themeIconPath = themeIcon?.querySelector("path");

  const SUN_PATH =
    "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z";
  const MOON_PATH =
    "M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z";

  function getThemeIsDark() {
    return root.dataset.theme !== "light";
  }

  function applyTheme(isDark, persist) {
    root.dataset.theme = isDark ? "Dark" : "light";

    if (themeLabel) {
      themeLabel.textContent = isDark ? "Escuro" : "Claro";
    }

    if (themeButton) {
      themeButton.setAttribute(
        "aria-label",
        isDark ? "Tema atual: Escuro" : "Tema atual: Claro",
      );
      themeButton.setAttribute("aria-pressed", String(isDark));
    }

    if (themeIcon && themeIconPath) {
      themeIcon.setAttribute("viewBox", isDark ? "0 0 24 24" : "0 0 16 16");
      themeIconPath.setAttribute("d", isDark ? MOON_PATH : SUN_PATH);
    }

    if (persist) {
      try {
        localStorage.setItem("theme", isDark ? "Dark" : "Light");
      } catch {
        // Theme still applies for the current session when storage is blocked.
      }
    }
  }

  applyTheme(getThemeIsDark(), false);

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      applyTheme(!getThemeIsDark(), true);
    });
  }

  const intro = document.querySelector(".intro");
  const primaryNav = document.querySelector(".primary-nav");
  const backButton = document.querySelector(".page-back");
  const pageView = document.querySelector(".page-view");
  let returnTimer;
  let homeRevealTimer;
  const navLinks = primaryNav
    ? Array.from(primaryNav.querySelectorAll(".nav-link"))
    : [];

  function showHome(updateHistory, animateMenu) {
    if (!primaryNav || !intro || !pageView) {
      return;
    }

    primaryNav.classList.remove("is-page-open");
    primaryNav.classList.remove("is-returning");
    primaryNav.classList.remove("is-home-restoring");
    intro.classList.remove("is-page-open");
    if (backButton) {
      backButton.setAttribute("aria-hidden", "true");
      backButton.tabIndex = -1;
    }
    navLinks.forEach(function (link) {
      link.classList.remove("is-selected");
      link.removeAttribute("aria-current");
    });
    pageView.hidden = true;
    pageView.innerHTML = "";

    window.clearTimeout(homeRevealTimer);
    if (animateMenu) {
      primaryNav.classList.add("is-home-restoring");
      homeRevealTimer = window.setTimeout(function () {
        primaryNav.classList.remove("is-home-restoring");
      }, 0);
    }

    if (updateHistory && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  }

  function returnHome(updateHistory) {
    if (!primaryNav.classList.contains("is-page-open")) {
      showHome(updateHistory);
      return;
    }

    const selectedLink = primaryNav.querySelector(".nav-link.is-selected");
    const ghosts = [];

    if (selectedLink) {
      const linkRect = selectedLink.getBoundingClientRect();
      const linkStyles = getComputedStyle(selectedLink);
      const titleGhost = selectedLink.cloneNode(true);
      titleGhost.className = "return-title-ghost";
      titleGhost.style.left = `${linkRect.left}px`;
      titleGhost.style.top = `${linkRect.top}px`;
      titleGhost.style.width = `${linkRect.width}px`;
      titleGhost.style.fontFamily = linkStyles.fontFamily;
      titleGhost.style.fontSize = linkStyles.fontSize;
      titleGhost.style.fontWeight = linkStyles.fontWeight;
      titleGhost.style.lineHeight = linkStyles.lineHeight;
      titleGhost.style.color = linkStyles.color;
      document.body.appendChild(titleGhost);
      ghosts.push(titleGhost);
    }

    if (backButton) {
      const arrowRect = backButton.getBoundingClientRect();
      const arrowGhost = backButton.cloneNode(true);
      arrowGhost.className = "page-back return-arrow-ghost";
      arrowGhost.setAttribute("aria-hidden", "true");
      arrowGhost.style.left = `${arrowRect.left}px`;
      arrowGhost.style.top = `${arrowRect.top}px`;
      document.body.appendChild(arrowGhost);
      ghosts.push(arrowGhost);
    }

    if (updateHistory && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    window.clearTimeout(returnTimer);
    showHome(false, true);
    window.setTimeout(function () {
      ghosts.forEach(function (ghost) {
        ghost.remove();
      });
    }, 400);
  }

  function showPage(link, updateHistory) {
    if (!primaryNav || !intro || !pageView) {
      return;
    }

    const pageName = link.textContent.trim();
    navLinks.forEach(function (navLink) {
      const isSelected = navLink === link;
      navLink.classList.toggle("is-selected", isSelected);
      if (isSelected) {
        navLink.setAttribute("aria-current", "page");
      } else {
        navLink.removeAttribute("aria-current");
      }
    });

    intro.classList.add("is-page-open");
    if (backButton) {
      backButton.setAttribute("aria-hidden", "false");
      backButton.tabIndex = 0;
    }
    if (link.getAttribute("href") === "/projetos/") {
      pageView.innerHTML = `
        <div class="download-page">
          <div class="download-list">
            <div class="download-layout">
              <div class="download-info">
                <h1 class="page-view-title">MuOnline Season 6</h1>
                <p class="download-page-copy">Instalador para Windows · 722 MB</p>
              </div>
              <a class="download-button" href="https://github.com/nlucasreis/lucas-portfolio-site/releases/download/v1.0.0/MU-Online-Season6-Setup.exe" download>
                Baixar
              </a>
            </div>
            <div class="download-layout">
              <div class="download-info">
                <h2 class="download-item-title">LucasDownloader</h2>
                <p class="download-page-copy">Video Downloader para Windows · 1.2.0</p>
              </div>
              <a class="download-button" href="https://github.com/nlucasreis/lucas-portfolio-site/releases/download/v1.0.0/LucasDownloader-Setup-1.2.0.exe" download>
                Baixar
              </a>
            </div>
            <div class="download-layout">
              <div class="download-info">
                <h2 class="download-item-title">Monitor de gastos</h2>
                <p class="download-page-copy">App de monitoramento de gastos · PWA</p>
              </div>
              <a class="download-button" href="https://financas-apptest.vercel.app/" target="_blank" rel="noopener noreferrer">
                Acessar
              </a>
            </div>
          </div>
        </div>
      `;
      pageView.hidden = false;
    } else if (link.getAttribute("href") === "/solicitar-projeto/") {
      pageView.innerHTML = `
        <div class="request-page">
          <h1 class="page-view-title">Solicitar Projeto</h1>
          <form class="project-form">
            <div class="project-form-field">
              <label for="project-type">Tipo de projeto</label>
              <input id="project-type" name="project-type" type="text" placeholder="Ex.: site, sistema ou aplicativo" required />
            </div>
            <div class="project-form-field">
              <label for="project-deadline">Prazo desejado</label>
              <input id="project-deadline" name="project-deadline" type="date" />
            </div>
            <div class="project-form-field project-form-field-wide">
              <label for="project-description">Descrição</label>
              <textarea id="project-description" name="project-description" rows="5" placeholder="Conte o que você precisa e quais objetivos o projeto deve atender." required></textarea>
            </div>
            <div class="project-form-field">
              <label for="project-references">Referências</label>
              <input id="project-references" name="project-references" type="text" placeholder="Links ou exemplos visuais" />
            </div>
            <div class="project-form-field">
              <label for="project-budget">Orçamento estimado</label>
              <input id="project-budget" name="project-budget" type="text" inputmode="decimal" placeholder="Ex.: R$ 5.000" />
            </div>
            <div class="project-form-field project-form-field-wide">
              <label for="project-contact">Contato</label>
              <input id="project-contact" name="project-contact" type="text" placeholder="E-mail, WhatsApp ou outro canal" required />
            </div>
          </form>
        </div>
      `;
      pageView.hidden = false;
    } else {
      pageView.innerHTML = "";
      pageView.hidden = true;
    }
    primaryNav.classList.remove("is-page-open");
    requestAnimationFrame(function () {
      primaryNav.classList.add("is-page-open");
    });

    if (updateHistory) {
      window.history.pushState({}, "", link.getAttribute("href"));
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      if (link.getAttribute("href") === "/") {
        showHome(true);
      } else {
        showPage(link, true);
      }
    });
  });

  if (backButton) {
    backButton.addEventListener("click", function () {
      returnHome(true);
    });
  }

  function isProjectsPath(pathname) {
    return pathname === "/projetos" || pathname === "/projetos/";
  }

  function isRequestPath(pathname) {
    return pathname === "/solicitar-projeto" || pathname === "/solicitar-projeto/";
  }

  function syncRoute() {
    if (isProjectsPath(window.location.pathname) || isRequestPath(window.location.pathname)) {
      const targetPath = isProjectsPath(window.location.pathname)
        ? "/projetos/"
        : "/solicitar-projeto/";
      const projectsLink = navLinks.find(
        (link) => link.getAttribute("href") === targetPath,
      );
      if (projectsLink) {
        showPage(projectsLink, false);
      }
    } else if (primaryNav.classList.contains("is-page-open")) {
      returnHome(false);
    } else {
      showHome(false);
    }
  }

  window.addEventListener("popstate", syncRoute);

  syncRoute();

  const svgNamespace = "http://www.w3.org/2000/svg";

  document.querySelectorAll("svg.stars").forEach(function (layer) {
    for (let index = 0; index < 200; index += 1) {
      const star = document.createElementNS(svgNamespace, "circle");

      star.setAttribute("class", "star");
      star.setAttribute("cx", `${(Math.random() * 100).toFixed(2)}%`);
      star.setAttribute("cy", `${(Math.random() * 100).toFixed(2)}%`);
      star.setAttribute("r", (0.5 + Math.random()).toFixed(1));
      layer.appendChild(star);
    }
  });
})();
