# Production Backend Requirements

## Core services

1. **Venue and table service**
   - Signed QR tokens mapped to venue, table, zone and optional server station
   - Token revocation and rotation
   - Table occupancy and session status

2. **Guest verification**
   - SMS one-time-password provider
   - Rate limiting, abuse controls and verification expiry
   - Optional payment preauthorization before opening a tab

3. **Menu and inventory**
   - Categories, items, modifiers, prices, taxes, happy hour and availability
   - Sold-out and low-stock states pushed in real time
   - Alcohol availability based on time and venue rules

4. **Ordering**
   - Idempotent order-round submission
   - Kitchen/bar routing and status updates
   - Point-of-sale acknowledgement and failure recovery
   - Guest notifications and server escalation

5. **Server assignment**
   - Shift roster, sections, table ownership and workload
   - Reassignment audit trail
   - Assistance and service-call queue

6. **Payments**
   - PCI-compliant provider and digital-wallet support
   - Preauthorization, incremental authorization, capture, tip adjustment, refund and void
   - Webhook signature verification and idempotency
   - Receipt generation and tax reconciliation

7. **Reservations and events**
   - Reservation provider or first-party calendar
   - Capacity rules, deposits and confirmations
   - CRM routing for private-event inquiries

## Suggested stack

- Next.js + React + TypeScript
- Node API or Next.js route handlers
- PostgreSQL/Supabase or MongoDB with transactional safeguards
- Redis for session and idempotency locks
- Stripe Terminal/Payments or the POS-supported processor
- Twilio or comparable SMS provider
- WebSockets/Supabase Realtime for tab and inventory updates
- Sentry, structured logs, audit trails and uptime monitoring

## Security controls

- Signed and expiring table tokens
- CSRF protection and same-site cookies
- Server-authoritative pricing and tax calculation
- Per-route rate limits
- Input validation and output encoding
- No full card data in application logs or database
- Least-privilege staff roles
- Encrypted secrets and automatic rotation
- Fraud and unpaid-tab escalation workflow
