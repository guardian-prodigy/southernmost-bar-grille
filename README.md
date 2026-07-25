# Southernmost Bar & Grille — Client Website

A production-oriented interactive website for Southernmost Bar & Grille in West Palm Beach, Florida.

## Included

- Immersive Three.js hero, cocktail and billiards scenes
- CSS 3D page-turning menu book
- Searchable menu generated from the supplied menu artwork
- Public read-only menu and table-QR ordering unlock
- Persistent guest tab with phone verification, server assignment, order rounds, tipping and closeout flows
- Uber Eats delivery handoff
- Reservations, billiards bookings, event inquiries and event calendar
- Terms of Service, Privacy Policy and Accessibility statement
- PWA manifest, service worker, metadata, structured data, sitemap and QR landing pages
- Responsive mobile, tablet and desktop layouts

## Run locally

```bash
python -m http.server 4173
```

Open:

- Public site: `http://localhost:4173/`
- Table 12 ordering: `http://localhost:4173/qr/table-12.html`
- Bar seat 03: `http://localhost:4173/qr/bar-03.html`

Table access code format: `SM-LOCAL-{table}`. Mobile verification code: `2468`.

## Validation

```bash
npm run check
```

## Production boundaries

The front-end flows are complete for client review. Real SMS, payments, point-of-sale routing, inventory, waiter assignment, receipts, email and delivery-provider integrations require the backend contracts described in `docs/PRODUCTION_BACKEND.md`.

## AJL WebCraft

Designed and engineered by [AJL WebCraft](https://ajlwebcraft.com).
