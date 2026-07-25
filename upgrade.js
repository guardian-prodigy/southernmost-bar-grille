(() => {
  "use strict";
  const DATA = window.SOUTHERNMOST;
  if (!DATA) return;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
  const items = DATA.menu.flatMap((category) => category.items.map((item) => ({ ...item, category: category.name, categoryId: category.id, image: category.image })));

  /* -------------------------------------------------------------------------- */
  /* Mobile menu reader                                                         */
  /* -------------------------------------------------------------------------- */
  const reader = $("#mobile-book-reader");
  const pageNode = $("#mobile-book-page");
  const underlayNode = $("#mobile-book-underlay");
  const shell = $("#mobile-book-shell");
  const pageLabel = $("#mobile-book-label");
  const progress = $("#mobile-book-progress");
  const chapterRow = $("#mobile-book-chapters");

  if (reader && pageNode && underlayNode && shell) {
    const pages = [
      { type: "cover", title: "Cover", chapter: "cover" },
      { type: "intro", title: "Welcome", chapter: "welcome" },
    ];

    DATA.menu.forEach((category) => {
      const pageSize = category.id === "sides" ? 6 : 4;
      for (let index = 0; index < category.items.length; index += pageSize) {
        pages.push({
          type: "menu",
          title: category.items.length > pageSize ? `${category.name} · ${Math.floor(index / pageSize) + 1}` : category.name,
          chapter: category.id,
          category,
          items: category.items.slice(index, index + pageSize),
        });
      }
    });
    pages.push({ type: "back", title: "Visit", chapter: "visit" });

    const pageMarkup = (page) => {
      if (page.type === "cover") {
        return `<div class="mobile-page-cover">
          <span>Coastal kitchen · bar · island vibes</span>
          <img src="assets/southernmost-logo-plate.webp" alt="Southernmost Bar and Grille" />
          <h3>The island<br>menu.</h3>
          <p>Swipe naturally from either edge to turn the page. Every supplied menu item and price lives inside.</p>
          <i class="cover-wave" aria-hidden="true"></i>
        </div>`;
      }
      if (page.type === "intro") {
        return `<div class="mobile-page-menu">
          <header class="mobile-page-menu__head"><small>Welcome to the end of the road</small><h3>Stay for the whole night.</h3><p>Coastal plates, cocktails, billiards and live music—all on one tab when you enter through a Southernmost table QR.</p></header>
          <div class="mobile-page-menu__art"><img src="assets/interior.webp" alt="Southernmost tropical bar atmosphere" /></div>
          <div class="mobile-page-menu__items">
            <article class="mobile-page-item"><h4>Dining in?</h4><strong>Scan QR</strong><p>The code at your seat unlocks ordering, server requests and tab closeout.</p></article>
            <article class="mobile-page-item"><h4>Ordering at home?</h4><strong>Uber Eats</strong><p>Browse here, then continue to delivery for address validation and tracking.</p></article>
          </div>
          <footer class="mobile-page-footer"><span>Southernmost</span><span>West Palm Beach</span></footer>
        </div>`;
      }
      if (page.type === "back") {
        return `<div class="mobile-page-cover">
          <span>4449 Okeechobee Blvd</span>
          <img src="assets/southernmost-mark-plate.webp" alt="Southernmost island mark" />
          <h3>See you<br>after sunset.</h3>
          <p>Monday–Thursday 11 AM–11 PM<br>Friday–Sunday 11 AM–2 AM</p>
          <a class="button button--coral" href="#visit">Plan your visit</a>
        </div>`;
      }
      const category = page.category;
      return `<div class="mobile-page-menu">
        <header class="mobile-page-menu__head"><small>${safe(category.subtitle || "Southernmost menu")}</small><h3>${safe(page.title)}</h3><p>${page.chapter === "wings" ? "Choose a size, signature flavor and extras." : "Prices reflect the supplied Southernmost menu artwork."}</p></header>
        <div class="mobile-page-menu__art"><img src="${safe(category.image)}" alt="${safe(category.name)}" /></div>
        <div class="mobile-page-menu__items">
          ${page.items.map((item) => `<article class="mobile-page-item"><h4>${safe(item.name)}</h4><strong>${money(item.price)}</strong><p>${safe(item.description)}</p><button type="button" data-item-action="${safe(item.id)}">${new URLSearchParams(location.search).has("table") ? "Customize +" : "View details"}</button></article>`).join("")}
        </div>
        <footer class="mobile-page-footer"><span>${safe(category.name)}</span><span>Southernmost</span></footer>
      </div>`;
    };

    let index = 0;
    let drag = null;
    let horizontalIntent = false;
    let settlingTimer = null;

    const chapterOrder = [
      { id: "cover", label: "Cover" },
      ...DATA.menu.map((category) => ({ id: category.id, label: category.name.replace("World-Famous ", "") })),
      { id: "visit", label: "Visit" },
    ];
    chapterRow.innerHTML = chapterOrder.map((chapter) => `<button type="button" data-mobile-chapter="${safe(chapter.id)}">${safe(chapter.label)}</button>`).join("");

    const setTransform = (x = 0, rotation = 0, scale = 1) => {
      reader.style.setProperty("--drag-x", `${x}px`);
      reader.style.setProperty("--drag-r", `${rotation}deg`);
      reader.style.setProperty("--page-scale", String(scale));
    };

    const render = (direction = 1) => {
      clearTimeout(settlingTimer);
      const current = pages[index];
      pageNode.innerHTML = pageMarkup(current);
      pageLabel.textContent = current.title;
      progress.style.transform = `scaleX(${index / Math.max(1, pages.length - 1)})`;
      underlayNode.innerHTML = pageMarkup(pages[Math.max(0, Math.min(pages.length - 1, index + direction))]);
      $$('[data-mobile-chapter]', chapterRow).forEach((button) => {
        const active = button.dataset.mobileChapter === current.chapter;
        button.classList.toggle("is-active", active);
        if (active) button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
      setTransform();
    };

    const finishTurn = (direction, committed) => {
      reader.classList.remove("is-dragging");
      reader.classList.add("is-settling");
      if (committed) {
        const offscreen = direction > 0 ? -shell.clientWidth * 1.07 : shell.clientWidth * 1.07;
        setTransform(offscreen, direction > 0 ? -78 : 78, .96);
        settlingTimer = setTimeout(() => {
          index = Math.max(0, Math.min(pages.length - 1, index + direction));
          reader.classList.remove("is-settling");
          render(direction);
        }, 380);
      } else {
        setTransform();
        settlingTimer = setTimeout(() => reader.classList.remove("is-settling"), 430);
      }
      drag = null;
      horizontalIntent = false;
    };

    const begin = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest("button,a,input")) return;
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, time: performance.now(), lastX: event.clientX };
      horizontalIntent = false;
      underlayNode.innerHTML = pageMarkup(pages[Math.max(0, Math.min(pages.length - 1, index + (event.clientX > shell.getBoundingClientRect().left + shell.clientWidth / 2 ? 1 : -1)))]);
    };

    const move = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!horizontalIntent && Math.max(Math.abs(dx), Math.abs(dy)) > 7) {
        if (Math.abs(dx) <= Math.abs(dy) * 1.15) { drag = null; return; }
        horizontalIntent = true;
        reader.classList.add("is-dragging");
        try { pageNode.setPointerCapture(event.pointerId); } catch {}
      }
      if (!horizontalIntent) return;
      event.preventDefault();
      const width = Math.max(1, shell.clientWidth);
      const bounded = Math.max(-width * 1.05, Math.min(width * 1.05, dx));
      const progressAmount = Math.min(1, Math.abs(bounded) / width);
      const rotation = bounded < 0 ? -progressAmount * 72 : progressAmount * 72;
      setTransform(bounded, rotation, 1 - progressAmount * .035);
      const direction = bounded < 0 ? 1 : -1;
      underlayNode.innerHTML = pageMarkup(pages[Math.max(0, Math.min(pages.length - 1, index + direction))]);
      drag.lastX = event.clientX;
    };

    const end = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!horizontalIntent) { drag = null; return; }
      const dx = event.clientX - drag.startX;
      const elapsed = Math.max(1, performance.now() - drag.time);
      const velocity = Math.abs(dx) / elapsed;
      const direction = dx < 0 ? 1 : -1;
      const inBounds = index + direction >= 0 && index + direction < pages.length;
      finishTurn(direction, inBounds && (Math.abs(dx) > shell.clientWidth * .26 || velocity > .48));
    };

    shell.addEventListener("pointerdown", begin);
    shell.addEventListener("pointermove", move, { passive: false });
    shell.addEventListener("pointerup", end);
    shell.addEventListener("pointercancel", end);
    shell.addEventListener("contextmenu", (event) => event.preventDefault());
    pageNode.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); if (index < pages.length - 1) { index += 1; render(1); } }
      if (event.key === "ArrowLeft") { event.preventDefault(); if (index > 0) { index -= 1; render(-1); } }
    });
    $("#mobile-book-next")?.addEventListener("click", () => { if (index < pages.length - 1) { index += 1; render(1); } });
    $("#mobile-book-prev")?.addEventListener("click", () => { if (index > 0) { index -= 1; render(-1); } });
    chapterRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mobile-chapter]");
      if (!button) return;
      const target = pages.findIndex((page) => page.chapter === button.dataset.mobileChapter);
      if (target >= 0) { const direction = target >= index ? 1 : -1; index = target; render(direction); }
    });
    render(1);
  }

  /* -------------------------------------------------------------------------- */
  /* On-device Island Guide                                                     */
  /* -------------------------------------------------------------------------- */
  const panel = $("#guide-panel");
  const backdrop = $("#guide-backdrop");
  const messages = $("#guide-messages");
  const guideForm = $("#guide-form");
  const guideInput = $("#guide-input");

  if (panel && backdrop && messages) {
    const openGuide = () => {
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
      });
      document.body.classList.add("no-scroll");
      setTimeout(() => guideInput?.focus(), 320);
    };
    const closeGuide = () => {
      backdrop.classList.remove("is-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      setTimeout(() => { backdrop.hidden = true; document.body.classList.remove("no-scroll"); }, 300);
    };
    $$('[data-open-guide]').forEach((button) => button.addEventListener("click", openGuide));
    $$('[data-close-guide]').forEach((button) => button.addEventListener("click", closeGuide));
    backdrop.addEventListener("click", closeGuide);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("is-open")) closeGuide(); });

    const appendMessage = (role, html) => {
      const node = document.createElement("div");
      node.className = `guide-message guide-message--${role}`;
      node.innerHTML = html;
      messages.appendChild(node);
      messages.scrollTop = messages.scrollHeight;
      return node;
    };
    const resultCards = (matches) => matches.slice(0, 3).map((item) => `<button type="button" class="guide-result" data-item-action="${safe(item.id)}"><img src="${safe(item.image)}" alt="" /><span><b>${safe(item.name)}</b><small>${safe(item.category)}</small></span><strong>${money(item.price)}</strong></button>`).join("");

    const answer = (rawQuestion) => {
      const question = String(rawQuestion || "").trim();
      if (!question) return;
      appendMessage("user", safe(question));
      const q = question.toLowerCase();
      let response = "";
      let matches = [];

      const budgetMatch = q.match(/(?:under|below|less than|up to)\s*\$?\s*(\d+)/);
      const budget = budgetMatch ? Number(budgetMatch[1]) : null;
      const terms = q.split(/\s+/).filter((word) => word.length > 3 && !["what","with","that","this","best","something","recommend","please","menu","option","options"].includes(word));

      if (q.includes("table") || q.includes("tab") || q.includes("qr") || q.includes("server") || q.includes("waiter")) {
        response = `<strong>Your QR carries the table or billiards-station number into the menu.</strong> Verify a first name and mobile number, order in rounds, request the assigned server, add a tip and close digitally or ask for an in-person card tap.`;
      } else if (q.includes("happy") || q.includes("special")) {
        response = `<strong>Happy hour runs ${safe(DATA.site.happyHour.label)}, ${safe(DATA.site.happyHour.time)}.</strong> ${DATA.site.happyHour.specials.map(safe).join(" · ")}.`;
      } else if (q.includes("hour") || q.includes("open") || q.includes("close") || q.includes("late")) {
        response = `<strong>Southernmost is open Monday–Thursday 11 AM–11 PM and Friday–Sunday 11 AM–2 AM.</strong>`;
      } else if (q.includes("billiard") || q.includes("pool") || q.includes("game")) {
        response = `<strong>The billiards lounge is open nightly.</strong> A station QR can keep food, cocktails and service requests attached to the same running tab while you play.`;
      } else if (q.includes("music") || q.includes("event") || q.includes("friday") || q.includes("saturday")) {
        response = `<strong>Friday and Saturday are the primary live-music nights.</strong> The event calendar also includes Sunday acoustic programming, billiards and game-day watch parties.`;
      } else {
        if (q.includes("spicy") || q.includes("hot") || q.includes("jerk")) matches = items.filter((item) => /jerk|habanero|nashville|buffalo|sriracha|pepper/i.test(`${item.name} ${item.description} ${item.badge || ""}`));
        else if (q.includes("seafood") || q.includes("fish") || q.includes("mahi") || q.includes("shrimp")) matches = items.filter((item) => /mahi|shrimp|fish|seafood|conch|crab|scallop/i.test(`${item.name} ${item.description}`));
        else if (q.includes("cocktail") || q.includes("drink") || q.includes("rum") || q.includes("margarita")) matches = items.filter((item) => item.categoryId === "cocktails");
        else if (q.includes("burger") || q.includes("sandwich")) matches = items.filter((item) => item.categoryId === "burgers");
        else if (q.includes("dessert") || q.includes("sweet") || q.includes("key lime")) matches = items.filter((item) => item.categoryId === "desserts");
        else if (q.includes("signature") || q.includes("lamb") || q.includes("steak")) matches = items.filter((item) => item.categoryId === "signatures");
        else matches = items.filter((item) => terms.some((term) => `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term)));
        if (budget !== null) matches = (matches.length ? matches : items).filter((item) => Number(item.price) <= budget).sort((a, b) => b.price - a.price);
        if (!matches.length) matches = [items.find((item) => item.id === "jerk-lamb-chops"), items.find((item) => item.id === "blackened-mahi"), items.find((item) => item.id === "southernmost-burger")].filter(Boolean);
        response = budget !== null ? `<strong>These are strong picks at or under ${money(budget)}.</strong> Tap one to open its full options.` : `<strong>These fit what you’re describing.</strong> Tap a recommendation for modifiers, availability and ordering options.`;
      }

      window.setTimeout(() => appendMessage("assistant", `${response}${matches.length ? `<div class="guide-results">${resultCards(matches)}</div>` : ""}`), 220);
    };

    appendMessage("assistant", `<strong>Welcome to the Island Guide.</strong> Ask for a meal under a budget, seafood, spicy food, cocktails, hours, events or help with the table tab.`);
    $$('[data-guide-prompt]').forEach((button) => button.addEventListener("click", () => answer(button.dataset.guidePrompt)));
    guideForm?.addEventListener("submit", (event) => { event.preventDefault(); const value = guideInput.value; guideInput.value = ""; answer(value); });
    messages.addEventListener("click", (event) => { if (event.target.closest("[data-item-action]")) closeGuide(); });
  }

  /* Stable mobile controls: remove any stale inline scroll transforms. */
  const mobileBar = $(".mobile-action-bar");
  if (mobileBar) {
    mobileBar.style.transform = "none";
    mobileBar.style.opacity = "1";
    mobileBar.style.visibility = "visible";
  }
})();
