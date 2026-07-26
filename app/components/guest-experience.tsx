"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { VenueStatus } from "./venue-status";

type ConciergeChoice = "date" | "tonight" | "first-visit" | "celebrate";

const responses: Record<
  ConciergeChoice,
  { eyebrow: string; title: string; copy: string; href: string; action: string }
> = {
  date: {
    eyebrow: "Dinner for two",
    title: "Start coastal. Finish with Key lime.",
    copy: "Share coconut shrimp, choose the Blackened Mahi or Jerk Lamb Chops, then stay for a sunset cocktail.",
    href: "/menu",
    action: "Open the menu book",
  },
  tonight: {
    eyebrow: "Tonight's move",
    title: "Arrive for golden hour. Stay for the room.",
    copy: "Happy hour runs daily from 5–7 PM. Friday and Saturday bring live energy; call for the confirmed lineup.",
    href: "/events",
    action: "Plan tonight",
  },
  "first-visit": {
    eyebrow: "First time here",
    title: "Order the signatures.",
    copy: "Southernmost Wings, Blackened Mahi, Jerk Lamb Chops and a Southernmost Sunset show the whole personality of the place.",
    href: "/menu",
    action: "See the signatures",
  },
  celebrate: {
    eyebrow: "Bring the crew",
    title: "Turn the occasion into an island night.",
    copy: "Build a private-event brief for group dining, a billiards social or a full-room celebration—without sending any data.",
    href: "/private-events#event-planner",
    action: "Build an event brief",
  },
};

export function GuestExperience() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ConciergeChoice>("first-visit");

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const response = responses[choice];

  return (
    <>
      <nav className="mobile-action-dock" aria-label="Quick actions">
        <Link className={pathname === "/menu" ? "active" : ""} href="/menu">
          <span aria-hidden="true">⌑</span>
          Menu
        </Link>
        <Link className={pathname === "/events" ? "active" : ""} href="/events">
          <span aria-hidden="true">♪</span>
          Tonight
        </Link>
        <Link className={pathname === "/order" ? "active primary" : "primary"} href="/order">
          <span aria-hidden="true">+</span>
          Order
        </Link>
        <Link className={pathname === "/visit" ? "active" : ""} href="/visit">
          <span aria-hidden="true">⌖</span>
          Visit
        </Link>
      </nav>

      <div className={`concierge-layer ${open ? "is-open" : ""}`}>
        {open && (
          <button
            className="concierge-backdrop"
            type="button"
            aria-label="Close island concierge"
            onClick={() => setOpen(false)}
          />
        )}
        <aside
          className="concierge-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Southernmost island concierge"
          aria-hidden={!open}
        >
          <div className="concierge-head">
            <div>
              <p className="eyebrow light">Island concierge</p>
              <h2>What kind of night are you planning?</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close concierge">
              ×
            </button>
          </div>
          <VenueStatus />
          <div className="concierge-choices" aria-label="Choose a recommendation">
            {([
              ["date", "Dinner for two"],
              ["tonight", "What’s on"],
              ["first-visit", "First visit"],
              ["celebrate", "Celebration"],
            ] as const).map(([value, label]) => (
              <button
                className={choice === value ? "active" : ""}
                type="button"
                key={value}
                onClick={() => setChoice(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="concierge-response" aria-live="polite">
            <span>{response.eyebrow}</span>
            <h3>{response.title}</h3>
            <p>{response.copy}</p>
            <Link className="button sun" href={response.href}>
              {response.action} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="concierge-contact">
            <span>Need a human?</span>
            <a href="tel:+17279106118">Call +1 (727) 910-6118</a>
          </div>
        </aside>
      </div>

      <button
        className={`concierge-trigger ${open ? "is-open" : ""}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close island concierge" : "Open island concierge"}
      >
        <span className="concierge-trigger-mark" aria-hidden="true">
          {open ? "×" : "SM"}
        </span>
        <span>
          <small>Need a hand?</small>
          Island concierge
        </span>
      </button>
    </>
  );
}
