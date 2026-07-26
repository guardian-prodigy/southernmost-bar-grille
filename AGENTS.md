# Southernmost implementation rules

## Mission

Maintain and productionize the Southernmost Bar & Grille guest website without flattening its tropical coastal identity or introducing unverified business claims.

## Non-negotiables

1. Preserve the tropical coastal palette, editorial typography and premium nightlife tone.
2. Keep table ordering locked unless a valid Southernmost QR/table context is present.
3. Keep the complete public menu available without an account.
4. Maintain keyboard navigation, focus visibility, reduced-motion support and responsive layouts.
5. Never hardcode payment credentials, API secrets, card data or customer records.
6. Treat client-supplied menu art and approved structured menu data as the menu source.
7. Do not publish unverified emails, social links, delivery URLs, review scores, performer names or event dates.
8. Keep AJL WebCraft attribution linked to https://ajlwebcraft.com.
9. Make ordering and private-event data boundaries explicit; do not imply that a local-only interaction was transmitted.
10. Keep +1 (727) 910-6118 available in the footer and primary contact surfaces.

## Before publishing

```bash
npm run lint
npm run test
```

Manually verify:

- Homepage navigation and conversion paths
- Public menu search and category filters
- Add, decrement, remove and clear cart behavior
- Pickup order review and copy action
- Locked dine-in state without QR context
- Verified QR entry and table context preservation
- Private-event brief builder
- Phone, map and directions links
- Terms, privacy and accessibility routes
- Mobile, tablet and desktop layouts
