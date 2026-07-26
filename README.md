# Southernmost Bar & Grille Platform

A multi-experience restaurant platform for Southernmost Bar & Grille in West Palm Beach.

## Guest experiences

- Adaptive homepage with a time-aware “Tonight at Southernmost” module
- Customer-mode routing for dine-in, pickup, delivery and public browsing
- Full 57-item searchable menu with prices, availability, modifiers, dietary tags, budget filters and pairings
- Optional desktop and touch-friendly illustrated menu book
- Location-aware QR ordering routes for dining, patio, bar and billiards
- Guest verification, tab authorization, group members, order ownership, repeat rounds and running balances
- Service requests, preparation states and split-payment interface
- No-key, on-device Island Guide
- Events, watch parties and billiards waitlist
- Reservations and private-event inquiries
- Southernmost Passport and gift-card experience
- Progressive Three.js hero, cocktail bar and playable billiards scenes
- Responsive PWA and offline read-only shell

## Operations experiences

- Floor and open-tab view
- Kitchen display
- Bar display
- Service-request queue
- Manager dashboard and operational switches
- Menu availability and stock controls
- Event calendar, reservation and private-event lead queues
- QR route management

## Production boundary

The GitHub Pages deployment is a browser-side operational presentation. Real payment authorization, SMS verification, POS routing, inventory, staff authentication, receipts and accounting require the providers and secure backend described in `docs/PRODUCTION_BACKEND.md`.

## Validation

```bash
npm run check
```

Designed by [AJL WebCraft](https://ajlwebcraft.com).
