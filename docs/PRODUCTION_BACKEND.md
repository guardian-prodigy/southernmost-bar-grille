# Southernmost Production Backend

The public GitHub Pages build implements the full customer, staff and manager journey in the browser. The following services must be connected before real transactions.

## Recommended architecture

- Next.js and TypeScript application layer
- PostgreSQL or Supabase for guests, tabs, orders, menu, events and audit records
- Redis for session locks, signed QR state, rate limiting and idempotency
- Realtime subscriptions or WebSockets for guest, kitchen, bar and server updates
- Payment provider and POS selected together
- SMS verification provider with abuse controls
- Transactional email and receipt provider
- Object storage for approved photography and menu assets
- Privacy-conscious analytics, monitoring and error tracing

## Core domains

### Guest and QR security

- Verify mobile numbers and rate-limit OTP sends and attempts
- Restore open tabs on another device
- Keep marketing consent separate from transactional messaging
- Issue signed, revocable location tokens for tables, bar seats, patio areas and billiards stations
- Rotate compromised QR tokens without replacing every physical sign
- Require staff approval for suspicious or high-value sessions

### Tabs, payments and split checks

- Processor-backed authorization for digital tabs
- Staff-approved pay-at-server tabs
- Authorization increases where supported
- Split by person, item, exact amount or evenly
- Partial and whole-tab payments
- Voids, comps, refunds and disputes with reason codes
- No raw card storage

### Orders and availability

- Idempotent order-round submission
- Independent kitchen and bar routing
- POS acceptance before showing accepted status
- Modifiers, allergies, notes and responsible guest ownership
- Network interruption recovery and duplicate prevention
- Server-authoritative prices, taxes, happy-hour rules and availability
- Low-stock states and kitchen/bar pause controls

### Staff and management

- Shift roster, server sections and workload-aware assignment
- Table transfer and reassignment
- Kitchen and bar display queues
- Guest service requests with acknowledgements and timestamps
- Manager overrides with audit history
- Open and unpaid tab alerts
- Event, content, menu and QR management

## Security and reliability

- TLS, least privilege, staff SSO and role-based access
- Signed tokens, CSRF protection, bot defense and rate limiting
- Structured audit logs and payment reconciliation
- Backups with tested restores
- Load testing for major events
- Accessibility, privacy and Florida legal review before launch
