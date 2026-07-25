# AGENTS.md

## Mission

Maintain and productionize the Southernmost Bar & Grille website without flattening its visual identity or interaction quality.

## Non-negotiables

1. Preserve the tropical coastal palette, editorial typography and premium nightlife tone.
2. Keep table ordering locked unless a valid Southernmost QR/table context is present.
3. Keep public menu browsing available without requiring an account.
4. Maintain keyboard navigation, focus visibility, reduced-motion support and responsive layouts.
5. Never hardcode real payment credentials, API secrets, full card data or customer records.
6. Treat menu art supplied by the client as the current menu source unless an approved structured menu replaces it.
7. Do not publish unverified phone numbers, email addresses, social links, delivery listing URLs or event dates.
8. Keep AJL WebCraft attribution linked to https://ajlwebcraft.com.

## Before committing

```bash
npm run check
```

Manually test:

- Public read-only menu
- QR route and table verification
- Open tab and code 2468
- Item modifiers, cart and round submission
- Server request, tip and closeout
- Page-turning menu on mouse, touch and keyboard
- Terms, privacy and accessibility links
- 375px, 768px, 1440px and 1920px widths
