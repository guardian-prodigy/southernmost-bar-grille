"use client";

import Link from "next/link";

export function QrEntry({
  table,
  zone,
}: {
  table: string;
  zone: string;
}) {
  const href = `/order?mode=dine-in&table=${encodeURIComponent(table)}&zone=${encodeURIComponent(zone)}&qr=${encodeURIComponent(`SM-LOCAL-${table}`)}`;

  return (
    <main id="main-content" className="qr-entry">
      <div className="qr-entry-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/southernmost-logo-plate.webp"
          alt="Southernmost Bar & Grille"
        />
        <p className="eyebrow">Verified Southernmost location</p>
        <h1>
          {zone} · {table}
        </h1>
        <p>
          Browse the menu, build your next round and keep the order tied to
          this location.
        </p>
        <Link className="button sun" href={href}>
          Open table ordering
        </Link>
        <Link className="text-link" href="/menu">
          Browse without ordering <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
