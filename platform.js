(() => {
  const Store = window.SMStore;
  const D = Store.DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const root = document.body.dataset.root || '.';
  const page = document.body.dataset.page || 'home';
  const url = path => `${root}/${path}`.replace(/\/\.\//g, '/').replace(/([^:])\/\//g, '$1/');
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
  const qs = new URLSearchParams(location.search);
  let menuFilter = 'all';
  let menuSearch = '';
  let bookIndex = 0;
  let layers = {};

  const icons = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9.5 20v-6h5v6"/>',
    menu: '<path d="M4 5h16M4 12h16M4 19h16"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    chat: '<path d="M21 12a8 8 0 0 1-9 8 9 9 0 0 1-4-.9L3 21l1.8-4A8 8 0 1 1 21 12Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    location: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 5"/>',
    server: '<path d="M4 15h16M6 15a6 6 0 0 1 12 0M12 7v2"/><circle cx="12" cy="5" r="1"/>',
    ticket: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8M8 12h8"/>',
    wallet: '<path d="M3 7h16v13H3z"/><path d="M3 8V5h13v2M15 12h6v4h-6a2 2 0 1 1 0-4Z"/>',
    gift: '<path d="M3 10h18v11H3zM2 7h20v4H2zM12 7v14"/><path d="M12 7c-4 0-5-2-5-3.5S10 1 12 7Zm0 0c4 0 5-2 5-3.5S14 1 12 7Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    ball: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
    kitchen: '<path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M15 3v18M15 3c4 1 6 4 6 8h-6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.8 2.8-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V22H10v-.2a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.2.4l-.1.1-2.8-2.8.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.8-1.2H2v-4h.4A2 2 0 0 0 4.2 9a2 2 0 0 0-.4-2.2l-.1-.1 2.8-2.8.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 10 2.6V2h4v.6a2 2 0 0 0 1.2 1.8 2 2 0 0 0 2.2-.4l.1-.1 2.8 2.8-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.4v4h-.4a2 2 0 0 0-1.8 1.2Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    phone: '<path d="M7 3h4l2 5-3 2a15 15 0 0 0 4 4l2-3 5 2v4c0 2-2 4-4 4A18 18 0 0 1 3 7c0-2 2-4 4-4Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    edit: '<path d="m4 16-1 5 5-1L19 9l-4-4L4 16Z"/><path d="m13 7 4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/>',
    spark: '<path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>'
  };
  const icon = name => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.star}</svg>`;

  function emitToast(message) {
    const zone = $('#toast-zone');
    if (!zone) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    zone.append(toast);
    setTimeout(() => toast.remove(), 3300);
  }

  function sharedShell() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `<div class="shell header-inner">
      <a class="brand" href="${url('index.html')}"><img src="${url('assets/southernmost-wordmark.webp')}" alt="Southernmost Bar & Grille"></a>
      <nav class="desktop-nav" aria-label="Primary">
        <a href="${url('menu/')}" data-nav="menu">Menu</a><a href="${url('events/')}" data-nav="events">Events</a><a href="${url('private-events/')}" data-nav="private-events">Private events</a><a href="${url('visit/')}" data-nav="visit">Visit</a><a href="${url('loyalty/')}" data-nav="loyalty">Passport</a>
      </nav>
      <div class="header-actions">
        <button class="button ghost mode-label" type="button" data-mode-launch>${icon('location')}<span data-mode-label>Choose mode</span></button>
        <button class="icon-button dark" type="button" data-open-guide aria-label="Open Island Guide">${icon('chat')}</button>
        <button class="icon-button dark" type="button" data-open-cart aria-label="Open order">${icon('bag')}<b class="count" data-cart-count>0</b></button>
        <a class="button coral order-link" href="${url('order/')}">Order now</a>
        <button class="icon-button dark mobile-toggle" type="button" data-mobile-toggle aria-label="Open navigation">${icon('menu')}</button>
      </div>
    </div>`;
    document.body.prepend(header);
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.hidden = true;
    mobileMenu.innerHTML = `<nav class="shell"><a href="${url('menu/')}">Full menu</a><a href="${url('order/')}">Order & tabs</a><a href="${url('events/')}">Events & sports</a><a href="${url('private-events/')}">Private events</a><a href="${url('visit/')}">Visit</a><a href="${url('loyalty/')}">Passport & gift cards</a></nav>`;
    header.after(mobileMenu);

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `<div class="shell footer-grid">
      <div class="footer-brand"><img src="${url('assets/southernmost-wordmark.webp')}" alt="Southernmost Bar & Grille"><p>A West Palm Beach neighborhood escape for coastal food, handcrafted cocktails, billiards, live music and nights that stay interesting.</p></div>
      <div><h3>Explore</h3><a href="${url('menu/')}">Menu</a><a href="${url('events/')}">Events</a><a href="${url('visit/')}">Visit</a><a href="${url('loyalty/')}">Passport</a></div>
      <div><h3>Order</h3><a href="${url('order/')}">Table ordering</a><a href="${D.site.deliveryUrl}" target="_blank" rel="noopener">Delivery</a><a href="${url('admin/qr-kit.html')}">QR access</a></div>
      <div><h3>Gather</h3><a href="${url('private-events/')}">Private events</a><a href="${url('events/')}">Watch parties</a><button type="button" data-reserve>Reservations</button></div>
      <div><h3>Policies</h3><a href="${url('legal/terms.html')}">Terms</a><a href="${url('legal/privacy.html')}">Privacy</a><a href="${url('legal/allergens.html')}">Allergens & alcohol</a><a href="${url('legal/accessibility.html')}">Accessibility</a></div>
    </div><div class="shell footer-bottom"><span>© 2026 Southernmost Bar & Grille.</span><span>Designed by <a href="https://ajlwebcraft.com" target="_blank" rel="noopener">AJL WebCraft</a></span></div>`;
    document.body.append(footer);

    const dock = document.createElement('nav');
    dock.className = 'mobile-dock';
    dock.setAttribute('aria-label', 'Quick actions');
    dock.innerHTML = `<a href="${url('index.html')}">${icon('home')}<span>Home</span></a><a href="${url('menu/')}">${icon('menu')}<span>Menu</span></a><button type="button" data-open-guide>${icon('chat')}<span>Guide</span></button><button type="button" data-open-cart>${icon('bag')}<span>Order</span><b data-cart-count>0</b></button>`;
    document.body.append(dock);

    document.body.insertAdjacentHTML('beforeend', `<div class="layer" id="layer" hidden></div>
      <aside class="drawer" id="cart-drawer" aria-hidden="true"><div class="drawer-head"><h2>Your order</h2><button class="icon-button" data-close-drawers aria-label="Close order">${icon('close')}</button></div><div class="drawer-body" id="cart-drawer-body"></div></aside>
      <aside class="drawer dark" id="guide-drawer" aria-hidden="true"><div class="drawer-head"><div><small>On-device menu intelligence</small><h2>Island Guide</h2></div><button class="icon-button dark" data-close-drawers aria-label="Close Island Guide">${icon('close')}</button></div><div class="drawer-body"><div class="guide-messages" id="guide-messages"></div><div class="guide-prompts"><button data-guide="Recommend a full meal under $25">Meal under $25</button><button data-guide="What can four people share?">Share for four</button><button data-guide="Best seafood and drink pairing">Seafood pairing</button><button data-guide="How does table ordering work?">Table ordering</button></div><form class="guide-form" id="guide-form"><input id="guide-input" maxlength="180" placeholder="Ask about food, drinks, hours or ordering" aria-label="Ask the Island Guide"><button class="icon-button dark" aria-label="Send">${icon('arrow')}</button></form></div></aside>
      <div class="modal" id="modal" aria-hidden="true"><div class="modal-bg" data-close-modal></div><div class="modal-box"><div class="modal-head"><h2 id="modal-title">Southernmost</h2><button class="icon-button" data-close-modal aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body" id="modal-body"></div></div></div>
      <div class="toast-zone" id="toast-zone" aria-live="polite"></div>`);

    layers = { layer: $('#layer'), cart: $('#cart-drawer'), guide: $('#guide-drawer'), modal: $('#modal') };
    $(`[data-nav="${page}"]`)?.classList.add('active');
  }

  function openDrawer(which) {
    closeAll(true);
    const drawer = which === 'guide' ? layers.guide : layers.cart;
    if (which === 'cart') renderCartDrawer();
    layers.layer.hidden = false;
    requestAnimationFrame(() => { layers.layer.classList.add('open'); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); });
  }
  function closeAll(immediate = false) {
    layers.layer?.classList.remove('open');
    [layers.cart, layers.guide].forEach(drawer => { drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden', 'true'); });
    layers.modal?.classList.remove('open'); layers.modal?.setAttribute('aria-hidden', 'true');
    const finish = () => { if (layers.layer) layers.layer.hidden = true; document.body.classList.remove('no-scroll'); };
    immediate ? finish() : setTimeout(finish, 280);
  }
  function openModal(title, html, after) {
    closeAll(true); $('#modal-title').textContent = title; $('#modal-body').innerHTML = html; layers.modal.classList.add('open'); layers.modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); after?.();
  }

  function setMode(mode, navigate = false) {
    Store.setMode(mode);
    updateShell();
    if (mode === 'delivery') window.open(D.site.deliveryUrl, '_blank', 'noopener');
    else if (navigate) location.href = mode === 'browse' ? url('menu/') : `${url('order/')}?mode=${encodeURIComponent(mode)}`;
  }

  function updateShell() {
    const state = Store.getState();
    const labels = { browse: 'Browsing menu', 'dine-in': state.session ? `Table ${state.session.table}` : 'At Southernmost', pickup: 'Pickup', delivery: 'Delivery' };
    $$('[data-mode-label]').forEach(el => el.textContent = labels[state.mode] || 'Choose mode');
    $$('[data-cart-count]').forEach(el => el.textContent = state.cart.reduce((sum, line) => sum + line.quantity, 0));
  }

  function modeChooser() {
    openModal('How are you joining us?', `<div class="mode-choice-grid">
      ${modeOption('dine-in', 'location', 'I’m at Southernmost', 'Open a table tab or enter through a location QR.')}
      ${modeOption('pickup', 'bag', 'Pickup', 'Choose food now and select a pickup time.')}
      ${modeOption('delivery', 'arrow', 'Delivery', 'Continue to the approved delivery marketplace.')}
      ${modeOption('browse', 'menu', 'Just browsing', 'Explore the full menu, events and venue.')}
    </div>`);
  }
  function modeOption(mode, iconName, title, copy) { return `<button class="mode-choice" data-choose-mode="${mode}"><i>${icon(iconName)}</i><strong>${title}</strong><span>${copy}</span></button>`; }

  function menuCard(item, context = 'menu') {
    const available = item.availability?.available !== false;
    const action = context === 'order' ? `<button class="icon-button" data-item="${item.id}" ${available ? '' : 'disabled'} aria-label="Customize ${esc(item.name)}">${icon('plus')}</button>` : `<button class="button outline" data-item="${item.id}">View item</button>`;
    return `<article class="menu-card" data-category="${item.categoryId}" data-name="${esc(item.name.toLowerCase())}">
      <div class="menu-media"><img src="${url(item.image)}" alt="${esc(item.name)}" loading="lazy"><span class="availability ${available ? '' : 'sold'}">${available ? (item.availability.stock <= 5 ? `${item.availability.stock} left` : 'Available') : 'Sold out'}</span></div>
      <div class="menu-body"><small>${esc(item.categoryName)}</small><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="tags">${item.tags.slice(0, 3).map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div><div class="menu-foot"><strong>${money(item.price)}</strong><div class="menu-actions">${action}</div></div></div>
    </article>`;
  }

  function modifierMarkup(item) {
    return (item.modifiers || []).map(key => {
      const group = D.modifiers[key]; if (!group) return '';
      const type = group.type === 'multi' ? 'checkbox' : 'radio';
      return `<fieldset class="modifier"><legend>${esc(group.label)}${group.required ? ' *' : ''}</legend>${group.options.map((option, index) => `<label><input type="${type}" name="mod-${key}" value="${esc(option.value)}" data-price="${option.price || 0}" data-label="${esc(option.label)}" ${type === 'radio' && index === 0 ? 'checked' : ''}><span>${esc(option.label)}</span><b>${option.price ? `+${money(option.price)}` : ''}</b></label>`).join('')}</fieldset>`;
    }).join('');
  }

  function showItem(itemId) {
    const item = Store.getItem(itemId); if (!item) return;
    const canOrder = item.availability.available && Store.getState().mode !== 'browse';
    openModal(item.name, `<div class="item-detail"><img src="${url(item.image)}" alt="${esc(item.name)}"><div><p class="eyebrow">${esc(item.categoryName)}</p><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="item-meta"><span>${money(item.price)}</span><span>${item.prep} min</span><span>${item.popularity}% guest favorite</span></div><p><strong>Pairs well with:</strong> ${esc(item.pairings.join(' · '))}</p></div></div>
      <form id="item-form"><input type="hidden" name="itemId" value="${item.id}">${modifierMarkup(item)}<div class="field"><label for="item-notes">Preparation notes</label><textarea id="item-notes" name="notes" placeholder="Sauce on the side, no onions…"></textarea></div><label class="check"><input type="checkbox" name="allergy"> This order includes an allergy. I will also confirm it with staff.</label><div class="form-grid"><div class="field"><label>Quantity</label><input type="number" name="quantity" min="1" max="20" value="1"></div><div class="field"><label>Responsible guest</label><select name="memberId">${memberOptions()}</select></div></div><button class="button coral full" type="submit" ${canOrder ? '' : 'disabled'}>${canOrder ? 'Add to current order' : Store.getState().mode === 'browse' ? 'Choose pickup or dine-in to order' : 'Item unavailable'}</button></form>`, () => {
      $('#item-form').addEventListener('submit', event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const modifiers = $$('input[name^="mod-"]:checked', event.currentTarget).map(input => ({ label: input.dataset.label, value: input.value, price: Number(input.dataset.price || 0) }));
        Store.addToCart(item.id, { modifiers, notes: form.get('notes'), allergy: form.get('allergy') === 'on', quantity: Number(form.get('quantity')), memberId: form.get('memberId') || null });
        closeAll(); updateShell(); emitToast(`${item.name} added`);
      });
    });
  }
  function memberOptions() { const members = Store.getState().members; return members.length ? members.map(member => `<option value="${member.id}">${esc(member.name)}</option>`).join('') : '<option value="">My order</option>'; }

  function renderCartDrawer() {
    const state = Store.getState();
    const body = $('#cart-drawer-body');
    if (!state.cart.length) {
      body.innerHTML = `<div class="empty"><i>${icon('bag')}</i><h3>Your order is empty.</h3><p>Explore the menu, choose a guest and build the next round.</p><a class="button ink" href="${url('menu/')}">Browse menu</a></div>`;
      return;
    }
    body.innerHTML = `<div class="cart-lines">${state.cart.map(line => cartLine(line)).join('')}</div><div class="panel"><div class="panel-body summary"><div><span>Current items</span><strong>${money(Store.cartSubtotal())}</strong></div><div><span>Open tab balance</span><strong>${money(Store.openBalance())}</strong></div><div class="total"><span>Projected balance</span><strong>${money(Store.cartSubtotal() + Store.openBalance())}</strong></div></div><div class="panel-foot"><a class="button coral full" href="${url('order/')}">Review order and tab</a></div></div>`;
  }
  function cartLine(line) { const member = Store.getState().members.find(entry => entry.id === line.memberId); return `<div class="cart-line"><img src="${url(line.image)}" alt=""><div><h4>${esc(line.name)}</h4><small>${esc(member?.name || 'My order')}${line.modifiers.length ? ` · ${esc(line.modifiers.map(mod => mod.label).join(', '))}` : ''}</small><div class="qty"><button data-qty="${line.lineId}" data-value="${line.quantity - 1}">${icon('minus')}</button><b>${line.quantity}</b><button data-qty="${line.lineId}" data-value="${line.quantity + 1}">${icon('plus')}</button></div></div><strong>${money(line.unitPrice * line.quantity)}</strong></div>`; }

  function setupGuide() {
    const messages = $('#guide-messages');
    messages.innerHTML = `<div class="bubble">Tell me what sounds good. I can use the menu, price, dietary preferences, happy hour and your current table context without an API key.</div>`;
    const send = prompt => {
      const clean = String(prompt || '').trim(); if (!clean) return;
      messages.insertAdjacentHTML('beforeend', `<div class="bubble user">${esc(clean)}</div>`);
      setTimeout(() => { messages.insertAdjacentHTML('beforeend', `<div class="bubble">${guideReply(clean)}</div>`); messages.scrollTop = messages.scrollHeight; }, 180);
    };
    $('#guide-form').addEventListener('submit', event => { event.preventDefault(); const input = $('#guide-input'); send(input.value); input.value = ''; });
    $$('[data-guide]').forEach(button => button.addEventListener('click', () => send(button.dataset.guide)));
  }

  function guideReply(prompt) {
    const q = prompt.toLowerCase();
    const items = Store.getItems().filter(item => item.availability.available);
    const pick = filter => items.filter(filter).sort((a, b) => b.popularity - a.popularity).slice(0, 3);
    let recommendations = [];
    if (/under \$?15|budget|cheap/.test(q)) recommendations = pick(item => item.price <= 15);
    else if (/under \$?20/.test(q)) recommendations = pick(item => item.price <= 20);
    else if (/seafood|fish|shrimp|mahi/.test(q)) recommendations = pick(item => item.tags.includes('Seafood'));
    else if (/spicy|heat|hot/.test(q)) recommendations = pick(item => item.tags.includes('Spicy'));
    else if (/vegetarian|vegan|meatless/.test(q)) recommendations = pick(item => item.tags.includes('Vegetarian option'));
    else if (/share|four|group/.test(q)) recommendations = pick(item => item.tags.includes('Shareable'));
    else if (/happy hour/.test(q)) return `Happy hour runs ${D.site.happyHour.label}, ${D.site.happyHour.time}. Current highlights: ${D.site.happyHour.specials.join(', ')}.`;
    else if (/table|tab|qr|order/.test(q)) return 'Scan the QR at your table, verify a mobile number, choose digital or server-assisted payment, then order in rounds. Your table, assigned server, service requests, split options and running balance stay in one session.';
    else if (/hour|open|close/.test(q)) return `Southernmost is listed as ${D.site.hours.map(row => `${row.label}: ${row.value}`).join(' · ')}. Event and holiday hours should be confirmed before travel.`;
    else recommendations = pick(item => item.badge || item.popularity > 85);
    if (!recommendations.length) recommendations = items.slice(0, 3);
    const context = recommendations.map(item => `<button class="guide-rec" data-item="${item.id}"><strong>${esc(item.name)}</strong><span>${money(item.price)} · ${esc(item.categoryName)}</span></button>`).join('');
    return `I’d start with these because they best match “${esc(prompt)}”:<div class="guide-recs">${context}</div>`;
  }

  function renderHome() {
    const target = $('#page-root');
    target.innerHTML = `<section class="hero"><div class="hero-photo"></div><div class="hero-veil"></div><canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas><div class="shell hero-grid"><div><p class="eyebrow">West Palm Beach · Okeechobee × Military</p><h1 class="display">Palm Beach nights.<br><em>Island time.</em></h1><p class="lede">Coastal food, handcrafted cocktails, billiards, live music and a phone-first ordering experience built for nights that refuse to end early.</p><div class="actions hero-actions"><a class="button coral" href="${url('menu/')}">Explore the menu</a><a class="button ghost" href="${url('order/')}">Order at your table</a></div><div class="proof"><span><strong>3–6 PM</strong>Weekday happy hour</span><span><strong>Fri + Sat</strong>Live music</span><span><strong>Nightly</strong>Billiards</span></div></div><div class="tonight" id="tonight-card"></div></div></section>
      <section class="mode-wrap"><div class="shell mode-panel"><div class="mode-intro"><small>Start with your intent</small><strong>What brings you to Southernmost?</strong></div>${homeMode('dine-in','location','I’m here','Open a table tab')}${homeMode('pickup','bag','Pickup','Choose a pickup time')}${homeMode('delivery','arrow','Delivery','Continue to Uber Eats')}${homeMode('browse','menu','Browse','Menu, events and venue')}</div></section>
      <div class="marquee"><div class="marquee-track">${Array(2).fill('<span>COASTAL KITCHEN</span><b>✦</b><span>WORLD-FAMOUS WINGS</span><b>✦</b><span>BILLIARDS NIGHTLY</span><b>✦</b><span>LIVE MUSIC</span><b>✦</b><span>TROPICAL COCKTAILS</span><b>✦</b>').join('')}</div></div>
      <section class="section paper"><div class="shell"><div class="section-head"><div><p class="eyebrow">One address. A full night.</p><h2 class="section-title">Come for dinner.<br><em>Stay for everything else.</em></h2></div><p class="lede">Southernmost combines a coastal kitchen, a proper sports-bar atmosphere and a billiards lounge with ordering that works at the pace of the table.</p></div><div class="bento"><article class="experience tall"><img src="${url('assets/interior.webp')}" alt="Billiards lounge" loading="lazy"><div class="experience-body"><small>Rack ’em up</small><h3>Billiards after dark</h3><p>Join the next available table, play a browser-side rack and keep drinks connected to your tab.</p></div></article><div class="bento-stack"><article class="experience"><img src="${url('assets/lamb.webp')}" alt="Jerk lamb chops" loading="lazy"><div class="experience-body"><small>From the kitchen</small><h3>Island signatures</h3><p>Coastal plates, jerk flavors and Florida favorites.</p></div></article><article class="experience"><img src="${url('assets/music.webp')}" alt="Live music" loading="lazy"><div class="experience-body"><small>What’s on tonight</small><h3>Live energy</h3><p>Music, watch parties, brunch and game-day gatherings.</p></div></article></div></div></div></section>
      <section class="section"><div class="shell"><div class="section-head center"><p class="eyebrow">Built around the guest</p><h2 class="section-title">The shortest path from “that looks good” to “send another round.”</h2><p class="lede">Browse publicly, order through a verified venue QR, call your server, split by guest and keep the tab open until the night is done.</p></div><div class="feature-grid">${feature('menu','Full visual menu','Search, dietary filters, modifiers, availability and pairings.')}${feature('users','Group ordering','Assign items to guests, repeat rounds and split the balance.')}${feature('server','Service without the wait','Request water, napkins, order help or payment from the same session.')}${feature('wallet','Flexible closeout','Digital wallet, card-style closeout or request your server.')}${feature('ball','Billiards waitlist','Join a table queue and receive an estimated turn time.')}${feature('spark','No-key Island Guide','Menu-aware recommendations that run entirely in the browser.')}</div></div></section>
      <section class="section dark"><div class="shell"><div class="section-head"><div><p class="eyebrow">Menu highlights</p><h2 class="section-title">What guests come back for.</h2></div><div class="actions"><a class="button gold" href="${url('menu/')}">Full menu</a><a class="button ghost" href="${url('order/')}">Start an order</a></div></div><div class="menu-grid home-menu" id="home-menu"></div></div></section>
      <section class="section cocktail-lab"><div class="shell cocktail-grid"><div><p class="eyebrow">Signature pour lab</p><h2 class="section-title">Choose the color<br><em>of your sunset.</em></h2><p class="lede">A recognizable 3D bar scene supports the cocktail menu rather than competing with it. Browse the pours, then add the real menu item from the menu or active table session.</p><div class="actions"><button class="button coral" data-item="southernmost-sunset">Southernmost Sunset</button><button class="button ink" data-item="key-lime-margarita">Key Lime Margarita</button></div></div><div class="scene-frame"><canvas id="cocktail-canvas" aria-label="Interactive cocktail bar scene"></canvas></div></div></section>
      <section class="section"><div class="shell loyalty-card"><div class="loyalty-copy"><p class="eyebrow">Southernmost Passport</p><h2 class="section-title">Make every island night count.</h2><p class="lede">Earn points, unlock birthday rewards, save favorites, receive event reminders and carry your preferences into the next visit.</p><div class="actions"><a class="button coral" href="${url('loyalty/')}">Open Passport</a><button class="button ghost" data-gift-card>Send a gift card</button></div></div><div class="passport-wrap"><div class="passport"><img src="${url('assets/southernmost-wordmark.webp')}" alt=""><strong>ISLAND PASSPORT</strong><small>West Palm Beach</small></div></div></div></section>`;
    renderTonight();
    $('#home-menu').innerHTML = Store.getItems().filter(item => item.badge || item.popularity > 88).slice(0, 6).map(item => menuCard(item, 'menu')).join('');
  }
  function homeMode(mode, iconName, title, copy) { return `<button class="mode-card" data-home-mode="${mode}"><i>${icon(iconName)}</i><strong>${title}</strong><small>${copy}</small></button>`; }
  function feature(iconName, title, copy) { return `<article class="feature"><i>${icon(iconName)}</i><h3>${title}</h3><p>${copy}</p></article>`; }

  function renderTonight() {
    const date = new Date(); const day = date.getDay(); const hour = date.getHours();
    const event = Store.getState().events.find(entry => new Date(`${entry.date}T12:00`).getDay() === day) || Store.getState().events[day % Store.getState().events.length];
    const happy = day >= 1 && day <= 5 && hour < 18;
    $('#tonight-card').innerHTML = `<div class="tonight-head"><p class="eyebrow">Tonight at Southernmost</p><h2>${esc(event.title)}</h2></div><div class="tonight-list">
      ${tonightRow('clock', happy ? 'Happy hour' : 'Kitchen', happy ? `Until 6 PM · ${D.site.happyHour.specials[0]}` : 'Open through dinner', happy ? 'Now' : 'Open')}
      ${tonightRow('star', event.title, event.description, event.time)}
      ${tonightRow('ball', 'Billiards lounge', 'Table waitlist available', 'Nightly')}
      ${tonightRow('kitchen', 'Current kitchen time', `${Store.getState().operations.settings.waitTime} minute estimate`, 'Live')}
      </div>`;
  }
  function tonightRow(iconName, title, copy, value) { return `<div class="tonight-row"><i>${icon(iconName)}</i><span><strong>${esc(title)}</strong><small>${esc(copy)}</small></span><em>${esc(value)}</em></div>`; }

  function renderMenuPage() {
    $('#page-root').innerHTML = `<section class="page-hero"><div class="shell"><p class="eyebrow">The Southernmost menu</p><h1 class="page-title">Choose the mood.<br><em>Then choose the plate.</em></h1><p class="lede">Every supplied menu category, price and modifier in a faster searchable layout. Switch to the illustrated book whenever you want the full tactile experience.</p><div class="meta"><span class="pill">57 menu entries</span><span class="pill">Live availability</span><span class="pill">Dietary and budget filters</span></div></div></section>
      <section class="section paper"><div class="shell"><div class="toolbar"><label class="search">${icon('search')}<input id="menu-search" type="search" placeholder="Search mahi, wings, cocktails…"></label><div class="actions"><button class="button outline" data-scroll-book>Open menu book</button><button class="button coral" data-mode-launch>Choose ordering mode</button></div></div><div class="filters" id="menu-filters"></div><div class="menu-grid" id="menu-grid"></div></div></section>
      <section class="book-zone" id="menu-book"><div class="shell"><div class="section-head center"><p class="eyebrow">The illustrated edition</p><h2 class="section-title">Turn the page.<br><em>Keep the controls.</em></h2><p class="lede">Drag the book on desktop, swipe on touchscreens or use the previous and next buttons. The normal menu remains available as the accessible ordering path.</p></div><div id="book-root"></div></div></section>`;
    renderMenuFilters(); renderMenuGrid(); renderBook();
  }

  function renderMenuFilters() {
    const filters = [
      ['all','All'], ['popular','Most popular'], ['under15','Under $15'], ['under20','Under $20'], ['seafood','Seafood'], ['spicy','Spicy'], ['vegetarian','Vegetarian option'], ['shareable','Shareables'], ['happy','Happy hour'],
      ...D.menu.map(category => [category.id, category.name])
    ];
    $('#menu-filters').innerHTML = filters.map(([id, label]) => `<button class="filter ${menuFilter === id ? 'active' : ''}" data-filter="${id}">${esc(label)}</button>`).join('');
  }

  function filteredItems() {
    return Store.getItems().filter(item => {
      const queryMatch = !menuSearch || `${item.name} ${item.description} ${item.categoryName} ${item.tags.join(' ')}`.toLowerCase().includes(menuSearch);
      if (!queryMatch) return false;
      if (menuFilter === 'all') return true;
      if (menuFilter === 'popular') return item.popularity >= 85;
      if (menuFilter === 'under15') return item.price <= 15;
      if (menuFilter === 'under20') return item.price <= 20;
      if (menuFilter === 'seafood') return item.tags.includes('Seafood');
      if (menuFilter === 'spicy') return item.tags.includes('Spicy');
      if (menuFilter === 'vegetarian') return item.tags.includes('Vegetarian option');
      if (menuFilter === 'shareable') return item.tags.includes('Shareable');
      if (menuFilter === 'happy') return item.happyHour;
      return item.categoryId === menuFilter;
    });
  }
  function renderMenuGrid(context = 'menu') { const target = $('#menu-grid') || $('#order-menu'); if (target) target.innerHTML = filteredItems().map(item => menuCard(item, context)).join('') || '<div class="empty"><h3>No menu items match those filters.</h3><p>Clear the search or try another category.</p></div>'; }

  function renderBook() {
    const chapters = D.menu.map(category => ({ title: category.name, image: category.image, items: category.items }));
    const rootEl = $('#book-root'); if (!rootEl) return;
    const desktopSheets = chapters.map((chapter, index) => `<div class="sheet ${index < bookIndex ? 'turned' : ''}" style="z-index:${chapters.length - index}" data-sheet="${index}"><div class="page-face"><img src="${url(chapter.image)}" alt=""><h3>${esc(chapter.title)}</h3><div class="book-list">${chapter.items.slice(0, 4).map(item => `<div class="book-item"><strong>${esc(item.name)}</strong><b>${money(item.price)}</b><small>${esc(item.description)}</small></div>`).join('')}</div></div><div class="page-face back"><p class="eyebrow">Next chapter</p><h3>${esc(chapters[index + 1]?.title || 'Visit Southernmost')}</h3><p>${esc(chapters[index + 1]?.items?.[0]?.description || 'You reached the final page. Use the chapter controls to revisit a favorite.')}</p></div></div>`).join('');
    rootEl.innerHTML = `<div class="book-stage"><div class="book"><div class="book-base"></div><div class="book-pages">${desktopSheets}</div></div><div class="mobile-book"><article class="page-face"><img src="${url(chapters[bookIndex].image)}" alt=""><h3>${esc(chapters[bookIndex].title)}</h3><div class="book-list">${chapters[bookIndex].items.slice(0, 5).map(item => `<div class="book-item"><strong>${esc(item.name)}</strong><b>${money(item.price)}</b><small>${esc(item.description)}</small></div>`).join('')}</div></article></div></div><div class="book-controls"><button class="icon-button dark" data-book-prev aria-label="Previous chapter">←</button><strong>${bookIndex + 1} / ${chapters.length} · ${esc(chapters[bookIndex].title)}</strong><button class="icon-button dark" data-book-next aria-label="Next chapter">→</button></div><div class="filters chapter-filters">${chapters.map((chapter, index) => `<button class="filter ${index === bookIndex ? 'active' : ''}" data-book-jump="${index}">${esc(chapter.title)}</button>`).join('')}</div>`;
    let startX = null;
    $('.mobile-book', rootEl)?.addEventListener('pointerdown', event => { startX = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); });
    $('.mobile-book', rootEl)?.addEventListener('pointerup', event => { if (startX == null) return; const delta = event.clientX - startX; if (Math.abs(delta) > 45) setBook(bookIndex + (delta < 0 ? 1 : -1)); startX = null; });
  }
  function setBook(index) { bookIndex = Math.max(0, Math.min(D.menu.length - 1, index)); renderBook(); }

  function renderOrderPage() {
    const context = Store.readQrContext();
    if (context && !Store.getState().session) Store.openSession(context);
    if (qs.get('mode')) Store.setMode(qs.get('mode'));
    const state = Store.getState();
    $('#page-root').innerHTML = `<section class="page-hero"><div class="shell"><p class="eyebrow">Order, tab and service</p><h1 class="page-title">Your table.<br><em>Your pace.</em></h1><p class="lede">Build rounds, assign items to guests, request service, monitor preparation and close the balance your way.</p><div class="meta"><span class="pill" id="order-context-pill"></span><span class="pill">${state.session ? `Server ${esc(state.session.server)}` : 'Public menu access'}</span><span class="pill">Secure guest session</span></div></div></section>
      <section class="section"><div class="shell"><div id="session-gate"></div><div id="active-order"></div></div></section>`;
    renderOrder();
  }

  function renderOrder() {
    const state = Store.getState();
    const gate = $('#session-gate'); const active = $('#active-order');
    $('#order-context-pill').textContent = state.session ? `${state.session.zone} · ${state.session.table}` : state.mode === 'pickup' ? 'Pickup order' : 'No venue QR detected';
    if (state.mode === 'delivery') {
      gate.innerHTML = `<div class="panel"><div class="panel-body"><p class="eyebrow">Delivery</p><h2>Continue with the delivery marketplace.</h2><p class="lede">Delivery availability, fees, order tracking and refunds are handled by the connected marketplace.</p><a class="button coral" href="${D.site.deliveryUrl}" target="_blank" rel="noopener">Open Uber Eats</a></div></div>`; active.innerHTML = ''; return;
    }
    if (state.mode === 'browse') {
      gate.innerHTML = `<div class="mode-panel compact"><div class="mode-intro"><small>Ordering is not active yet</small><strong>Choose a customer mode.</strong></div>${homeMode('dine-in','location','At the venue','Use a table QR')}${homeMode('pickup','bag','Pickup','Build an order')}${homeMode('delivery','arrow','Delivery','Marketplace handoff')}${homeMode('browse','menu','Browse only','View the menu')}</div>`; active.innerHTML = ''; return;
    }
    if (state.mode === 'dine-in' && !state.session) {
      gate.innerHTML = `<div class="panel"><div class="panel-body"><p class="eyebrow">Location verification required</p><h2>Open the menu from a Southernmost table QR.</h2><p class="lede">The physical QR supplies the service zone and table, bar seat, patio location or billiards station. You can open a sample location to experience the complete journey.</p><div class="actions"><a class="button coral" href="${url('qr/table-12.html')}">Open Dining Table 12</a><a class="button ink" href="${url('admin/qr-kit.html')}">View all location QRs</a></div></div></div>`; active.innerHTML = ''; return;
    }
    if ((state.mode === 'dine-in' || state.mode === 'pickup') && !state.guest.verified) {
      gate.innerHTML = verificationForm(state.mode === 'pickup' ? 'Pickup contact' : 'Verify the primary guest'); active.innerHTML = ''; return;
    }
    if (state.mode === 'dine-in' && !state.session.authorization) {
      gate.innerHTML = paymentGate(); active.innerHTML = ''; return;
    }
    gate.innerHTML = '';
    active.innerHTML = `<div class="session"><div><small>${state.mode === 'pickup' ? 'Pickup order' : `${state.session.zone} location`}</small><strong>${state.mode === 'pickup' ? 'Southernmost pickup' : `Table ${esc(state.session.table)} · Server ${esc(state.session.server)}`}</strong></div><div><small>Current balance</small><strong>${money(Store.openBalance())}</strong></div></div>
      <div class="member-row" id="member-row">${state.members.map(member => `<button class="member ${member.id === state.activeMemberId ? 'active' : ''}" data-member="${member.id}"><span class="avatar" style="background:${member.color}">${member.initials}</span>${esc(member.name)}</button>`).join('')}<button class="member" data-add-member>${icon('plus')} Add guest</button></div>
      <div class="order-layout"><div><div class="toolbar"><label class="search">${icon('search')}<input id="menu-search" type="search" placeholder="Search the menu"></label></div><div class="filters" id="menu-filters"></div><div class="menu-grid" id="order-menu"></div></div><aside class="order-side" id="order-side"></aside></div>`;
    renderMenuFilters(); renderMenuGrid('order'); renderOrderSide();
  }

  function verificationForm(title = 'Verify the primary guest') { return `<div class="panel"><div class="panel-head"><h2>${esc(title)}</h2><span class="status">Step 1 of 2</span></div><form class="panel-body form-grid" id="verify-form"><div class="field"><label>First name</label><input name="firstName" required autocomplete="given-name"></div><div class="field"><label>Mobile number</label><input name="phone" required inputmode="tel" autocomplete="tel"></div><label class="check field full"><input type="checkbox" name="ageConfirmed"> I am 21 or older. Staff will still check ID for alcohol.</label><div class="field full"><button class="button coral" type="submit">Verify and continue</button></div></form></div>`; }
  function paymentGate() { return `<div class="panel"><div class="panel-head"><h2>How should this tab be secured?</h2><span class="status">Step 2 of 2</span></div><div class="panel-body mode-choice-grid"><button class="mode-choice" data-authorize="digital"><i>${icon('wallet')}</i><strong>Digital tab</strong><span>Use an Apple Pay, Google Pay or card-style authorization and close online.</span></button><button class="mode-choice" data-authorize="server"><i>${icon('server')}</i><strong>Pay with server</strong><span>Request staff approval and present a physical card before digital ordering begins.</span></button></div></div>`; }

  function renderOrderSide() {
    const target = $('#order-side'); if (!target) return;
    const state = Store.getState();
    target.innerHTML = `<section class="panel"><div class="panel-head"><h2>Current round</h2><span>${state.cart.length} lines</span></div><div class="panel-body">${state.cart.length ? state.cart.map(cartLine).join('') : '<div class="empty small"><p>Add menu items for the active guest.</p></div>'}</div><div class="panel-foot summary"><div><span>Round subtotal</span><strong>${money(Store.cartSubtotal())}</strong></div><div><span>Open balance</span><strong>${money(Store.openBalance())}</strong></div><div class="total"><span>Projected</span><strong>${money(Store.cartSubtotal() + Store.openBalance())}</strong></div><button class="button coral full" data-submit-round ${state.cart.length ? '' : 'disabled'}>${state.mode === 'pickup' ? 'Review pickup order' : 'Send round to kitchen & bar'}</button></div></section>
      <section class="panel"><div class="panel-head"><h3>Request service</h3></div><div class="panel-body service-grid">${['Water refill','Napkins or utensils','Condiments','Allergy question','Check on order','Call server','Ready to pay'].map(type => `<button class="service" data-service="${type}">${icon(type === 'Ready to pay' ? 'wallet' : 'server')} ${type}</button>`).join('')}</div></section>
      <section class="panel"><div class="panel-head"><h3>Order rounds</h3><button class="button outline" data-open-checkout>Split & close</button></div><div class="panel-body">${state.rounds.length ? [...state.rounds].reverse().map(round => `<article class="round"><div class="round-top"><strong>Round ${round.number}</strong><span class="status ${round.status}">${round.status}</span></div><ul>${round.lines.map(line => `<li>${line.quantity} × ${esc(line.name)} · ${esc(state.members.find(member => member.id === line.memberId)?.name || 'Guest')}</li>`).join('')}</ul><div class="menu-foot"><b>${money(round.total)}</b><button class="button outline" data-repeat-round="${round.id}">Repeat round</button></div></article>`).join('') : '<p class="lede">Submitted rounds and preparation states appear here.</p>'}</div></section>`;
  }

  function checkoutModal() {
    const state = Store.getState(); const splits = Store.splitByMember(); const base = Store.openBalance();
    openModal('Split and close the tab', `<div class="checkout"><p class="lede">Choose the balance, tip and payment path. Payment details are not collected in this build.</p><div class="split-list">${splits.map(split => `<label class="split-row"><input type="radio" name="split" value="${split.member.id}" data-amount="${split.amount}"><span class="avatar" style="background:${split.member.color || '#ff6b4a'}">${split.member.initials}</span><span><strong>${esc(split.member.name)}</strong><small>Items assigned to this guest</small></span><b>${money(split.amount)}</b></label>`).join('')}<label class="split-row"><input type="radio" name="split" value="all" data-amount="${base}" checked><span class="avatar">ALL</span><span><strong>Entire remaining balance</strong><small>One guest closes everything</small></span><b>${money(base)}</b></label></div><div class="field"><label>Tip</label><div class="tip-grid">${[18,20,22,25,0].map(value => `<button type="button" class="filter ${value === 20 ? 'active' : ''}" data-tip="${value}">${value ? `${value}%` : 'Custom'}</button>`).join('')}</div></div><div class="panel"><div class="panel-body summary" id="checkout-summary"></div></div><div class="mode-choice-grid"><button class="mode-choice" data-pay-method="wallet"><i>${icon('wallet')}</i><strong>Digital wallet</strong><span>Fast device-native closeout.</span></button><button class="mode-choice" data-pay-method="card"><i>${icon('ticket')}</i><strong>Saved or new card</strong><span>Processor-hosted payment fields.</span></button><button class="mode-choice" data-pay-method="server"><i>${icon('server')}</i><strong>Call my server</strong><span>Pay in person and keep the digital receipt.</span></button></div></div>`, setupCheckout);
  }
  function setupCheckout() {
    let tipPercent = 20;
    const refresh = () => {
      const selected = $('input[name="split"]:checked'); const amount = Number(selected?.dataset.amount || 0); const tip = Store.money(amount * tipPercent / 100);
      $('#checkout-summary').innerHTML = `<div><span>Selected balance</span><strong>${money(amount)}</strong></div><div><span>Tip ${tipPercent}%</span><strong>${money(tip)}</strong></div><div class="total"><span>Total</span><strong>${money(amount + tip)}</strong></div>`;
    };
    $$('[data-tip]').forEach(button => button.addEventListener('click', () => { $$('[data-tip]').forEach(el => el.classList.remove('active')); button.classList.add('active'); tipPercent = Number(button.dataset.tip || 0); refresh(); }));
    $$('input[name="split"]').forEach(input => input.addEventListener('change', refresh));
    $$('[data-pay-method]').forEach(button => button.addEventListener('click', () => {
      const selected = $('input[name="split"]:checked'); const amount = Number(selected.dataset.amount || 0); const tip = Store.money(amount * tipPercent / 100);
      if (button.dataset.payMethod === 'server') { Store.requestService('Ready to pay'); emitToast('Your server has been requested'); }
      else { Store.recordPayment({ amount, memberId: selected.value === 'all' ? null : selected.value, method: button.dataset.payMethod, tip }); emitToast('Payment recorded'); }
      closeAll(); renderOrder(); updateShell();
    }));
    refresh();
  }

  function renderEventsPage() {
    const state = Store.getState();
    $('#page-root').innerHTML = `<section class="page-hero"><div class="shell"><p class="eyebrow">Events, sports and billiards</p><h1 class="page-title">Every weekend deserves<br><em>a soundtrack and a scoreboard.</em></h1><p class="lede">Live music, watch parties, acoustic brunch, billiards and venue events—organized in one calendar.</p></div></section><section class="section paper"><div class="shell"><div class="section-head"><div><p class="eyebrow">Upcoming</p><h2 class="section-title">What’s on.</h2></div><button class="button coral" data-waitlist>Join the billiards waitlist</button></div><div class="event-grid">${state.events.map(event => `<article class="event-card"><img src="${url(event.image)}" alt="${esc(event.title)}"><div class="event-body"><small>${esc(event.day)} · ${esc(event.time)}</small><h3>${esc(event.title)}</h3><p>${esc(event.description)}</p><div class="event-foot"><span>${event.attending} interested</span><button class="button outline" data-rsvp="${event.id}">RSVP</button></div></div></article>`).join('')}</div></div></section><section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Game-day guide</p><h2 class="section-title">What’s showing.</h2></div><p class="lede">A production integration can pull schedules automatically; this presentation shows the management and guest experience.</p></div><div class="sports">${state.sports.map(sport => `<div class="sport-row"><strong>${esc(sport.day)}</strong><span><b>${esc(sport.matchup)}</b><small>${esc(sport.league)}</small></span><span>${esc(sport.time)}</span><span>${esc(sport.screens)}</span><button class="button outline" data-watch="${sport.id}">Reserve</button></div>`).join('')}</div></div></section>
      <section class="section dark"><div class="shell billiards-grid"><div><p class="eyebrow">Billiards lounge</p><h2 class="section-title">Take the shot.<br><em>Keep the tab moving.</em></h2><p class="lede">Drag from the cue ball to shoot. The pockets remove object balls, a scratch resets the cue ball and the waitlist can connect a real station to the service flow.</p><div class="actions"><button class="button gold" data-waitlist>Join table waitlist</button><button class="button ghost" data-billiards-reset>Reset the rack</button></div></div><div class="scene-frame billiards"><canvas id="billiards-canvas" aria-label="Playable billiards table"></canvas></div></div></section>`;
  }

  function renderPrivateEvents() {
    const state = Store.getState();
    $('#page-root').innerHTML = `<section class="page-hero"><div class="shell"><p class="eyebrow">Private events</p><h1 class="page-title">Bring the whole crew.<br><em>We’ll handle the island.</em></h1><p class="lede">Birthdays, company nights, reunions, watch parties and full-venue celebrations with food, drinks, entertainment and hosted service.</p></div></section><section class="section paper"><div class="shell"><div class="package-grid">${state.packages.map((pkg,index) => `<article class="package ${index===1?'featured':''}"><p class="eyebrow">${index===1?'Most versatile':'Event package'}</p><h3>${esc(pkg.name)}</h3><strong>${typeof pkg.price === 'number' ? money(pkg.price) : pkg.price} <small>${esc(pkg.per)}</small></strong><p>${esc(pkg.description)}</p><ul>${pkg.features.map(feature => `<li>${esc(feature)}</li>`).join('')}</ul><button class="button ${index===1?'gold':'coral'} full" data-package="${pkg.id}">Build this event</button></article>`).join('')}</div></div></section><section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">Tell us what you’re planning</p><h2 class="section-title">Start the conversation.</h2></div><p class="lede">Capture the basics now; the event manager can follow up with capacity, menu and minimum-spend options.</p></div>${leadForm()}</div></section>`;
  }
  function leadForm(selected = '') { return `<form class="panel form-grid lead-form" id="lead-form"><div class="panel-head field full"><h2>Private-event inquiry</h2><span class="status">Response requested</span></div><div class="panel-body form-grid field full"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div><div class="field"><label>Phone</label><input name="phone" inputmode="tel"></div><div class="field"><label>Event type</label><select name="package"><option value="">Choose a package</option>${Store.getState().packages.map(pkg => `<option value="${pkg.id}" ${selected===pkg.id?'selected':''}>${esc(pkg.name)}</option>`).join('')}</select></div><div class="field"><label>Preferred date</label><input name="date" type="date" required></div><div class="field"><label>Estimated guests</label><input name="guests" type="number" min="8" value="24"></div><div class="field full"><label>What should the night feel like?</label><textarea name="notes" placeholder="Private screen, birthday toast, DJ, menu preferences…"></textarea></div><button class="button coral field full" type="submit">Send event inquiry</button></div></form>`; }

  function renderVisit() {
    $('#page-root').innerHTML = `<section class="page-hero"><div class="shell"><p class="eyebrow">Visit Southernmost</p><h1 class="page-title">Find the end<br><em>of the road.</em></h1><p class="lede">At the corner of Okeechobee and Military Trail—close enough for dinner, late enough for one more game.</p></div></section><section class="section"><div class="shell visit-grid"><div class="map-card"><div class="road h"></div><div class="road v"></div><div class="pin"></div></div><article class="visit-card"><img src="${url('assets/southernmost-wordmark.webp')}" alt="Southernmost Bar & Grille"><div class="visit-row"><i>${icon('location')}</i><span><small>Address</small><strong>${esc(D.site.address)}<br>${esc(D.site.city)}</strong></span></div><div class="visit-row"><i>${icon('clock')}</i><span><small>Hours</small><strong>${D.site.hours.map(row => `${esc(row.label)} · ${esc(row.value)}`).join('<br>')}</strong></span></div><div class="visit-row"><i>${icon('location')}</i><span><small>Arrival</small><strong>Okeechobee × Military Trail<br>On-site parking information pending confirmation</strong></span></div><div class="visit-row"><i>${icon('user')}</i><span><small>Accessibility</small><strong>Ask staff for an ordering alternative, seating support or accessibility assistance.</strong></span></div><div class="actions"><a class="button coral" href="${D.site.directionsUrl}" target="_blank" rel="noopener">Get directions</a><button class="button ghost" data-reserve>Reserve</button></div></article></div></section><section class="section paper"><div class="shell"><div class="section-head center"><p class="eyebrow">Plan the visit</p><h2 class="section-title">A smoother arrival.</h2></div><div class="feature-grid">${feature('clock','Check tonight’s timing','See kitchen estimates, events and late hours before leaving home.')}${feature('calendar','Reserve ahead','Request a table, celebration note or accessible seating preference.')}${feature('location','Know your options','Directions, parking and venue access information stay together.')}</div></div></section>`;
  }

  function renderLoyalty() {
    const state = Store.getState();
    $('#page-root').innerHTML = `<section class="page-hero"><div class="shell"><p class="eyebrow">Southernmost Passport</p><h1 class="page-title">Your next island night<br><em>starts with the last one.</em></h1><p class="lede">Points, birthday rewards, saved favorites, event reminders, referrals and digital gift cards in one guest account experience.</p></div></section><section class="section"><div class="shell loyalty-card"><div class="loyalty-copy"><p class="eyebrow">${state.loyalty.joined ? esc(state.loyalty.tier) : 'Join the Passport'}</p><h2 class="section-title">${state.loyalty.joined ? `${state.loyalty.points} points ready.` : 'Unlock the island.'}</h2><p class="lede">${state.loyalty.joined ? `Welcome back, ${esc(state.loyalty.name)}. Your next reward unlocks at 250 points.` : 'Receive a welcome reward, collect points and carry your favorites into the next order.'}</p>${state.loyalty.joined ? '<div class="progress"><i style="width:50%"></i></div><button class="button gold" data-loyalty-reward>View rewards</button>' : '<button class="button coral" data-join-loyalty>Join now</button>'}</div><div class="passport-wrap"><div class="passport"><img src="${url('assets/southernmost-wordmark.webp')}" alt=""><strong>ISLAND PASSPORT</strong><small>${state.loyalty.joined ? esc(state.loyalty.name) : 'West Palm Beach'}</small></div></div></div></section><section class="section paper"><div class="shell"><div class="section-head"><div><p class="eyebrow">Digital gift cards</p><h2 class="section-title">Send someone<br><em>an island night.</em></h2></div><p class="lede">Choose an amount, add a message and schedule delivery. A production provider would hold the actual card balance.</p></div><form class="panel form-grid" id="gift-form"><div class="panel-body form-grid field full"><div class="field"><label>Recipient</label><input name="recipient" required></div><div class="field"><label>Recipient email</label><input name="email" type="email" required></div><div class="field"><label>Amount</label><select name="amount"><option value="25">$25</option><option value="50">$50</option><option value="75">$75</option><option value="100">$100</option></select></div><div class="field"><label>Delivery date</label><input type="date" name="date"></div><div class="field full"><label>Message</label><textarea name="message"></textarea></div><button class="button coral field full" type="submit">Create gift card</button></div></form></div></section>`;
  }

  function renderStaff() {
    document.body.classList.add('dashboard-body');
    $('#page-root').innerHTML = `<header class="dash-head"><div class="shell dash-inner"><a class="dash-brand" href="${url('index.html')}"><img src="${url('assets/southernmost-wordmark.webp')}" alt="Southernmost"></a><nav class="dash-nav"><button data-staff-view="floor" class="active">Floor</button><button data-staff-view="kitchen">Kitchen</button><button data-staff-view="bar">Bar</button><button data-staff-view="service">Requests</button><button data-staff-view="tabs">Tabs</button></nav></div></header><main class="shell dash-main"><div class="dash-title"><div><p class="eyebrow">Staff operations</p><h1>Tonight’s floor.</h1><p>Browser-local operational view for the full guest journey.</p></div><a class="button ink" href="${url('admin/')}">Manager console</a></div><div id="staff-view"></div></main>`;
    renderStaffView('floor');
  }

  function renderStaffView(view) {
    const state = Store.getState(); const target = $('#staff-view'); if (!target) return;
    $$('[data-staff-view]').forEach(button => button.classList.toggle('active', button.dataset.staffView === view));
    const stats = `<div class="kpis">${kpi('Open tables', state.operations.tables.filter(t=>t.status!=='available').length)}${kpi('Open balance', money(state.operations.tables.reduce((s,t)=>s+t.balance,0)))}${kpi('New requests', state.operations.requests.filter(r=>r.status==='new').length)}${kpi('Kitchen time', `${state.operations.settings.waitTime} min`)}</div>`;
    if (view === 'floor') target.innerHTML = stats + `<div class="dashboard-grid"><section class="dash-card wide"><div class="dash-card-head"><h2>Floor map</h2><span class="status">Live shift view</span></div><div class="dash-card-body floor">${state.operations.tables.map(table => `<article class="table-tile ${table.status==='attention'?'attention':''}"><span class="status ${table.status}">${table.status}</span><h3>${esc(table.zone)} ${esc(table.id)}</h3><p>${table.guests} guests · ${esc(table.server)}</p><strong>${money(table.balance)}</strong></article>`).join('')}</div></section></div>`;
    else if (view === 'kitchen' || view === 'bar') {
      const tickets = state.operations.tickets.filter(ticket => ticket.type === view);
      target.innerHTML = stats + `<div class="dashboard-grid"><section class="dash-card wide"><div class="dash-card-head"><h2>${view==='kitchen'?'Kitchen display':'Bar display'}</h2><span>${tickets.length} active</span></div><div class="dash-card-body">${tickets.map(ticket => ticketRow(ticket)).join('') || '<p>No active tickets.</p>'}</div></section></div>`;
    } else if (view === 'service') target.innerHTML = stats + `<div class="dashboard-grid"><section class="dash-card wide"><div class="dash-card-head"><h2>Service request queue</h2></div><div class="dash-card-body">${state.operations.requests.map(requestRow).join('') || '<p>No active requests.</p>'}</div></section></div>`;
    else target.innerHTML = stats + `<div class="dashboard-grid"><section class="dash-card wide"><div class="dash-card-head"><h2>Open tabs</h2></div><div class="dash-card-body"><table class="admin-table"><thead><tr><th>Location</th><th>Server</th><th>Guests</th><th>Age</th><th>Balance</th><th>Status</th></tr></thead><tbody>${state.operations.tables.filter(table=>table.status!=='available').map(table=>`<tr><td>${esc(table.zone)} ${esc(table.id)}</td><td>${esc(table.server)}</td><td>${table.guests}</td><td>${table.age} min</td><td>${money(table.balance)}</td><td><span class="status ${table.status}">${table.status}</span></td></tr>`).join('')}</tbody></table></div></section></div>`;
  }
  function kpi(label, value) { return `<article class="kpi"><small>${label}</small><strong>${value}</strong></article>`; }
  function ticketRow(ticket) { return `<article class="ticket"><span class="status ${ticket.status}">${ticket.id}</span><div><h3>Table ${esc(ticket.table)} · ${esc(ticket.title)}</h3><p>${esc(ticket.detail || 'No special notes')} · ${ticket.age} min</p></div><div class="actions">${ticket.status==='new'?`<button class="button outline" data-ticket="${ticket.id}" data-status="preparing">Start</button>`:''}${ticket.status==='preparing'?`<button class="button gold" data-ticket="${ticket.id}" data-status="ready">Ready</button>`:''}${ticket.status==='ready'?`<button class="button ink" data-ticket="${ticket.id}" data-status="delivered">Delivered</button>`:''}</div></article>`; }
  function requestRow(request) { return `<article class="request"><span class="status ${request.status}">Table ${esc(request.table)}</span><div><h3>${esc(request.type)}</h3><p>${esc(request.server)} · ${request.age || 0} min</p></div><div class="actions">${request.status==='new'?`<button class="button outline" data-request="${request.id}" data-status="acknowledged">Acknowledge</button>`:`<button class="button ink" data-request="${request.id}" data-status="completed">Complete</button>`}</div></article>`; }

  function renderAdmin() {
    document.body.classList.add('dashboard-body');
    $('#page-root').innerHTML = `<header class="dash-head"><div class="shell dash-inner"><a class="dash-brand" href="${url('index.html')}"><img src="${url('assets/southernmost-wordmark.webp')}" alt="Southernmost"></a><nav class="dash-nav"><button data-admin-view="overview" class="active">Overview</button><button data-admin-view="menu">Menu</button><button data-admin-view="events">Events</button><button data-admin-view="leads">Leads</button><button data-admin-view="settings">Settings</button><a class="button ghost" href="${url('admin/qr-kit.html')}">QR routes</a></nav></div></header><main class="shell dash-main"><div class="dash-title"><div><p class="eyebrow">Manager console</p><h1>Control the night.</h1><p>Content, availability, queues, sales signals and operational switches.</p></div><a class="button ink" href="${url('staff/')}">Staff view</a></div><div id="admin-view"></div></main>`;
    renderAdminView('overview');
  }

  function renderAdminView(view) {
    const state = Store.getState(); const target = $('#admin-view'); if (!target) return;
    $$('[data-admin-view]').forEach(button => button.classList.toggle('active', button.dataset.adminView === view));
    if (view === 'overview') target.innerHTML = `<div class="kpis">${kpi('Projected sales', '$8,420')}${kpi('Open tabs', state.operations.tables.filter(t=>t.status!=='available').length)}${kpi('Average tab', '$67.25')}${kpi('Event interest', state.events.reduce((s,e)=>s+e.attending,0))}</div><div class="dashboard-grid"><section class="dash-card"><div class="dash-card-head"><h2>Operational health</h2></div><div class="dash-card-body">${settingRows(state.operations.settings)}</div></section><section class="dash-card"><div class="dash-card-head"><h2>Attention required</h2></div><div class="dash-card-body">${state.operations.requests.filter(r=>r.status==='new').map(requestRow).join('') || '<p>No urgent requests.</p>'}</div></section><section class="dash-card wide"><div class="dash-card-head"><h2>Tonight’s flow</h2><span class="status">Browser-local analytics</span></div><div class="dash-card-body chart"><div style="--h:42%"></div><div style="--h:55%"></div><div style="--h:71%"></div><div style="--h:63%"></div><div style="--h:88%"></div><div style="--h:96%"></div><div style="--h:78%"></div><div style="--h:64%"></div></div></section></div>`;
    else if (view === 'menu') target.innerHTML = `<section class="dash-card wide"><div class="dash-card-head"><h2>Menu availability and stock</h2><span>${Store.getItems().filter(item=>item.availability.available).length} available</span></div><div class="dash-card-body"><div class="toolbar"><label class="search">${icon('search')}<input id="admin-menu-search" placeholder="Find a menu item"></label></div><table class="admin-table"><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Stock</th><th>Available</th></tr></thead><tbody id="admin-menu-body">${adminMenuRows(Store.getItems())}</tbody></table></div></section>`;
    else if (view === 'events') target.innerHTML = `<div class="dashboard-grid"><section class="dash-card wide"><div class="dash-card-head"><h2>Event calendar</h2><button class="button coral" data-new-event>Add event</button></div><div class="dash-card-body">${state.events.map(event => `<article class="admin-row"><span class="status">${esc(event.day)}</span><div><h3>${esc(event.title)}</h3><p>${esc(event.date)} · ${event.attending} interested · capacity ${event.capacity}</p></div><button class="icon-button">${icon('edit')}</button></article>`).join('')}</div></section></div>`;
    else if (view === 'leads') target.innerHTML = `<div class="dashboard-grid"><section class="dash-card"><div class="dash-card-head"><h2>Private-event leads</h2></div><div class="dash-card-body">${state.privateLeads.map(lead => `<article class="admin-row"><span class="status new">New</span><div><h3>${esc(lead.name || 'Inquiry')}</h3><p>${esc(lead.date || 'Date pending')} · ${esc(lead.guests || '—')} guests · ${esc(lead.package || 'Custom')}</p></div><button class="button outline">Open</button></article>`).join('') || '<p>No private-event leads yet.</p>'}</div></section><section class="dash-card"><div class="dash-card-head"><h2>Reservations</h2></div><div class="dash-card-body">${state.reservations.map(res => `<article class="admin-row"><span class="status">${esc(res.status)}</span><div><h3>${esc(res.name)}</h3><p>${esc(res.date)} · ${esc(res.time)} · ${esc(res.guests)} guests</p></div><button class="button outline">Review</button></article>`).join('') || '<p>No reservations yet.</p>'}</div></section></div>`;
    else target.innerHTML = `<div class="dashboard-grid"><section class="dash-card"><div class="dash-card-head"><h2>Operational switches</h2></div><div class="dash-card-body">${settingRows(state.operations.settings, true)}</div></section><section class="dash-card"><div class="dash-card-head"><h2>Guest-facing content</h2></div><div class="dash-card-body form-grid"><div class="field full"><label>Kitchen estimate</label><input type="number" value="${state.operations.settings.waitTime}" data-setting-number="waitTime"></div><div class="field full"><label>Last call</label><input value="${esc(state.operations.settings.lastCall)}" data-setting-text="lastCall"></div><div class="field full"><label>Homepage announcement</label><textarea>Live music tonight · Kitchen open · Billiards waitlist available</textarea></div><button class="button coral field full" data-save-settings>Publish changes</button></div></section></div>`;
  }
  function settingRows(settings, interactive=false) { return [['orderingPaused','Ordering paused'],['kitchenPaused','Kitchen paused'],['barPaused','Bar paused'],['eventMode','Event mode'],['happyHour','Happy hour']].map(([key,label])=>`<article class="admin-row"><i>${icon(settings[key]?'pause':'play')}</i><div><h3>${label}</h3><p>${settings[key]?'Enabled':'Disabled'}</p></div>${interactive?`<button class="switch ${settings[key]?'on':''}" data-setting="${key}" aria-label="Toggle ${label}"></button>`:`<span class="status ${settings[key]?'attention':''}">${settings[key]?'On':'Off'}</span>`}</article>`).join(''); }
  function adminMenuRows(items) { return items.map(item => `<tr data-admin-item-row="${item.id}"><td><strong>${esc(item.name)}</strong></td><td>${esc(item.categoryName)}</td><td>${money(item.price)}</td><td><input class="stock-input" type="number" min="0" value="${item.availability.stock}" data-stock="${item.id}"></td><td><button class="switch ${item.availability.available?'on':''}" data-availability="${item.id}" aria-label="Toggle ${esc(item.name)}"></button></td></tr>`).join(''); }

  function reservationModal() {
    openModal('Reserve at Southernmost', `<form class="form-grid" id="reservation-form"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Mobile number</label><input name="phone" required></div><div class="field"><label>Date</label><input name="date" type="date" required></div><div class="field"><label>Time</label><input name="time" type="time" required></div><div class="field"><label>Guests</label><input name="guests" type="number" min="1" value="4"></div><div class="field"><label>Seating</label><select name="seating"><option>First available</option><option>Dining room</option><option>Patio</option><option>Near billiards</option></select></div><div class="field full"><label>Notes or accessibility needs</label><textarea name="notes"></textarea></div><button class="button coral field full" type="submit">Request reservation</button></form>`, () => $('#reservation-form').addEventListener('submit', event => { event.preventDefault(); Store.submitReservation(Object.fromEntries(new FormData(event.currentTarget))); closeAll(); emitToast('Reservation request saved'); }));
  }
  function waitlistModal() { openModal('Join the billiards waitlist', `<form class="form-grid" id="wait-form"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Mobile number</label><input name="phone" required></div><div class="field"><label>Players</label><input name="players" type="number" min="1" max="8" value="2"></div><div class="field"><label>Preferred area</label><select name="area"><option>Any table</option><option>Near the bar</option><option>Quieter area</option></select></div><button class="button coral field full" type="submit">Join waitlist</button></form>`, () => $('#wait-form').addEventListener('submit', event => { event.preventDefault(); const entry = Store.joinWaitlist(Object.fromEntries(new FormData(event.currentTarget))); closeAll(); emitToast(`You’re number ${entry.position} · about ${entry.estimate} minutes`); })); }
  function loyaltyModal() { openModal('Join Southernmost Passport', `<form class="form-grid" id="loyalty-form"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Mobile number</label><input name="phone" required></div><div class="field full"><label>Email</label><input type="email" name="email" required></div><label class="check field full"><input type="checkbox" required> I agree to receive account and reward messages. Marketing consent is managed separately.</label><button class="button coral field full">Join Passport</button></form>`, () => $('#loyalty-form').addEventListener('submit', event => { event.preventDefault(); Store.joinLoyalty(Object.fromEntries(new FormData(event.currentTarget))); closeAll(); emitToast('Passport activated'); if (page==='loyalty') renderLoyalty(); })); }
  function giftModal() { location.href = `${url('loyalty/')}#gift`; }
  function addMemberModal() { openModal('Add a guest to this table', `<form class="form-grid" id="member-form"><div class="field full"><label>Guest name</label><input name="name" required autofocus></div><button class="button coral field full">Add guest</button></form>`, () => $('#member-form').addEventListener('submit', event => { event.preventDefault(); Store.addMember(new FormData(event.currentTarget).get('name')); closeAll(); renderOrder(); emitToast('Guest added'); })); }
  function eventRsvpModal(eventId) { const event = Store.getState().events.find(entry=>entry.id===eventId); openModal(`RSVP · ${event?.title || 'Southernmost event'}`, `<form class="form-grid" id="rsvp-form"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Mobile number</label><input name="phone" required></div><div class="field full"><label>Guests</label><input name="guests" type="number" min="1" max="12" value="2"></div><button class="button coral field full">Save RSVP</button></form>`, () => $('#rsvp-form').addEventListener('submit', eventForm => { eventForm.preventDefault(); Store.rsvp(eventId, Object.fromEntries(new FormData(eventForm.currentTarget))); closeAll(); emitToast('RSVP saved'); })); }

  function bindEvents() {
    document.addEventListener('click', event => {
      const button = event.target.closest('button,a'); if (!button) return;
      if (button.matches('[data-mobile-toggle]')) { const menu = $('.mobile-menu'); menu.hidden = !menu.hidden; }
      if (button.matches('[data-open-cart]')) openDrawer('cart');
      if (button.matches('[data-open-guide]')) openDrawer('guide');
      if (button.matches('[data-close-drawers]')) closeAll();
      if (button.matches('[data-close-modal]')) closeAll();
      if (button.matches('[data-mode-launch]')) modeChooser();
      if (button.matches('[data-choose-mode]')) { const mode = button.dataset.chooseMode; closeAll(); setMode(mode, true); }
      if (button.matches('[data-home-mode]')) setMode(button.dataset.homeMode, true);
      if (button.matches('[data-item]')) showItem(button.dataset.item);
      if (button.matches('[data-qty]')) { Store.updateCart(button.dataset.qty, Number(button.dataset.value)); renderCartDrawer(); updateShell(); if (page==='order') renderOrderSide(); }
      if (button.matches('[data-filter]')) { menuFilter = button.dataset.filter; renderMenuFilters(); renderMenuGrid(page==='order'?'order':'menu'); }
      if (button.matches('[data-scroll-book]')) $('#menu-book')?.scrollIntoView({ behavior: 'smooth' });
      if (button.matches('[data-book-prev]')) setBook(bookIndex - 1);
      if (button.matches('[data-book-next]')) setBook(bookIndex + 1);
      if (button.matches('[data-book-jump]')) setBook(Number(button.dataset.bookJump));
      if (button.matches('[data-reserve]')) reservationModal();
      if (button.matches('[data-waitlist]')) waitlistModal();
      if (button.matches('[data-join-loyalty]')) loyaltyModal();
      if (button.matches('[data-gift-card]')) giftModal();
      if (button.matches('[data-add-member]')) addMemberModal();
      if (button.matches('[data-member]')) { Store.setActiveMember(button.dataset.member); renderOrder(); }
      if (button.matches('[data-authorize]')) { Store.authorizeTab(button.dataset.authorize); renderOrder(); emitToast('Tab opened'); }
      if (button.matches('[data-submit-round]')) { if (Store.getState().mode==='pickup') checkoutModal(); else { const round=Store.submitRound(); if(round){renderOrder();updateShell();emitToast(`Round ${round.number} accepted`);} } }
      if (button.matches('[data-service]')) { Store.requestService(button.dataset.service); emitToast(`${button.dataset.service} sent to ${Store.getState().session?.server || 'the host'}`); renderOrderSide(); }
      if (button.matches('[data-repeat-round]')) { Store.repeatRound(button.dataset.repeatRound); renderOrder(); updateShell(); emitToast('Round copied to current order'); }
      if (button.matches('[data-open-checkout]')) checkoutModal();
      if (button.matches('[data-rsvp]')) eventRsvpModal(button.dataset.rsvp);
      if (button.matches('[data-watch]')) reservationModal();
      if (button.matches('[data-package]')) { const form = $('#lead-form'); if (form) { form.package.value=button.dataset.package; form.scrollIntoView({behavior:'smooth'}); } }
      if (button.matches('[data-staff-view]')) renderStaffView(button.dataset.staffView);
      if (button.matches('[data-admin-view]')) renderAdminView(button.dataset.adminView);
      if (button.matches('[data-ticket]')) { Store.updateTicket(button.dataset.ticket, button.dataset.status); renderStaffView($('[data-staff-view].active')?.dataset.staffView || 'floor'); }
      if (button.matches('[data-request]')) { Store.updateRequest(button.dataset.request, button.dataset.status); renderStaffView('service'); }
      if (button.matches('[data-availability]')) { const item=Store.getItem(button.dataset.availability); Store.setAvailability(item.id,{available:!item.availability.available}); renderAdminView('menu'); }
      if (button.matches('[data-setting]')) { const state=Store.getState(); Store.updateSetting(button.dataset.setting,!state.operations.settings[button.dataset.setting]); renderAdminView('settings'); }
      if (button.matches('[data-save-settings]')) { const number=$('[data-setting-number]'); const text=$('[data-setting-text]'); if(number)Store.updateSetting(number.dataset.settingNumber,Number(number.value)); if(text)Store.updateSetting(text.dataset.settingText,text.value); emitToast('Guest-facing settings published'); }
      if (button.matches('.guide-rec')) showItem(button.dataset.item);
    });
    layers.layer.addEventListener('click', closeAll);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); });
    document.addEventListener('input', event => {
      if (event.target.matches('#menu-search')) { menuSearch = event.target.value.trim().toLowerCase(); renderMenuGrid(page==='order'?'order':'menu'); }
      if (event.target.matches('#admin-menu-search')) { const query=event.target.value.toLowerCase(); $$('[data-admin-item-row]').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(query)); }
      if (event.target.matches('[data-stock]')) { const value=Math.max(0,Number(event.target.value)); Store.setAvailability(event.target.dataset.stock,{stock:value,available:value>0}); }
    });
    window.addEventListener(Store.eventName, updateShell);
    $('#verify-form')?.addEventListener('submit', event => { event.preventDefault(); Store.verifyGuest(Object.fromEntries(new FormData(event.currentTarget))); renderOrder(); });
    $('#lead-form')?.addEventListener('submit', event => { event.preventDefault(); Store.submitLead(Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset(); emitToast('Event inquiry saved'); });
    $('#gift-form')?.addEventListener('submit', event => { event.preventDefault(); const card=Store.issueGiftCard(Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset(); emitToast(`Gift card ${card.code} created`); });
  }

  function registerWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', async () => { try { const registration = await navigator.serviceWorker.register(url('sw.js'), { updateViaCache: 'none' }); await registration.update(); } catch {} }, { once: true });
  }

  function boot() {
    sharedShell();
    if (page === 'home') renderHome();
    else if (page === 'menu') renderMenuPage();
    else if (page === 'order') renderOrderPage();
    else if (page === 'events') renderEventsPage();
    else if (page === 'private-events') renderPrivateEvents();
    else if (page === 'visit') renderVisit();
    else if (page === 'loyalty') renderLoyalty();
    else if (page === 'staff') renderStaff();
    else if (page === 'admin') renderAdmin();
    setupGuide(); bindEvents(); updateShell(); registerWorker();
  }

  document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
