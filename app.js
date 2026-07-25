(() => {
  "use strict";

  const DATA = window.SOUTHERNMOST;
  if (!DATA) return;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const uid = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const nowLabel = () => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
  const TAX_RATE = 0.065;
  const zones = Object.keys(DATA.servers);

  const params = new URLSearchParams(location.search);
  const qrContext = {
    table: (params.get("table") || "").trim(),
    zone: zones.includes((params.get("zone") || "").toLowerCase()) ? params.get("zone").toLowerCase() : "dining",
    station: (params.get("station") || "").trim(),
    token: (params.get("token") || "").trim(),
  };
  const tableMode = Boolean(qrContext.table);
  const tableLabel = qrContext.zone === "bar" ? `Bar ${qrContext.table}` : qrContext.zone === "lounge" ? `Billiards ${qrContext.table}` : `Table ${qrContext.table}`;

  const menuItems = DATA.menu.flatMap((category, categoryIndex) => category.items.map((item, itemIndex) => ({
    ...item,
    category: category.name,
    categoryId: category.id,
    categoryImage: category.image,
    id: item.id || `${slug(category.id)}-${slug(item.name)}-${itemIndex}`,
    accent: ["#f7bb38", "#ff6948", "#1cc2ad", "#72b4c8", "#dc9f64", "#8cc8a4", "#dc8fa0", "#b49adb"][categoryIndex % 8],
    available: item.available !== false,
  })));
  const itemMap = new Map(menuItems.map((item) => [item.id, item]));

  const SESSION_PREFIX = "southernmost.table-session.v2";
  const CART_PREFIX = "southernmost.current-order.v2";
  const sessionStorageKey = `${SESSION_PREFIX}:${qrContext.zone}:${qrContext.table || "public"}`;
  const cartStorageKey = `${CART_PREFIX}:${qrContext.zone}:${qrContext.table || "public"}`;

  let session = null;
  let cart = [];
  try { session = tableMode ? JSON.parse(localStorage.getItem(sessionStorageKey) || "null") : null; } catch { session = null; }
  try { cart = tableMode ? JSON.parse(localStorage.getItem(cartStorageKey) || "[]") : []; } catch { cart = []; }
  if (session?.status === "closed") session = null;

  const modal = $("#flow-modal");
  const modalContent = $("#modal-content");
  const cartDrawer = $("#cart-drawer");
  const drawerBackdrop = $("#drawer-backdrop");
  const toastRegion = $("#toast-region");

  function saveSession() {
    if (session && tableMode) localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    else localStorage.removeItem(sessionStorageKey);
    renderSessionState();
    renderCart();
  }
  function saveCart() {
    if (tableMode) localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    renderCart();
  }
  function orderSubtotal(order) { return Number(order.subtotal || order.items?.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) || 0); }
  function openSubtotal() { return session?.orders?.reduce((sum, order) => sum + orderSubtotal(order), 0) || 0; }
  function openTax() { return openSubtotal() * TAX_RATE; }
  function cartSubtotal() { return cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0); }
  function totalWithCart() { return openSubtotal() + openTax() + cartSubtotal(); }
  function maskedPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    return digits.length >= 4 ? `••• ••• ${digits.slice(-4)}` : "Verified mobile";
  }
  function assignedServer() {
    const pool = DATA.servers[qrContext.zone] || DATA.servers.dining;
    const seed = [...String(qrContext.table || "1")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return pool[seed % pool.length];
  }
  function computedOrderStatus(order) {
    const elapsed = Date.now() - Number(order.createdAt || Date.now());
    if (elapsed > 90000) return { label: "Delivered", step: 4 };
    if (elapsed > 52000) return { label: "On the way", step: 3 };
    if (elapsed > 18000) return { label: "Preparing", step: 2 };
    return { label: "Received", step: 1 };
  }

  /* Global navigation and motion */
  const header = $(".site-header");
  const announcement = $(".announcement");
  const progressBar = $(".site-progress span");
  const mobileToggle = $(".menu-toggle");
  const mobileNav = $(".mobile-nav");
  function updateScrollUI() {
    const docHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progressBar.style.transform = `scaleX(${clamp(scrollY / docHeight, 0, 1)})`;
    header.classList.toggle("is-sticky", scrollY > Math.max(50, announcement.offsetHeight));
  }
  updateScrollUI();
  addEventListener("scroll", updateScrollUI, { passive: true });
  addEventListener("resize", updateScrollUI, { passive: true });
  mobileToggle?.addEventListener("click", () => {
    const opening = mobileToggle.getAttribute("aria-expanded") !== "true";
    mobileToggle.setAttribute("aria-expanded", String(opening));
    mobileToggle.classList.toggle("is-open", opening);
    mobileNav.hidden = !opening;
  });
  $$("a,button", mobileNav).forEach((element) => element.addEventListener("click", () => {
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.classList.remove("is-open");
    mobileNav.hidden = true;
  }));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty("--reveal-delay", `${Number(entry.target.dataset.delay || 0)}ms`);
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -5%" });
  $$('[data-reveal]').forEach((element) => revealObserver.observe(element));

  $$(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (matchMedia("(pointer: coarse)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
      card.style.boxShadow = `${-x * 25}px ${15 + y * 20}px 60px rgba(3,31,28,.22)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; card.style.boxShadow = ""; });
  });

  function toast(message) {
    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = message;
    toastRegion.appendChild(element);
    setTimeout(() => { element.classList.add("is-leaving"); setTimeout(() => element.remove(), 260); }, 1900);
  }
  function openModal(markup, afterOpen) {
    modalContent.innerHTML = markup;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    afterOpen?.();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(() => { modal.hidden = true; document.body.classList.remove("no-scroll"); }, 240);
  }
  function openCart() {
    renderCart();
    drawerBackdrop.hidden = false;
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => { drawerBackdrop.classList.add("is-open"); cartDrawer.classList.add("is-open"); });
  }
  function closeCart() {
    drawerBackdrop.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    setTimeout(() => { drawerBackdrop.hidden = true; document.body.classList.remove("no-scroll"); }, 240);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!modal.hidden) closeModal();
    if (cartDrawer.classList.contains("is-open")) closeCart();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) closeModal();
    if (event.target.closest("[data-open-cart]")) openCart();
    if (event.target.closest("[data-close-cart]")) closeCart();
    if (event.target.closest("[data-scroll-order]")) document.querySelector("#order")?.scrollIntoView({ behavior: "smooth" });
  });
  drawerBackdrop.addEventListener("click", closeCart);

  $$('[data-directions-link]').forEach((link) => { link.href = DATA.site.directionsUrl; });
  $$('[data-delivery-link]').forEach((link) => {
    link.href = DATA.site.deliveryUrl;
    if (link.tagName === "BUTTON") link.addEventListener("click", () => window.open(DATA.site.deliveryUrl, "_blank", "noopener"));
  });

  /* Menu book */
  const bookSheets = $("#book-sheets");
  const bookPrev = $("#book-prev");
  const bookNext = $("#book-next");
  const bookPageLabel = $("#book-page-label");
  const bookProgressBar = $("#book-progress-bar");
  const chapterNav = $("#chapter-nav");
  const bookSearch = $("#book-search");
  const menuPages = [
    { type: "cover", title: "Cover", categoryId: "cover" },
    { type: "intro", title: "Welcome", categoryId: "welcome" },
  ];
  DATA.menu.forEach((category) => {
    const chunks = [];
    for (let index = 0; index < category.items.length; index += 5) chunks.push(category.items.slice(index, index + 5));
    chunks.forEach((items, index) => menuPages.push({
      type: "menu",
      title: chunks.length > 1 ? `${category.name} · ${index + 1}` : category.name,
      chapterTitle: category.name,
      categoryId: category.id,
      blurb: category.subtitle,
      items,
    }));
  });
  menuPages.push({ type: "back", title: "Back cover", categoryId: "back" });
  if (menuPages.length % 2 !== 0) menuPages.push({ type: "back", title: "Back cover", categoryId: "back-final" });

  function pageMarkup(page, pageNumber) {
    if (page.type === "cover") return `<div class="menu-page cover-page"><span class="menu-page__eyebrow">Southernmost · West Palm Beach</span><h3>The island<br>menu.</h3><p>Coastal plates, tropical cocktails and the food worth staying late for.</p><span class="cover-prompt">Grab the edge <i></i></span></div>`;
    if (page.type === "intro") return `<div class="menu-page intro-page"><span class="menu-page__eyebrow">Welcome to the end of the road</span><h3>Eat slow.<br>Stay late.</h3><p>Browse the complete Southernmost menu. At the venue, scan the QR code at your table to customize items and send an order directly to your assigned server.</p><div class="intro-seal">S</div><span class="menu-page__number">${String(pageNumber).padStart(2, "0")}</span></div>`;
    if (page.type === "back") return `<div class="menu-page back-cover"><span class="menu-page__eyebrow">See you at Southernmost</span><h3>One more round?</h3><p>4449 Okeechobee Blvd · West Palm Beach<br>Happy hour Monday–Friday · 3–6 PM</p><button class="button button--coral" type="button" data-open-cart>Review your order</button></div>`;
    const items = page.items.map((item) => `<article class="book-menu-item"><h4>${safe(item.name)}${item.badge ? `<span class="book-menu-item__tag">${safe(item.badge)}</span>` : ""}</h4><span class="book-menu-item__price">${money(item.price)}</span><p>${safe(item.description)}</p><button type="button" class="book-menu-item__add" data-item-action="${safe(item.id)}" aria-label="${tableMode ? "Customize" : "View"} ${safe(item.name)}">${tableMode ? "ADD +" : "DETAILS →"}</button></article>`).join("");
    return `<div class="menu-page"><span class="menu-page__eyebrow">${safe(page.chapterTitle || page.title)}</span><h3>${safe(page.title)}</h3><p class="menu-page__blurb">${safe(page.blurb || "")}</p><i class="menu-page__rule"></i><div class="menu-page__items">${items}</div><span class="menu-page__number">${String(pageNumber).padStart(2, "0")}</span></div>`;
  }

  const sheetCount = menuPages.length / 2;
  for (let index = 0; index < sheetCount; index += 1) {
    const sheet = document.createElement("div");
    sheet.className = "book-sheet";
    sheet.dataset.sheet = String(index);
    sheet.innerHTML = `<div class="book-sheet__face book-sheet__front">${pageMarkup(menuPages[index * 2], index * 2 + 1)}</div><div class="book-sheet__face book-sheet__back">${pageMarkup(menuPages[index * 2 + 1], index * 2 + 2)}</div>`;
    bookSheets.appendChild(sheet);
  }
  const sheets = $$(".book-sheet", bookSheets);
  let currentSheet = 0;
  let dragState = null;
  function updateBook() {
    sheets.forEach((sheet, index) => {
      const turned = index < currentSheet;
      sheet.classList.toggle("is-turned", turned);
      sheet.style.zIndex = turned ? String(index + 1) : String(sheetCount - index + 2);
    });
    const pageIndex = currentSheet === 0 ? 0 : Math.min(menuPages.length - 1, currentSheet * 2);
    const page = menuPages[pageIndex] || menuPages.at(-1);
    bookPageLabel.textContent = page.title;
    bookProgressBar.style.transform = `scaleX(${Math.max(0.03, currentSheet / sheetCount)})`;
    bookPrev.disabled = currentSheet <= 0;
    bookNext.disabled = currentSheet >= sheetCount;
    $$("button", chapterNav).forEach((button) => button.classList.toggle("is-active", button.dataset.category === page.categoryId));
  }
  function nextPage() { if (currentSheet < sheetCount) { currentSheet += 1; updateBook(); } }
  function previousPage() { if (currentSheet > 0) { currentSheet -= 1; updateBook(); } }
  function jumpToPage(pageIndex) { currentSheet = clamp(pageIndex % 2 === 0 ? pageIndex / 2 : (pageIndex + 1) / 2, 0, sheetCount); updateBook(); }
  bookNext.addEventListener("click", nextPage);
  bookPrev.addEventListener("click", previousPage);
  document.addEventListener("keydown", (event) => {
    const rect = $("#menu-book-ui").getBoundingClientRect();
    if (!(rect.top < innerHeight && rect.bottom > 0) || /input|textarea|select/i.test(document.activeElement?.tagName || "")) return;
    if (event.key === "ArrowRight") nextPage();
    if (event.key === "ArrowLeft") previousPage();
  });
  const chapterFirstPage = new Map();
  menuPages.forEach((page, index) => { if (page.type === "menu" && !chapterFirstPage.has(page.categoryId)) chapterFirstPage.set(page.categoryId, index); });
  chapterFirstPage.forEach((pageIndex, categoryId) => {
    const category = DATA.menu.find((item) => item.id === categoryId);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.category = categoryId;
    button.textContent = category?.name || categoryId;
    button.addEventListener("click", () => jumpToPage(pageIndex));
    chapterNav.appendChild(button);
  });
  function beginPageDrag(event) {
    if (event.target.closest("button,a,input")) return;
    const sheet = event.currentTarget;
    const index = Number(sheet.dataset.sheet);
    const canNext = index === currentSheet && currentSheet < sheetCount;
    const canPrevious = index === currentSheet - 1 && currentSheet > 0;
    if (!canNext && !canPrevious) return;
    event.preventDefault();
    sheet.setPointerCapture?.(event.pointerId);
    dragState = { sheet, index, direction: canNext ? "next" : "previous", startX: event.clientX, width: sheet.getBoundingClientRect().width, progress: 0 };
    sheet.classList.add("is-dragging");
    sheet.style.zIndex = "999";
  }
  function movePageDrag(event) {
    if (!dragState) return;
    const dx = event.clientX - dragState.startX;
    const progress = dragState.direction === "next" ? clamp(-dx / dragState.width, 0, 1) : clamp(dx / dragState.width, 0, 1);
    dragState.progress = progress;
    dragState.sheet.style.transform = `rotateY(${dragState.direction === "next" ? -180 * progress : -180 + 180 * progress}deg)`;
  }
  function endPageDrag(event) {
    if (!dragState) return;
    const state = dragState;
    dragState = null;
    state.sheet.releasePointerCapture?.(event.pointerId);
    state.sheet.classList.remove("is-dragging");
    state.sheet.style.transform = "";
    if (state.progress > 0.26) currentSheet += state.direction === "next" ? 1 : -1;
    updateBook();
  }
  sheets.forEach((sheet) => {
    sheet.addEventListener("pointerdown", beginPageDrag);
    sheet.addEventListener("pointermove", movePageDrag);
    sheet.addEventListener("pointerup", endPageDrag);
    sheet.addEventListener("pointercancel", endPageDrag);
  });
  let bookSearchTimer;
  bookSearch.addEventListener("input", () => {
    clearTimeout(bookSearchTimer);
    const query = bookSearch.value.trim().toLowerCase();
    if (query.length < 2) return;
    bookSearchTimer = setTimeout(() => {
      const pageIndex = menuPages.findIndex((page) => page.type === "menu" && (`${page.title} ${page.items.map((item) => `${item.name} ${item.description}`).join(" ")}`).toLowerCase().includes(query));
      if (pageIndex >= 0) { jumpToPage(pageIndex); toast(`Opened ${menuPages[pageIndex].title}`); }
      else toast(`No menu item found for “${query}”`);
    }, 220);
  });
  updateBook();

  /* Menu grid */
  const orderGrid = $("#order-grid");
  const filterRow = $("#menu-filters");
  const menuSearch = $("#menu-search");
  const loadMore = $("#load-more-menu");
  let activeFilter = "all";
  let visibleMenuCount = 12;
  [{ id: "all", name: "All" }, ...DATA.menu.map((category) => ({ id: category.id, name: category.name }))].forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.filter = filter.id;
    button.textContent = filter.name;
    button.classList.toggle("is-active", filter.id === "all");
    button.addEventListener("click", () => {
      activeFilter = filter.id;
      visibleMenuCount = 12;
      $$("button", filterRow).forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
      renderOrderGrid();
    });
    filterRow.appendChild(button);
  });
  function filteredMenuItems() {
    const query = menuSearch.value.trim().toLowerCase();
    return menuItems.filter((item) => (activeFilter === "all" || item.categoryId === activeFilter) && (!query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query)));
  }
  function renderOrderGrid() {
    const filtered = filteredMenuItems();
    const visible = filtered.slice(0, visibleMenuCount);
    orderGrid.innerHTML = visible.length ? visible.map((item) => `<article class="order-card order-card--photo" style="--card-accent:${item.accent}">
      <div class="order-card__media">
        <img src="${safe(item.categoryImage)}" alt="${safe(item.name)} from the Southernmost menu" loading="lazy" decoding="async" />
        <span class="order-card__media-badge">${safe(item.category)}</span>
      </div>
      <div class="order-card__body">
        <div class="order-card__status"><span>${safe(item.category)}</span><i class="${item.available ? "is-available" : ""}">${item.available ? "Available" : "Sold out"}</i></div>
        <h3>${safe(item.name)}</h3>
        <p>${safe(item.description)}</p>
        ${item.badge ? `<small class="order-card__badge">${safe(item.badge)}</small>` : ""}
        <div class="order-card__bottom"><span class="order-card__price">${money(item.price)}</span><button class="order-card__add" type="button" data-item-action="${safe(item.id)}" ${item.available ? "" : "disabled"}>${tableMode ? "Customize +" : "View item →"}</button></div>
      </div>
    </article>`).join("") : `<div class="no-results"><h3>No island favorites found.</h3><p>Try another search or menu chapter.</p></div>`;
    loadMore.hidden = visible.length >= filtered.length;
  }
  menuSearch.addEventListener("input", () => { visibleMenuCount = 12; renderOrderGrid(); });
  loadMore.addEventListener("click", () => { visibleMenuCount += 12; renderOrderGrid(); });
  renderOrderGrid();

  /* Public mode and QR entry */
  function publicOrderingPrompt(itemId = "") {
    const item = itemMap.get(itemId);
    openModal(`<div class="modal__hero"><p class="eyebrow">Dine-in ordering</p><h2 id="modal-title">Order from the QR code at your table.</h2><p>The public menu is available for browsing. In-venue QR codes securely attach orders to the correct table, bar seat or billiards station.</p></div><div class="modal__body"><div class="mode-choice-grid"><a class="mode-choice" href="admin/qr-kit.html"><span>⌁</span><strong>Open a table QR</strong><small>Experience table ordering, a running tab and server assignment.</small></a><a class="mode-choice" href="${safe(DATA.site.deliveryUrl)}" target="_blank" rel="noopener"><span>⌂</span><strong>Order delivery</strong><small>Continue through Uber Eats for delivery availability and driver tracking.</small></a></div>${item ? `<div class="selected-item-preview"><span>${safe(item.category)}</span><h3>${safe(item.name)}</h3><p>${safe(item.description)}</p><strong>${money(item.price)}</strong></div>` : ""}<div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Keep browsing</button></div></div>`);
  }

  /* Open tab */
  let pendingItemId = "";
  function openTabFlow(itemId = "") {
    pendingItemId = itemId;
    if (!tableMode) return publicOrderingPrompt(itemId);
    const server = assignedServer();
    let tabStep = 1;
    const draft = { firstName: "", phone: "", paymentPreference: "digital", ageConfirmed: false };
    const render = () => {
      const bars = `<div class="checkout-steps">${[1, 2, 3].map((step) => `<i class="checkout-step ${step <= tabStep ? "is-active" : ""}"></i>`).join("")}</div>`;
      if (tabStep === 1) {
        modalContent.innerHTML = `<div class="modal__hero"><p class="eyebrow">${safe(tableLabel)} · Open a tab</p><h2 id="modal-title">Keep the menu open all night.</h2><p>Your mobile number helps protect the tab, send status updates and reconnect you if the browser closes.</p></div><form class="modal__body" id="tab-step-one">${bars}<div class="table-link-card"><span>Linked location</span><strong>${safe(tableLabel)}</strong><small>${safe(qrContext.zone)} service zone · server assignment follows verification</small></div><div class="form-grid"><div class="field"><label for="tab-first-name">First name</label><input id="tab-first-name" required autocomplete="given-name" maxlength="40" /></div><div class="field"><label for="tab-phone">Mobile number</label><input id="tab-phone" required autocomplete="tel" inputmode="tel" placeholder="(561) 555-0123" /></div><div class="field field--full"><label class="check-field"><input id="tab-consent" type="checkbox" required /><span>I agree to receive transactional messages about this tab and accept the <a href="legal/terms.html" target="_blank">terms of service</a>.</span></label></div></div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Cancel</button><button class="button button--coral" type="submit">Send verification code</button></div></form>`;
        $("#tab-step-one").addEventListener("submit", (event) => {
          event.preventDefault();
          draft.firstName = $("#tab-first-name").value.trim();
          draft.phone = $("#tab-phone").value.trim();
          if (draft.phone.replace(/\D/g, "").length < 10) return toast("Enter a valid mobile number");
          tabStep = 2;
          render();
        });
      } else if (tabStep === 2) {
        modalContent.innerHTML = `<div class="modal__hero"><p class="eyebrow">Mobile verification</p><h2 id="modal-title">Enter the four-digit code.</h2><p>Sent to ${safe(maskedPhone(draft.phone))}. This protects the open tab and lets the guest return from the same phone.</p></div><form class="modal__body" id="tab-step-two">${bars}<div class="otp-grid" aria-label="Four digit verification code"><input inputmode="numeric" maxlength="1" aria-label="Digit 1" autofocus /><input inputmode="numeric" maxlength="1" aria-label="Digit 2" /><input inputmode="numeric" maxlength="1" aria-label="Digit 3" /><input inputmode="numeric" maxlength="1" aria-label="Digit 4" /></div><p class="form-note">SMS delivery is not connected in this temporary client environment. Enter any four digits to continue.</p><div class="form-actions"><button class="button button--ink" type="button" id="tab-code-back">Back</button><button class="button button--coral" type="submit">Verify phone</button></div></form>`;
        const inputs = $$(".otp-grid input", modalContent);
        inputs.forEach((input, index) => {
          input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 1); if (input.value && inputs[index + 1]) inputs[index + 1].focus(); });
          input.addEventListener("keydown", (event) => { if (event.key === "Backspace" && !input.value && inputs[index - 1]) inputs[index - 1].focus(); });
        });
        $("#tab-code-back").addEventListener("click", () => { tabStep = 1; render(); });
        $("#tab-step-two").addEventListener("submit", (event) => {
          event.preventDefault();
          if (inputs.map((input) => input.value).join("").length !== 4) return toast("Enter all four digits");
          tabStep = 3;
          render();
        });
      } else {
        modalContent.innerHTML = `<div class="modal__hero"><p class="eyebrow">One final preference</p><h2 id="modal-title">How would you like to close out?</h2><p>You can change this choice later. ${safe(server)} will be assigned to ${safe(tableLabel)}.</p></div><form class="modal__body" id="tab-step-three">${bars}<div class="payment-choice-grid"><label class="payment-choice"><input type="radio" name="payment" value="digital" checked /><span>⌁</span><strong>Pay digitally</strong><small>Review the tab, tip ${safe(server)} and close from this phone.</small></label><label class="payment-choice"><input type="radio" name="payment" value="server" /><span>◎</span><strong>Pay with server</strong><small>Tap once when ready and ${safe(server)} will bring the check.</small></label></div><label class="check-field alcohol-confirm"><input id="age-confirm" type="checkbox" /><span>I am 21 or older. Government-issued identification is still required for alcohol service.</span></label><div class="server-assignment-card"><span>Your assigned server</span><strong>${safe(server)}</strong><small>${safe(tableLabel)} · ${safe(qrContext.zone)} zone</small></div><div class="form-actions"><button class="button button--ink" type="button" id="tab-payment-back">Back</button><button class="button button--coral" type="submit">Open tab</button></div></form>`;
        $("#tab-payment-back").addEventListener("click", () => { tabStep = 2; render(); });
        $("#tab-step-three").addEventListener("submit", (event) => {
          event.preventDefault();
          draft.paymentPreference = $("input[name='payment']:checked", modalContent).value;
          draft.ageConfirmed = $("#age-confirm").checked;
          session = {
            id: uid("TAB"), status: "open", table: qrContext.table, zone: qrContext.zone, station: qrContext.station,
            firstName: draft.firstName, phone: draft.phone, server, paymentPreference: draft.paymentPreference,
            ageConfirmed: draft.ageConfirmed, openedAt: Date.now(), orders: [], serviceRequests: [], receiptPreference: "sms",
          };
          saveSession();
          closeModal();
          toast(`Tab opened for ${tableLabel}`);
          if (pendingItemId) setTimeout(() => openCustomizer(pendingItemId), 280);
        });
      }
    };
    openModal(`<div></div>`, render);
  }

  /* Item customization */
  function modifierMarkup(key, group) {
    const type = group.type || "single";
    const inputType = type === "multi" ? "checkbox" : "radio";
    const required = group.required ? "required" : "";
    return `<fieldset class="modifier-group" data-modifier-group="${safe(key)}" data-type="${safe(type)}"><legend>${safe(group.label)}${group.required ? " <span>Required</span>" : ""}</legend><div class="modifier-options">${group.options.map((option, index) => `<label><input type="${inputType}" name="modifier-${safe(key)}" value="${safe(option.value)}" data-price="${Number(option.price || 0)}" ${required && index === 0 && inputType === "radio" ? "checked" : ""} /><span><b>${safe(option.label)}</b>${option.price ? `<small>+${money(option.price)}</small>` : ""}</span></label>`).join("")}</div></fieldset>`;
  }
  function openCustomizer(itemId) {
    const item = itemMap.get(itemId);
    if (!item || !item.available) return toast("That item is currently unavailable");
    if (!tableMode) return publicOrderingPrompt(itemId);
    if (!session) return openTabFlow(itemId);
    const modifierKeys = item.modifiers || [];
    const modifiers = modifierKeys.map((key) => DATA.modifiers[key] ? modifierMarkup(key, DATA.modifiers[key]) : "").join("");
    openModal(`<div class="modal__hero item-modal-hero" style="--item-image:url('${safe(item.categoryImage)}')"><p class="eyebrow">${safe(item.category)}</p><h2 id="modal-title">${safe(item.name)}</h2><p>${safe(item.description)}</p></div><form class="modal__body" id="item-customizer"><div class="item-price-line"><span>Starting price</span><strong>${money(item.price)}</strong></div>${modifiers || `<div class="simple-prep-note"><span>Made as described</span><small>Add preparation notes below when needed.</small></div>`}${item.alcoholic && !session.ageConfirmed ? `<label class="check-field alcohol-confirm"><input id="item-age-confirm" type="checkbox" required /><span>I confirm I am 21 or older. Identification will be checked before alcohol is served.</span></label>` : ""}<div class="form-grid"><div class="field"><label for="item-quantity">Quantity</label><select id="item-quantity">${[1,2,3,4,5,6].map((quantity) => `<option>${quantity}</option>`).join("")}</select></div><div class="field"><label for="item-course">Send with</label><select id="item-course"><option>Next available round</option><option>Food course</option><option>Drink round</option><option>Hold until requested</option></select></div><div class="field field--full"><label for="item-note">Preparation notes</label><textarea id="item-note" maxlength="250" placeholder="Sauce on the side, allergy note, no garnish…"></textarea></div></div><div class="item-total"><span>Item total</span><strong id="customizer-total">${money(item.price)}</strong></div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Cancel</button><button class="button button--coral" type="submit">Add to current order</button></div></form>`, () => {
      const form = $("#item-customizer");
      const updatePrice = () => {
        const quantity = Number($("#item-quantity").value);
        const extras = $$("input[data-price]:checked", form).reduce((sum, input) => sum + Number(input.dataset.price || 0), 0);
        $("#customizer-total").textContent = money((item.price + extras) * quantity);
      };
      form.addEventListener("change", updatePrice);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        for (const key of modifierKeys) {
          const group = DATA.modifiers[key];
          if (group?.required && !$(`[name='modifier-${CSS.escape(key)}']:checked`, form)) return toast(`Choose ${group.label.toLowerCase()}`);
        }
        if (item.alcoholic && !session.ageConfirmed && !$("#item-age-confirm")?.checked) return toast("Age confirmation is required for alcohol");
        if (item.alcoholic && $("#item-age-confirm")?.checked) { session.ageConfirmed = true; saveSession(); }
        const selectedModifiers = modifierKeys.map((key) => {
          const group = DATA.modifiers[key];
          const choices = $$(`[name='modifier-${CSS.escape(key)}']:checked`, form).map((input) => ({ label: input.value, price: Number(input.dataset.price || 0) }));
          return choices.length ? { key, label: group.label, choices } : null;
        }).filter(Boolean);
        const extras = selectedModifiers.flatMap((group) => group.choices).reduce((sum, choice) => sum + choice.price, 0);
        cart.push({
          lineId: uid("LINE"), itemId: item.id, name: item.name, category: item.category, basePrice: item.price,
          unitPrice: item.price + extras, quantity: Number($("#item-quantity").value), course: $("#item-course").value,
          note: $("#item-note").value.trim(), modifiers: selectedModifiers, alcoholic: Boolean(item.alcoholic),
        });
        saveCart();
        closeModal();
        toast(`${item.name} added`);
      });
    });
  }

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-item-action]");
    if (action) openCustomizer(action.dataset.itemAction);
  });

  /* Cart and order submission */
  const cartItemsContainer = $("#cart-items");
  const cartEmpty = $("#cart-empty");
  const cartSummary = $("#cart-summary");
  function renderCart() {
    const quantity = cart.reduce((sum, line) => sum + line.quantity, 0);
    $$('[data-cart-count]').forEach((node) => { node.textContent = quantity; });
    $$('[data-cart-total]').forEach((node) => { node.textContent = money(cartSubtotal()); });
    $("#floating-cart-label").textContent = tableMode ? (session ? `${tableLabel} · ${session.server}` : tableLabel) : "Menu selections";
    $("#cart-eyebrow").textContent = tableMode ? tableLabel : "Dine-in ordering";
    $("#cart-context").innerHTML = tableMode ? (session ? `<div class="cart-context__session"><span class="status-dot"></span><div><strong>${safe(tableLabel)}</strong><small>${safe(session.server)} is assigned · tab ${safe(session.id.slice(-5))}</small></div><button type="button" data-open-tab-center>Tab center</button></div>` : `<div class="cart-context__session"><span class="status-dot status-dot--amber"></span><div><strong>${safe(tableLabel)}</strong><small>Open a tab before sending items</small></div><button type="button" data-open-tab>Open tab</button></div>`) : `<div class="cart-context__session"><span class="status-dot status-dot--amber"></span><div><strong>Read-only menu</strong><small>Scan a table QR to place dine-in orders</small></div><a href="admin/qr-kit.html">Try table access</a></div>`;
    cartItemsContainer.innerHTML = cart.map((line) => `<article class="cart-line"><div><span>${safe(line.category)}</span><h3>${safe(line.name)}</h3>${line.modifiers?.length ? `<p>${line.modifiers.flatMap((group) => group.choices.map((choice) => choice.label)).map(safe).join(" · ")}</p>` : ""}${line.note ? `<small>Note: ${safe(line.note)}</small>` : ""}</div><div class="cart-line__price"><strong>${money(line.unitPrice * line.quantity)}</strong><div class="quantity-control"><button type="button" data-line-qty="${safe(line.lineId)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${line.quantity}</span><button type="button" data-line-qty="${safe(line.lineId)}" data-delta="1" aria-label="Increase quantity">+</button></div><button class="cart-line__remove" type="button" data-line-remove="${safe(line.lineId)}">Remove</button></div></article>`).join("");
    cartEmpty.hidden = cart.length > 0;
    cartSummary.hidden = false;
    $("#cart-subtotal").textContent = money(cartSubtotal());
    $("#cart-open-balance").textContent = money(openSubtotal() + openTax());
    $("#cart-total").textContent = money(totalWithCart());
    $("#cart-note").textContent = !tableMode ? "Scan a Southernmost table QR to place dine-in orders." : !session ? `Open a tab for ${tableLabel} before sending items.` : `Estimated tax is calculated at 6.5%. Final totals are confirmed by the connected payment and POS systems.`;
    $("#send-order").disabled = !cart.length;
    $("#send-order").textContent = session ? "Send order to kitchen" : tableMode ? "Open tab to continue" : "Table QR required";
    $("#table-session-chip").hidden = !(tableMode && session);
    if (session) {
      $("#chip-table").textContent = qrContext.table;
      $("#chip-total").textContent = money(openSubtotal() + openTax());
    }
  }
  cartItemsContainer.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-line-qty]");
    const removeButton = event.target.closest("[data-line-remove]");
    if (quantityButton) {
      const line = cart.find((item) => item.lineId === quantityButton.dataset.lineQty);
      if (!line) return;
      line.quantity += Number(quantityButton.dataset.delta);
      if (line.quantity <= 0) cart = cart.filter((item) => item !== line);
      saveCart();
    }
    if (removeButton) { cart = cart.filter((item) => item.lineId !== removeButton.dataset.lineRemove); saveCart(); }
  });

  function sendOrderFlow() {
    if (!tableMode) return publicOrderingPrompt();
    if (!session) return openTabFlow();
    if (!cart.length) return toast("Choose an item first");
    const subtotal = cartSubtotal();
    openModal(`<div class="modal__hero"><p class="eyebrow">${safe(tableLabel)} · Send order</p><h2 id="modal-title">Ready for the kitchen?</h2><p>${safe(session.server)} will remain assigned to your tab. You can send more rounds whenever you like.</p></div><form class="modal__body" id="send-order-form"><div class="checkout-order-preview">${cart.map((line) => `<div class="checkout-line"><span>${line.quantity} × ${safe(line.name)}</span><strong>${money(line.unitPrice * line.quantity)}</strong></div>`).join("")}<div class="checkout-line"><strong>Round subtotal</strong><strong>${money(subtotal)}</strong></div></div><div class="form-grid"><div class="field"><label for="order-timing">Timing</label><select id="order-timing"><option>Send now</option><option>Hold food until requested</option><option>Send drinks first</option></select></div><div class="field"><label for="order-contact">Order updates</label><select id="order-contact"><option>Show in this tab</option><option>Show in tab + text message</option></select></div><div class="field field--full"><label for="round-note">Note for the kitchen or bar</label><textarea id="round-note" maxlength="250" placeholder="One note for the entire round"></textarea></div></div><label class="check-field"><input type="checkbox" required /><span>I reviewed the items and understand allergy requests require staff confirmation.</span></label><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Keep editing</button><button class="button button--coral" type="submit">Send this round</button></div></form>`, () => {
      $("#send-order-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const order = { id: uid("ORD"), createdAt: Date.now(), items: structuredClone(cart), subtotal, timing: $("#order-timing").value, note: $("#round-note").value.trim() };
        session.orders.push(order);
        cart = [];
        saveCart();
        saveSession();
        closeModal();
        openOrderConfirmation(order);
      });
    });
  }
  function openOrderConfirmation(order) {
    openModal(`<div class="success-state"><div class="success-state__icon">✓</div><p class="eyebrow">Order received</p><h2 id="modal-title">The next round is moving.</h2><p>${safe(session.server)} can follow order ${safe(order.id)} for ${safe(tableLabel)}. Keep this tab open to order again or request service.</p><div class="order-status-rail"><i class="is-active"></i><i></i><i></i><i></i></div><p><strong>${safe(order.id)}</strong> · ${money(order.subtotal)}</p><div class="form-actions form-actions--center"><button class="button button--ink" type="button" data-close-modal>Back to menu</button><button class="button button--coral" type="button" data-open-tab-center>View tab center</button></div></div>`);
  }
  $("#send-order").addEventListener("click", sendOrderFlow);

  /* Session center and service requests */
  function renderSessionState() {
    const root = $("#table-session-root");
    const indicator = $("#order-mode-indicator");
    if (!tableMode) {
      indicator.innerHTML = `<i></i><span>Read-only menu</span>`;
      indicator.classList.remove("is-live");
      root.innerHTML = `<div class="session-public-card"><div><p class="eyebrow">Public menu access</p><h3>Browse everything. Order at the venue.</h3><p>Food and drink selections remain read-only until a verified table QR is scanned. Home delivery continues through Uber Eats.</p></div><div class="session-public-actions"><a class="button button--coral" href="admin/qr-kit.html">Try a table QR</a><a class="button button--ink" href="${safe(DATA.site.deliveryUrl)}" target="_blank" rel="noopener">Uber Eats delivery</a></div></div>`;
      return;
    }
    indicator.innerHTML = `<i></i><span>${session ? `${tableLabel} · tab open` : `${tableLabel} · ready to open`}</span>`;
    indicator.classList.add("is-live");
    $("#hero-mode-kicker").textContent = session ? `${tableLabel} · ${session.server}` : `${tableLabel} linked`;
    $("#hero-mode-title").textContent = session ? `Welcome back, ${session.firstName}.` : "Your table. Your menu. Your pace.";
    $("#hero-mode-meta").innerHTML = session ? `<span>${session.orders.length} rounds</span><span>•</span><span>${money(openSubtotal() + openTax())} open</span>` : `<span>Open a secure tab</span><span>•</span><span>Server assignment included</span>`;
    if (!session) {
      root.innerHTML = `<div class="session-welcome-card"><div class="session-welcome-card__icon">⌁</div><div><p class="eyebrow">${safe(tableLabel)} is linked</p><h3>Open one tab for the whole visit.</h3><p>Verify your phone, choose how you want to close out and place your first order. A Southernmost server is assigned automatically.</p><div class="session-trust-row"><span>Phone verification</span><span>Running total</span><span>Server requests</span><span>Digital closeout</span></div></div><button class="button button--coral" type="button" data-open-tab>Open ${safe(tableLabel)} tab</button></div>`;
    } else {
      const orders = session.orders.length ? session.orders.slice().reverse().map((order) => {
        const status = computedOrderStatus(order);
        return `<article class="session-order-card"><div><span>${safe(order.id)} · ${new Date(order.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span><h4>${order.items.map((item) => `${item.quantity}× ${safe(item.name)}`).join(" · ")}</h4></div><div><b>${safe(status.label)}</b><strong>${money(orderSubtotal(order))}</strong></div><div class="mini-status-rail">${[1,2,3,4].map((step) => `<i class="${step <= status.step ? "is-active" : ""}"></i>`).join("")}</div></article>`;
      }).join("") : `<div class="session-empty-rounds"><span>🍹</span><strong>No rounds sent yet.</strong><small>Choose an item below whenever you are ready.</small></div>`;
      root.innerHTML = `<div class="session-dashboard"><div class="session-dashboard__head"><div><p class="eyebrow">${safe(tableLabel)} · Open tab</p><h3>${safe(session.firstName)} + ${safe(session.server)}</h3><p>${safe(maskedPhone(session.phone))} · ${session.paymentPreference === "digital" ? "Digital closeout selected" : "Pay with server selected"}</p></div><div class="session-balance"><span>Estimated open balance</span><strong>${money(openSubtotal() + openTax())}</strong><small>${money(openSubtotal())} items + ${money(openTax())} estimated tax</small></div></div><div class="session-dashboard__actions"><button class="button button--coral" type="button" data-scroll-menu>Order another round</button><button class="button button--ink" type="button" data-open-service>Request server</button><button class="button button--soft" type="button" data-close-tab>Close tab</button></div><div class="session-orders"><div class="session-orders__title"><strong>Order activity</strong><span>Status updates automatically</span></div>${orders}</div></div>`;
    }
    renderCart();
  }

  function serviceCenter() {
    if (!tableMode) return publicOrderingPrompt();
    if (!session) return openTabFlow();
    const options = [
      ["water", "Water refill", "Bring water to the table"],
      ["napkins", "Napkins & utensils", "Bring extra table supplies"],
      ["question", "Menu question", "Help with ingredients or modifications"],
      ["pay", "Ready to pay", "Bring the check or help with closeout"],
      ["other", "Something else", "Add a note for the assigned server"],
    ];
    openModal(`<div class="modal__hero"><p class="eyebrow">Service center · ${safe(tableLabel)}</p><h2 id="modal-title">How can ${safe(session.server)} help?</h2><p>Send a request without leaving the menu. Urgent needs should still be raised directly with staff.</p></div><form class="modal__body" id="service-form"><div class="service-option-grid">${options.map(([value, title, copy], index) => `<label><input type="radio" name="service-type" value="${value}" ${index === 0 ? "checked" : ""}/><span><b>${title}</b><small>${copy}</small></span></label>`).join("")}</div><div class="field"><label for="service-note">Optional note</label><textarea id="service-note" maxlength="180" placeholder="For example: two waters and extra hot sauce"></textarea></div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Cancel</button><button class="button button--coral" type="submit">Notify ${safe(session.server)}</button></div></form>`, () => {
      $("#service-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const choice = $("input[name='service-type']:checked", modalContent).value;
        const label = options.find(([value]) => value === choice)?.[1] || "Service request";
        session.serviceRequests.push({ id: uid("REQ"), type: choice, label, note: $("#service-note").value.trim(), createdAt: Date.now(), status: "Sent" });
        saveSession();
        closeModal();
        toast(`${session.server} was notified`);
      });
    });
  }

  function tabCenter() {
    if (!session) return openTabFlow();
    const subtotal = openSubtotal();
    const tax = subtotal * TAX_RATE;
    const requests = session.serviceRequests.length ? session.serviceRequests.slice().reverse().map((request) => `<div class="request-history-row"><span>${safe(request.label)} · ${new Date(request.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span><strong>${safe(request.status)}</strong></div>`).join("") : `<p class="form-note">No service requests sent.</p>`;
    openModal(`<div class="modal__hero"><p class="eyebrow">${safe(tableLabel)} · Tab center</p><h2 id="modal-title">Everything in one place.</h2><p>${safe(session.server)} is assigned. This tab remains available until it is closed.</p></div><div class="modal__body"><div class="tab-center-metrics"><div><span>Orders</span><strong>${session.orders.length}</strong></div><div><span>Items</span><strong>${session.orders.flatMap((order) => order.items).reduce((sum, item) => sum + item.quantity, 0)}</strong></div><div><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div><span>Est. tax</span><strong>${money(tax)}</strong></div></div><div class="server-assignment-card"><span>Assigned server</span><strong>${safe(session.server)}</strong><small>${safe(tableLabel)} · opened ${new Date(session.openedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small></div><div class="tab-center-actions"><button class="button button--coral" type="button" data-scroll-menu>Order another round</button><button class="button button--ink" type="button" data-open-service>Request server</button><button class="button button--soft" type="button" data-close-tab>Close tab</button></div><div class="request-history"><h3>Service activity</h3>${requests}</div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Done</button></div></div>`);
  }

  function closeTabFlow() {
    if (!session) return;
    const subtotal = openSubtotal();
    if (!session.orders.length) {
      openModal(`<div class="modal__hero"><p class="eyebrow">Close tab</p><h2 id="modal-title">Nothing has been ordered yet.</h2><p>You can close this session now or keep browsing.</p></div><div class="modal__body"><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Keep tab open</button><button class="button button--coral" type="button" id="close-empty-tab">Close session</button></div></div>`, () => $("#close-empty-tab").addEventListener("click", finalizeClose));
      return;
    }
    let tipPercent = 0.2;
    const render = () => {
      const tax = subtotal * TAX_RATE;
      const tip = subtotal * tipPercent;
      const total = subtotal + tax + tip;
      modalContent.innerHTML = `<div class="modal__hero"><p class="eyebrow">Close ${safe(tableLabel)} tab</p><h2 id="modal-title">Finish the night your way.</h2><p>Review the balance, tip ${safe(session.server)} and choose digital closeout or server assistance.</p></div><form class="modal__body" id="close-tab-form"><div class="closeout-summary"><div><span>Food &amp; drinks</span><strong>${money(subtotal)}</strong></div><div><span>Estimated tax · 6.5%</span><strong>${money(tax)}</strong></div><div><span>Tip for ${safe(session.server)}</span><strong>${money(tip)}</strong></div><div class="closeout-summary__total"><span>Estimated total</span><strong>${money(total)}</strong></div></div><p class="form-note">Tax and final authorization are confirmed by the connected POS and payment provider at launch.</p><div class="tip-heading"><strong>Choose a tip</strong><span>${safe(session.server)} served ${safe(tableLabel)}</span></div><div class="tip-row">${[0.18,0.2,0.22,0.25].map((value) => `<button type="button" data-closeout-tip="${value}" class="${tipPercent === value ? "is-active" : ""}">${Math.round(value * 100)}%</button>`).join("")}</div><div class="payment-choice-grid closeout-methods"><label class="payment-choice"><input type="radio" name="close-method" value="digital" ${session.paymentPreference === "digital" ? "checked" : ""}/><span>⌁</span><strong>Pay digitally</strong><small>Secure wallet or card authorization.</small></label><label class="payment-choice"><input type="radio" name="close-method" value="server" ${session.paymentPreference === "server" ? "checked" : ""}/><span>◎</span><strong>Call ${safe(session.server)}</strong><small>Request the check at the table.</small></label></div><label class="check-field"><input type="checkbox" required /><span>I reviewed the items and authorize the selected closeout request.</span></label><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Not yet</button><button class="button button--coral" type="submit">Continue</button></div></form>`;
      $$('[data-closeout-tip]', modalContent).forEach((button) => button.addEventListener("click", () => { tipPercent = Number(button.dataset.closeoutTip); render(); }));
      $("#close-tab-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const method = $("input[name='close-method']:checked", modalContent).value;
        if (method === "server") {
          session.serviceRequests.push({ id: uid("REQ"), type: "pay", label: "Ready to pay", createdAt: Date.now(), status: "Sent" });
          saveSession();
          openModal(`<div class="success-state"><div class="success-state__icon">✓</div><p class="eyebrow">Server notified</p><h2 id="modal-title">${safe(session.server)} is on the way.</h2><p>Your tab remains open until payment is completed with the server.</p><button class="button button--coral" type="button" data-close-modal>Return to tab</button></div>`);
        } else {
          paymentScreen({ subtotal, tax, tip, total });
        }
      });
    };
    openModal(`<div></div>`, render);
  }

  function paymentScreen(amounts) {
    modalContent.innerHTML = `<div class="modal__hero"><p class="eyebrow">Secure digital closeout</p><h2 id="modal-title">Choose a fast way to pay.</h2><p>Wallet and card controls are presented exactly where the production payment provider will connect.</p></div><form class="modal__body" id="payment-form"><div class="wallet-grid"><button type="button" data-wallet="apple"><span></span> Pay</button><button type="button" data-wallet="google"><span>G</span> Pay</button></div><div class="payment-divider"><span>or pay by card</span></div><div class="form-grid"><div class="field field--full"><label for="card-number">Card number</label><input id="card-number" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" /></div><div class="field"><label for="card-expiry">Expiration</label><input id="card-expiry" autocomplete="cc-exp" placeholder="MM / YY" /></div><div class="field"><label for="card-cvc">Security code</label><input id="card-cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" /></div></div><div class="payment-total-bar"><span>Amount to authorize</span><strong>${money(amounts.total)}</strong></div><p class="form-note">Payments are not enabled in this temporary client environment. No card or wallet data is stored or transmitted.</p><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Cancel</button><button class="button button--coral" type="submit">Complete closeout</button></div></form>`;
    $$('[data-wallet]', modalContent).forEach((button) => button.addEventListener("click", () => paymentUnavailable(button.dataset.wallet)));
    $("#payment-form").addEventListener("submit", (event) => { event.preventDefault(); paymentUnavailable("card"); });
  }
  function paymentUnavailable(method) {
    openModal(`<div class="success-state payment-pending"><div class="success-state__icon">⌁</div><p class="eyebrow">Payment connection pending</p><h2 id="modal-title">The closeout experience is ready.</h2><p>${method === "card" ? "Card" : method === "apple" ? "Apple Pay" : "Google Pay"} will authorize the final total after the restaurant connects its payment provider. No charge was processed here.</p><p><strong>Estimated balance ${money(openSubtotal() + openTax())}</strong></p><div class="form-actions form-actions--center"><button class="button button--ink" type="button" data-open-service>Call ${safe(session.server)}</button><button class="button button--coral" type="button" data-close-modal>Return to tab</button></div></div>`);
  }
  function finalizeClose() {
    localStorage.removeItem(sessionStorageKey);
    localStorage.removeItem(cartStorageKey);
    session = null;
    cart = [];
    closeModal();
    renderSessionState();
    toast("Table session closed");
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-tab]")) { closeCart(); openTabFlow(); }
    if (event.target.closest("[data-open-service]")) { closeModal(); closeCart(); setTimeout(serviceCenter, 80); }
    if (event.target.closest("[data-open-tab-center]")) { closeModal(); closeCart(); setTimeout(tabCenter, 80); }
    if (event.target.closest("[data-close-tab]")) { closeModal(); closeCart(); setTimeout(closeTabFlow, 80); }
    if (event.target.closest("[data-scroll-menu]")) { closeModal(); document.querySelector("#order")?.scrollIntoView({ behavior: "smooth" }); }
  });

  /* Cocktail lab */
  const cocktails = menuItems.filter((item) => item.categoryId === "cocktails").slice(0, 3);
  const selector = $("#cocktail-selector");
  let activeCocktail = cocktails[0];
  function selectCocktail(item) {
    activeCocktail = item;
    $("#cocktail-name").textContent = item.name;
    $("#cocktail-description").textContent = item.description;
    $("#cocktail-kicker").textContent = item.name === "Southernmost Sunset" ? "Rum · pineapple · orange · grenadine" : item.name === "Key Lime Margarita" ? "Tequila · fresh lime · orange liqueur" : "Vodka · guava · cranberry · lime";
    $("#cocktail-add").textContent = `${tableMode ? "Add to order" : "View drink"} · ${money(item.price)}`;
    $$('[data-cocktail-id]', selector).forEach((button) => button.classList.toggle("is-active", button.dataset.cocktailId === item.id));
    dispatchEvent(new CustomEvent("southernmost:cocktail", { detail: item.id }));
  }
  cocktails.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.cocktailId = item.id;
    button.textContent = item.name;
    button.addEventListener("click", () => selectCocktail(item));
    selector.appendChild(button);
  });
  $("#cocktail-add").addEventListener("click", () => openCustomizer(activeCocktail.id));
  selectCocktail(activeCocktail);

  /* Information flows */
  function reservationFlow() {
    openModal(`<div class="modal__hero"><p class="eyebrow">Reserve your escape</p><h2 id="modal-title">Your table is almost ready.</h2><p>Share the visit details and preferred seating area. The reservation provider will connect here at launch.</p></div><form class="modal__body" id="reservation-form"><div class="form-grid"><div class="field"><label for="reserve-name">Name</label><input id="reserve-name" required autocomplete="name" /></div><div class="field"><label for="reserve-phone">Mobile</label><input id="reserve-phone" required autocomplete="tel" /></div><div class="field"><label for="reserve-date">Date</label><input id="reserve-date" type="date" required /></div><div class="field"><label for="reserve-time">Time</label><input id="reserve-time" type="time" required /></div><div class="field"><label for="reserve-party">Party size</label><select id="reserve-party">${Array.from({ length: 12 }, (_, index) => `<option>${index + 1}</option>`).join("")}<option>13+</option></select></div><div class="field"><label for="reserve-area">Seating</label><select id="reserve-area"><option>First available</option><option>Dining room</option><option>Patio</option><option>Near billiards</option><option>Bar seating</option></select></div><div class="field field--full"><label for="reserve-note">Occasion or request</label><textarea id="reserve-note" maxlength="250"></textarea></div></div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Cancel</button><button class="button button--coral" type="submit">Request reservation</button></div></form>`, () => {
      $("#reservation-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const ref = uid("RES");
        openModal(`<div class="success-state"><div class="success-state__icon">✓</div><p class="eyebrow">Request prepared</p><h2 id="modal-title">We saved the visit details.</h2><p>Reference ${safe(ref)} is stored in this browser until the live reservation provider is connected.</p><button class="button button--coral" type="button" data-close-modal>Done</button></div>`);
      });
    });
  }
  function partyFlow() {
    openModal(`<div class="modal__hero"><p class="eyebrow">Private events</p><h2 id="modal-title">Give us the shape of the celebration.</h2><p>Capture the information staff needs to price and plan the event without a long back-and-forth.</p></div><form class="modal__body" id="party-form"><div class="form-grid"><div class="field"><label for="party-name">Contact name</label><input id="party-name" required /></div><div class="field"><label for="party-mobile">Mobile</label><input id="party-mobile" required /></div><div class="field"><label for="party-email">Email</label><input id="party-email" type="email" required /></div><div class="field"><label for="party-type">Event type</label><select id="party-type"><option>Birthday</option><option>Corporate gathering</option><option>Wedding event</option><option>Watch party</option><option>Reunion</option><option>Other</option></select></div><div class="field"><label for="party-guests">Estimated guests</label><input id="party-guests" type="number" min="10" max="500" value="30" /></div><div class="field"><label for="party-date">Preferred date</label><input id="party-date" type="date" /></div><div class="field field--full"><label for="party-note">Food, drinks, entertainment and setup</label><textarea id="party-note" maxlength="500"></textarea></div></div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Cancel</button><button class="button button--coral" type="submit">Prepare inquiry</button></div></form>`, () => {
      $("#party-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const ref = uid("EVT");
        openModal(`<div class="success-state"><div class="success-state__icon">✓</div><p class="eyebrow">Event inquiry prepared</p><h2 id="modal-title">The details are organized.</h2><p>Reference ${safe(ref)} is stored in this browser until the restaurant connects its CRM and email workflow.</p><button class="button button--coral" type="button" data-close-modal>Done</button></div>`);
      });
    });
  }
  function happyHourFlow() {
    openModal(`<div class="modal__hero"><p class="eyebrow">Happy hour · ${safe(DATA.site.happyHour.label)}</p><h2 id="modal-title">Golden hour starts at three.</h2><p>${safe(DATA.site.happyHour.time)} with food and drink specials from the supplied Southernmost menu.</p></div><div class="modal__body"><div class="specials-grid">${DATA.site.happyHour.specials.map((special) => { const [lead, ...rest] = special.split(" "); return `<div class="special-card"><strong>${safe(lead)}</strong><span>${safe(rest.join(" "))}</span></div>`; }).join("")}</div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Close</button><a class="button button--coral" href="#order" data-close-modal>Browse menu</a></div></div>`);
  }
  function eventFlow() {
    openModal(`<div class="modal__hero"><p class="eyebrow">Entertainment calendar</p><h2 id="modal-title">What’s happening at the end of the road.</h2><p>Live music, billiards, watch parties and special programming in one updateable calendar.</p></div><div class="modal__body"><div class="modal-event-list">${DATA.events.map((item) => `<article><span>${safe(item.day)}</span><div><h3>${safe(item.title)}</h3><p>${safe(item.description)}</p></div><strong>${safe(item.time)}</strong></article>`).join("")}</div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Close calendar</button><button class="button button--coral" type="button" data-open-party>Host an event</button></div></div>`);
  }
  function menuBoardFlow() {
    openModal(`<div class="modal__hero"><p class="eyebrow">Original illustrated menu</p><h2 id="modal-title">See the full menu artwork.</h2><p>Switch between the supplied menu boards or return to the searchable page-turning version.</p></div><div class="modal__body menu-board-viewer"><div class="menu-board-tabs"><button class="is-active" type="button" data-board="complete">Complete menu</button><button type="button" data-board="signature">Signature layout</button></div><div class="menu-board-frame"><img id="menu-board-image" src="assets/menu-board-complete.jpg" alt="Southernmost illustrated complete menu" /></div><div class="form-actions"><button class="button button--ink" type="button" data-close-modal>Close</button></div></div>`, () => {
      $$('[data-board]', modalContent).forEach((button) => button.addEventListener("click", () => {
        $$('[data-board]', modalContent).forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
        $("#menu-board-image").src = button.dataset.board === "complete" ? "assets/menu-board-complete.jpg" : "assets/menu-board-signature.jpg";
        $("#menu-board-image").alt = button.dataset.board === "complete" ? "Southernmost illustrated complete menu" : "Southernmost illustrated signature menu";
      }));
    });
  }
  $$('[data-open-reservation]').forEach((button) => button.addEventListener("click", reservationFlow));
  $$('[data-open-party]').forEach((button) => button.addEventListener("click", partyFlow));
  $$('[data-open-happy]').forEach((button) => button.addEventListener("click", happyHourFlow));
  $$('[data-open-event]').forEach((button) => button.addEventListener("click", eventFlow));
  $$('[data-open-menu-board]').forEach((button) => button.addEventListener("click", menuBoardFlow));

  /* Events and experience notes */
  $("#event-list").innerHTML = DATA.events.slice(0, 5).map((item, index) => `<article class="event-row"><span class="event-row__number">${String(index + 1).padStart(2, "0")}</span><div><small>${safe(item.day)}</small><h3>${safe(item.title)}</h3><p>${safe(item.description)}</p></div><time>${safe(item.time)}</time></article>`).join("");
  $("#experience-notes-track").innerHTML = DATA.experiencePillars.map((item) => `<article class="review-card experience-note-card"><div class="experience-note-card__icon">${safe(item.icon)}</div><h3>${safe(item.title)}</h3><p>${safe(item.copy)}</p><footer><span>Southernmost experience</span><span>Food · Play · Music</span></footer></article>`).join("");

  $("#break-rack")?.addEventListener("click", () => { dispatchEvent(new CustomEvent("southernmost:break-rack")); toast("Rack in motion"); });
  $("#reset-rack")?.addEventListener("click", () => { dispatchEvent(new CustomEvent("southernmost:reset-rack")); toast("Fresh rack ready"); });
  addEventListener("southernmost:pocketed", (event) => {
    const count = Number(event.detail?.count || 0);
    const node = $("#pocketed-count");
    if (node) node.textContent = `${count} / 15`;
  });

  /* Initial state */
  renderSessionState();
  renderCart();
  setInterval(() => { if (session?.orders?.length) renderSessionState(); }, 7000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("sw.js?v=20260725f", { updateViaCache: "none" });
        registration.update().catch(() => {});
      } catch {}
    });
  }
})();
