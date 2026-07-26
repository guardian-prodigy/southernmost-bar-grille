(() => {
  'use strict';

  const Store = window.SMStore;
  if (!Store || document.body.dataset.page !== 'staff') return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);

  const money = value => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value || 0));

  function workloadRows() {
    const tables = Store.getState().operations.tables.filter(table => table.status !== 'available');
    const byServer = new Map();

    tables.forEach(table => {
      const current = byServer.get(table.server) || { tables: 0, guests: 0, balance: 0 };
      current.tables += 1;
      current.guests += Number(table.guests || 0);
      current.balance += Number(table.balance || 0);
      byServer.set(table.server, current);
    });

    if (!byServer.size) return '<p>No active server sections.</p>';

    return [...byServer.entries()].map(([server, load]) => `
      <article class="admin-row">
        <span class="status">${load.tables} ${load.tables === 1 ? 'table' : 'tables'}</span>
        <div>
          <h3>${escapeHtml(server)}</h3>
          <p>${load.guests} guests currently assigned</p>
        </div>
        <strong>${money(load.balance)}</strong>
      </article>
    `).join('');
  }

  function renderWorkload() {
    const target = document.querySelector('#staff-view');
    const floorActive = document.querySelector('[data-staff-view="floor"].active');
    const grid = target?.querySelector('.dashboard-grid');

    if (!target || !floorActive || !grid || grid.querySelector('[data-server-workload]')) return;

    const activeTables = Store.getState().operations.tables.filter(table => table.status !== 'available').length;
    const section = document.createElement('section');
    section.className = 'dash-card';
    section.dataset.serverWorkload = '';
    section.innerHTML = `
      <div class="dash-card-head">
        <h2>Server workload</h2>
        <span class="status">${activeTables} active</span>
      </div>
      <div class="dash-card-body">${workloadRows()}</div>
    `;
    grid.append(section);
  }

  const target = document.querySelector('#staff-view');
  if (target) {
    new MutationObserver(() => requestAnimationFrame(renderWorkload)).observe(target, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener(Store.eventName, renderWorkload);
  window.addEventListener('pageshow', renderWorkload);
  requestAnimationFrame(renderWorkload);
})();
