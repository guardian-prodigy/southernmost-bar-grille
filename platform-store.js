(() => {
  const DATA = window.SOUTHERNMOST;
  if (!DATA) throw new Error('Southernmost data failed to load.');

  const RELEASE = '20260727b';
  const KEY = 'southernmost-platform-state-v5';
  const eventName = 'southernmost:state';
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const money = value => Number(Number(value || 0).toFixed(2));
  const now = () => new Date().toISOString();
  const initials = name => String(name || 'Guest').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();

  const imageByCategory = Object.fromEntries(DATA.menu.map(category => [category.id, category.image]));
  const flattenedItems = DATA.menu.flatMap((category, categoryIndex) => category.items.map((item, itemIndex) => ({
    ...item,
    categoryId: category.id,
    categoryName: category.name,
    categorySubtitle: category.subtitle,
    categoryIndex,
    itemIndex,
    image: item.image || category.image,
    prep: item.prep || (item.alcoholic ? 4 : ['sides', 'desserts'].includes(category.id) ? 8 : ['signatures', 'seafood'].includes(category.id) ? 22 : 14),
    popularity: item.popularity || Math.max(68, 96 - categoryIndex * 2 - itemIndex),
    tags: item.tags || inferTags(item, category.id),
    pairings: item.pairings || inferPairings(item, category.id),
    happyHour: Boolean(item.happyHour || ['wings-order', 'southernmost-sunset', 'guava-breeze', 'island-mojito'].includes(item.id))
  })));

  function inferTags(item, categoryId) {
    const text = `${item.name} ${item.description}`.toLowerCase();
    const tags = [];
    if (/shrimp|fish|mahi|crab|seafood|conch/.test(text)) tags.push('Seafood');
    if (/jerk|habanero|hot|spicy|buffalo/.test(text)) tags.push('Spicy');
    if (/salad|vegetable|margherita|fries|rings|plantain|rice|coleslaw/.test(text)) tags.push('Vegetarian option');
    if (/fried|battered|pretzel|pasta|flatbread|sandwich|burger/.test(text)) tags.push('Contains gluten');
    if (/cheese|cream|ranch|aioli|butter|ice cream/.test(text)) tags.push('Contains dairy');
    if (item.alcoholic) tags.push('21+');
    if (item.price <= 15) tags.push('Under $15');
    if (categoryId === 'starters' || categoryId === 'wings' || categoryId === 'flatbreads') tags.push('Shareable');
    return [...new Set(tags)].slice(0, 4);
  }

  function inferPairings(item, categoryId) {
    if (item.alcoholic) return ['Conch Fritters', 'Southernmost Wings'];
    if (['seafood', 'tacos'].includes(categoryId)) return ['Key Lime Margarita', 'Island Mojito'];
    if (['burgers', 'wings', 'flatbreads'].includes(categoryId)) return ['Rum Runner', 'Draft beer'];
    if (categoryId === 'desserts') return ['Guava Breeze', 'Coffee'];
    return ['Southernmost Sunset', 'Coconut Rice'];
  }

  const sports = [
    { id: 'sports-1', day: 'Thursday', time: '7:00 PM', league: 'NFL', matchup: 'Thursday Night Football', screens: 'Main bar + patio', package: 'Wing tower for four' },
    { id: 'sports-2', day: 'Friday', time: '7:30 PM', league: 'NBA', matchup: 'Prime-time basketball', screens: 'Main bar', package: 'Buckets + flatbread' },
    { id: 'sports-3', day: 'Saturday', time: '12:00 PM', league: 'NCAA', matchup: 'College football slate', screens: 'All screens', package: 'Game-day sampler' },
    { id: 'sports-4', day: 'Sunday', time: '1:00 PM', league: 'NFL', matchup: 'Sunday football', screens: 'All screens', package: 'Wings + pitchers' }
  ];

  const packages = [
    { id: 'sunset', name: 'Sunset Social', price: 38, per: 'per guest', description: 'Reserved area, island starters, two drink tickets and hosted service.', features: ['Two-hour reserved area', 'Starter spread', 'Two drink tickets', 'Dedicated server'] },
    { id: 'watch-party', name: 'Watch Party', price: 52, per: 'per guest', description: 'A private screen zone, game-day food and hosted bar service.', features: ['Dedicated screen zone', 'Wing and flatbread buffet', 'Hosted bar', 'Team branding welcome'] },
    { id: 'full-buyout', name: 'Southernmost After Dark', price: 3500, per: 'starting minimum', description: 'A full venue experience for milestone events and company nights.', features: ['Venue buyout option', 'Custom menu', 'Entertainment coordination', 'Event manager'] }
  ];

  const seededEvents = DATA.events.map((event, index) => ({
    id: `event-${index + 1}`,
    ...event,
    date: ['2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10', '2026-08-11'][index],
    image: index < 3 ? 'assets/music.webp' : index === 3 ? 'assets/interior.webp' : 'assets/hero.webp',
    capacity: index === 3 ? 18 : 120,
    attending: [54, 76, 31, 8, 83][index]
  }));

  const defaultOperations = {
    settings: {
      orderingPaused: false,
      kitchenPaused: false,
      barPaused: false,
      eventMode: true,
      happyHour: true,
      waitTime: 22,
      lastCall: '1:30 AM'
    },
    tables: [
      { id: '12', zone: 'Dining', server: 'Maya', status: 'active', guests: 4, balance: 86.5, age: 42 },
      { id: '07', zone: 'Patio', server: 'Riley', status: 'attention', guests: 3, balance: 51, age: 18 },
      { id: '03', zone: 'Bar', server: 'Alex', status: 'active', guests: 2, balance: 36, age: 11 },
      { id: '04', zone: 'Lounge', server: 'Taylor', status: 'active', guests: 5, balance: 122, age: 57 },
      { id: '15', zone: 'Dining', server: 'Jordan', status: 'available', guests: 0, balance: 0, age: 0 },
      { id: '08', zone: 'Patio', server: 'Morgan', status: 'payment', guests: 2, balance: 44, age: 66 },
      { id: '06', zone: 'Dining', server: 'Maya', status: 'active', guests: 6, balance: 184.25, age: 39 },
      { id: '02', zone: 'Bar', server: 'Casey', status: 'available', guests: 0, balance: 0, age: 0 }
    ],
    tickets: [
      { id: 'K-041', type: 'kitchen', table: '12', title: '2 × Mahi Tacos', detail: 'One no crema · shellfish allergy noted', status: 'preparing', age: 7 },
      { id: 'K-042', type: 'kitchen', table: '06', title: 'Jerk Lamb Chops', detail: 'Medium · extra plantains', status: 'new', age: 3 },
      { id: 'K-043', type: 'kitchen', table: '07', title: 'Coconut Shrimp', detail: 'Sweet chili on side', status: 'ready', age: 12 },
      { id: 'B-021', type: 'bar', table: '04', title: '3 × Southernmost Sunset', detail: 'One alcohol-free substitute', status: 'preparing', age: 4 },
      { id: 'B-022', type: 'bar', table: '03', title: 'Key Lime Margarita', detail: 'Salt rim', status: 'new', age: 1 }
    ],
    requests: [
      { id: 'R-101', table: '07', type: 'Check on order', server: 'Riley', status: 'new', age: 2 },
      { id: 'R-102', table: '04', type: 'Water refill', server: 'Taylor', status: 'acknowledged', age: 4 },
      { id: 'R-103', table: '12', type: 'Extra napkins', server: 'Maya', status: 'new', age: 1 }
    ]
  };

  const initialState = {
    release: RELEASE,
    mode: 'browse',
    guest: { firstName: '', phone: '', verified: false, ageConfirmed: false },
    session: null,
    members: [],
    activeMemberId: null,
    cart: [],
    rounds: [],
    serviceRequests: [],
    payments: [],
    reservations: [],
    privateLeads: [],
    waitlist: [],
    loyalty: { joined: false, name: '', phone: '', points: 0, tier: 'Driftwood' },
    giftCards: [],
    eventRsvps: [],
    availability: Object.fromEntries(flattenedItems.map(item => [item.id, { available: true, stock: Math.max(4, Math.round(26 - item.itemIndex * 2)) }])),
    events: seededEvents,
    sports,
    packages,
    operations: clone(defaultOperations),
    updatedAt: now()
  };

  let state = load();

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (parsed?.release === RELEASE) return merge(initialState, parsed);
    } catch {}
    return clone(initialState);
  }

  function merge(base, value) {
    const output = clone(base);
    Object.keys(value || {}).forEach(key => {
      if (value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]) && typeof output[key] === 'object' && !Array.isArray(output[key])) output[key] = { ...output[key], ...value[key] };
      else output[key] = value[key];
    });
    return output;
  }

  function persist(reason = 'update') {
    state.updatedAt = now();
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(eventName, { detail: { reason, state: clone(state) } }));
    return clone(state);
  }

  function getState() { return clone(state); }
  function getItems() { return flattenedItems.map(item => ({ ...item, availability: clone(state.availability[item.id] || { available: true, stock: 10 }) })); }
  function getItem(id) { const item = flattenedItems.find(entry => entry.id === id); return item ? { ...item, availability: clone(state.availability[id] || { available: true, stock: 10 }) } : null; }
  function reset() { state = clone(initialState); return persist('reset'); }
  function setMode(mode) { state.mode = ['browse', 'dine-in', 'pickup', 'delivery'].includes(mode) ? mode : 'browse'; return persist('mode'); }

  function readQrContext() {
    const params = new URLSearchParams(location.search);
    const table = params.get('table');
    const zone = params.get('zone');
    const token = params.get('token');
    if (!table || !zone || !token?.startsWith('SM-')) return null;
    return { table, zone, token, station: params.get('station') || null };
  }

  function openSession(context = readQrContext()) {
    if (!context) return null;
    const serverPool = DATA.servers[context.zone] || DATA.servers.dining;
    const server = serverPool[Math.abs(Number(context.table) || 1) % serverPool.length];
    state.mode = 'dine-in';
    state.session = {
      id: uid('tab'),
      ...context,
      server,
      status: 'verification-required',
      openedAt: now(),
      authorization: null,
      joinCode: Math.random().toString(36).slice(2, 7).toUpperCase()
    };
    if (!state.members.length) {
      const member = { id: uid('member'), name: 'Primary guest', initials: 'PG', color: '#ff6b4a', joinedAt: now() };
      state.members = [member];
      state.activeMemberId = member.id;
    }
    persist('session-open');
    return clone(state.session);
  }

  function verifyGuest(details) {
    state.guest = {
      firstName: String(details.firstName || '').trim().slice(0, 40),
      phone: String(details.phone || '').replace(/[^0-9+]/g, '').slice(0, 18),
      verified: true,
      ageConfirmed: Boolean(details.ageConfirmed)
    };
    const primary = state.members[0];
    if (primary) {
      primary.name = state.guest.firstName || 'Primary guest';
      primary.initials = initials(primary.name);
    }
    if (state.session) state.session.status = 'payment-required';
    persist('guest-verified');
    return clone(state.guest);
  }

  function authorizeTab(method = 'digital') {
    if (!state.session) return null;
    state.session.authorization = {
      method,
      status: method === 'server' ? 'server-approved' : 'authorized',
      reference: `SM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      limit: 250,
      authorizedAt: now()
    };
    state.session.status = 'open';
    return persist('tab-authorized').session;
  }

  function addMember(name) {
    const clean = String(name || '').trim().slice(0, 36);
    if (!clean) return null;
    const palette = ['#ff6b4a', '#17b9a4', '#f7bd4d', '#7a65d1', '#db5f9b', '#4286d8'];
    const member = { id: uid('member'), name: clean, initials: initials(clean), color: palette[state.members.length % palette.length], joinedAt: now() };
    state.members.push(member);
    state.activeMemberId = member.id;
    persist('member-added');
    return clone(member);
  }
  function setActiveMember(id) { if (state.members.some(member => member.id === id)) state.activeMemberId = id; return persist('active-member'); }

  function addToCart(itemId, options = {}) {
    const item = getItem(itemId);
    if (!item?.availability.available) return null;
    const modifierTotal = (options.modifiers || []).reduce((sum, option) => sum + Number(option.price || 0), 0);
    const line = {
      lineId: uid('line'), itemId, name: item.name, image: item.image, basePrice: item.price,
      modifierTotal: money(modifierTotal), unitPrice: money(item.price + modifierTotal), quantity: Math.max(1, Number(options.quantity || 1)),
      memberId: options.memberId || state.activeMemberId || state.members[0]?.id || null,
      modifiers: clone(options.modifiers || []), notes: String(options.notes || '').slice(0, 180), allergy: Boolean(options.allergy), addedAt: now()
    };
    state.cart.push(line);
    persist('cart-add');
    return clone(line);
  }
  function updateCart(lineId, quantity) { const line = state.cart.find(entry => entry.lineId === lineId); if (!line) return null; if (quantity <= 0) state.cart = state.cart.filter(entry => entry.lineId !== lineId); else line.quantity = Math.min(20, Number(quantity)); return persist('cart-update').cart; }
  function clearCart() { state.cart = []; return persist('cart-clear'); }
  function cartSubtotal() { return money(state.cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)); }
  function openBalance() { return money(state.rounds.reduce((sum, round) => sum + round.total, 0) - state.payments.reduce((sum, payment) => sum + payment.amount, 0)); }

  function submitRound() {
    if (!state.cart.length || state.operations.settings.orderingPaused) return null;
    const lines = clone(state.cart);
    const round = {
      id: uid('round'), number: state.rounds.length + 1, lines, subtotal: cartSubtotal(), tax: money(cartSubtotal() * .07),
      total: money(cartSubtotal() * 1.07), status: 'accepted', sentAt: now(), estimatedMinutes: state.operations.settings.waitTime
    };
    state.rounds.push(round);
    lines.forEach(line => {
      const item = getItem(line.itemId);
      const type = item?.alcoholic ? 'bar' : 'kitchen';
      state.operations.tickets.push({
        id: `${type === 'bar' ? 'B' : 'K'}-${String(50 + state.operations.tickets.length).padStart(3, '0')}`,
        type, table: state.session?.table || 'Pickup', title: `${line.quantity} × ${line.name}`,
        detail: [line.modifiers.map(mod => mod.label || mod.value).join(', '), line.notes, line.allergy ? 'ALLERGY ALERT' : ''].filter(Boolean).join(' · '),
        status: 'new', age: 0
      });
      const availability = state.availability[line.itemId];
      if (availability) availability.stock = Math.max(0, availability.stock - line.quantity);
      if (availability?.stock === 0) availability.available = false;
    });
    state.cart = [];
    persist('round-submit');
    return clone(round);
  }

  function repeatRound(roundId) {
    const round = state.rounds.find(entry => entry.id === roundId);
    if (!round) return null;
    round.lines.forEach(line => {
      const availability = state.availability[line.itemId];
      if (availability?.available) state.cart.push({ ...clone(line), lineId: uid('line'), addedAt: now() });
    });
    return persist('round-repeat').cart;
  }

  function requestService(type) {
    const request = { id: uid('request'), table: state.session?.table || '—', type, server: state.session?.server || 'Host', status: 'new', createdAt: now(), age: 0 };
    state.serviceRequests.push(request);
    state.operations.requests.push(clone(request));
    persist('service-request');
    return clone(request);
  }

  function totals(tipPercent = 20) {
    const subtotal = openBalance();
    const tip = money(subtotal * Number(tipPercent || 0) / 100);
    return { subtotal, taxIncluded: true, tip, total: money(subtotal + tip) };
  }

  function splitByMember() {
    const result = {};
    state.members.forEach(member => result[member.id] = { member: clone(member), amount: 0 });
    state.rounds.forEach(round => round.lines.forEach(line => {
      if (!result[line.memberId]) result[line.memberId] = { member: { id: line.memberId, name: 'Guest', initials: 'G' }, amount: 0 };
      result[line.memberId].amount += line.unitPrice * line.quantity * 1.07;
    }));
    return Object.values(result).map(entry => ({ ...entry, amount: money(entry.amount) }));
  }

  function recordPayment({ amount, memberId = null, method = 'wallet', tip = 0 }) {
    const payment = { id: uid('payment'), amount: money(Number(amount) + Number(tip)), baseAmount: money(amount), tip: money(tip), memberId, method, status: 'completed', paidAt: now() };
    state.payments.push(payment);
    if (state.session && openBalance() <= .01) state.session.status = 'closed';
    persist('payment');
    return clone(payment);
  }

  function rsvp(eventId, details) { const rsvp = { id: uid('rsvp'), eventId, ...details, createdAt: now() }; state.eventRsvps.push(rsvp); persist('rsvp'); return clone(rsvp); }
  function joinWaitlist(details) { const entry = { id: uid('wait'), position: state.waitlist.length + 1, estimate: 15 + state.waitlist.length * 8, ...details, createdAt: now() }; state.waitlist.push(entry); persist('waitlist'); return clone(entry); }
  function submitReservation(details) { const entry = { id: uid('reservation'), status: 'requested', ...details, createdAt: now() }; state.reservations.push(entry); persist('reservation'); return clone(entry); }
  function submitLead(details) { const entry = { id: uid('lead'), status: 'new', ...details, createdAt: now() }; state.privateLeads.push(entry); persist('lead'); return clone(entry); }
  function joinLoyalty(details) { state.loyalty = { joined: true, name: details.name || state.guest.firstName, phone: details.phone || state.guest.phone, points: 125, tier: 'Driftwood', joinedAt: now() }; persist('loyalty'); return clone(state.loyalty); }
  function issueGiftCard(details) { const card = { id: uid('gift'), code: `SM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`, balance: money(details.amount), ...details, status: 'active', issuedAt: now() }; state.giftCards.push(card); persist('gift-card'); return clone(card); }
  function setAvailability(itemId, patch) { state.availability[itemId] = { ...state.availability[itemId], ...patch }; return persist('availability').availability[itemId]; }
  function updateSetting(key, value) { state.operations.settings[key] = value; return persist('setting').operations.settings; }
  function updateTicket(id, status) { const ticket = state.operations.tickets.find(entry => entry.id === id); if (ticket) ticket.status = status; return persist('ticket').operations.tickets; }
  function updateRequest(id, status) { const request = state.operations.requests.find(entry => entry.id === id); if (request) request.status = status; const guestRequest = state.serviceRequests.find(entry => entry.id === id); if (guestRequest) guestRequest.status = status; return persist('request').operations.requests; }

  window.SMStore = {
    RELEASE, DATA, eventName, getState, getItems, getItem, reset, setMode, readQrContext, openSession, verifyGuest, authorizeTab,
    addMember, setActiveMember, addToCart, updateCart, clearCart, cartSubtotal, openBalance, submitRound, repeatRound,
    requestService, totals, splitByMember, recordPayment, rsvp, joinWaitlist, submitReservation, submitLead,
    joinLoyalty, issueGiftCard, setAvailability, updateSetting, updateTicket, updateRequest, money, initials, imageByCategory
  };
})();
