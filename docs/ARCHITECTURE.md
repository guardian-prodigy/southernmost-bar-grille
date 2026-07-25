# Front-End Architecture

## Delivery model

The current build is a framework-free static application so the client can review every interaction from GitHub Pages without a build server. It can later be migrated to Next.js while preserving the interaction contracts.

## Modules

- `index.html` — semantic page structure and conversion funnels
- `styles.css` — design system, responsive behavior, CSS 3D menu and motion
- `data.js` — structured site, menu, modifier and event content
- `app.js` — guest tab, menu, cart, forms, page-turning and local state
- `three-scenes.js` — hero ocean, cocktail and billiards WebGL scenes
- `sw.js` — offline shell caching
- `qr/*` — table-specific entry points

## State model

### Ordering context

A valid table session requires:

- `table`
- `zone`
- `qr`

The current front end recognizes `SM-LOCAL-{table}` and the administrative fallback `SOUTHERNMOST`. In production, QR tokens must be signed, short-lived or server-validated rather than inferred from the table number.

### Guest tab

Stored locally for the review build:

- tab ID
- table and service zone
- verified guest name and masked mobile number
- age confirmation
- assigned server
- order rounds
- assistance requests
- open/closed state

Production storage must move to an authenticated server session and real-time database.

### Current round

The cart is intentionally separate from the running tab. Sending a round appends an immutable order batch and clears the current round.

## Accessibility

The menu book is an enhancement. The searchable menu grid exposes the same items without drag gestures. All major flows use labeled fields, buttons and dialogs, and motion is reduced when the OS preference is enabled.
