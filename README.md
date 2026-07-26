# Southernmost Bar & Grille

A modern, mobile-first guest website for Southernmost Bar & Grille in West Palm Beach, Florida.

## Guest experience

- Tropical editorial homepage with clear menu, ordering, event and visit paths
- Dedicated, QR-ready `/menu` route with all 57 current menu items
- Search and category filters designed for fast table-side use
- Device-local cart that persists while guests move between pages
- Pickup order builder with copyable order summaries and phone confirmation
- Dine-in ordering locked behind a valid Southernmost QR/table context
- Weekly live music, acoustic brunch, billiards and watch-party pages
- Private-event packages and a device-local event brief builder
- Google Maps embed, directions, hours and click-to-call contact details
- Responsive navigation, keyboard support, visible focus states and reduced-motion support
- Restaurant structured data, sitemap, robots policy, social metadata and installable web manifest

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage and primary conversion paths |
| `/menu` | Searchable public and QR-ready menu |
| `/order` | Pickup builder and protected dine-in entry |
| `/events` | Weekly entertainment and billiards |
| `/private-events` | Group-event packages and planning brief |
| `/visit` | Location, hours, map and contact |
| `/qr/table-12` | Example dining-room QR entry |
| `/qr/bar-03` | Example bar QR entry |
| `/qr/patio-07` | Example patio QR entry |
| `/qr/lounge-04` | Example billiards-lounge QR entry |

## Confirmed contact details

- Address: 4449 Okeechobee Blvd, West Palm Beach, FL 33417
- Phone: +1 (727) 910-6118
- Hours: Monday–Thursday 11 AM–11 PM; Friday–Sunday 11 AM–2 AM

## Production boundary

The order builder is a browser-side guest experience. It does not accept payment, submit orders, create accounts or route tickets to a POS. Live checkout requires a secure backend and client-approved payment/POS provider. The website says this clearly wherever a guest reviews an order.

Private-event and order summaries remain on the guest's device until the guest chooses to copy or use them.

## Local development

```bash
npm ci
npm run dev
```

Validation:

```bash
npm run lint
npm run test
```

Designed by [AJL WebCraft](https://ajlwebcraft.com).
