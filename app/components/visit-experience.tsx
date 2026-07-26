"use client";

import Link from "next/link";
import { useState } from "react";
import { VenueStatus } from "./venue-status";

type VisitMode = "lunch" | "happy" | "dinner" | "late";

const plans: Record<
  VisitMode,
  {
    label: string;
    title: string;
    copy: string;
    arrival: string;
    first: string;
    after: string;
    href: string;
    action: string;
  }
> = {
  lunch: {
    label: "Lunch",
    title: "A coastal reset in the middle of the day.",
    copy: "Keep it fresh with a Mahi salad or go all-in on a Southernmost Burger.",
    arrival: "11 AM onward",
    first: "Browse seafood, salads and sandwiches",
    after: "Save the signatures for your next dinner",
    href: "/menu",
    action: "Browse lunch",
  },
  happy: {
    label: "Happy hour",
    title: "The shortest route from work to island time.",
    copy: "Plan around the listed daily 5–7 PM window, then call to confirm the current specials.",
    arrival: "Before 6 PM",
    first: "Start with shareable plates",
    after: "Turn the first round into dinner",
    href: "/menu",
    action: "Find shareables",
  },
  dinner: {
    label: "Dinner",
    title: "Come hungry. Leave on island time.",
    copy: "Build around the Blackened Mahi, Jerk Lamb Chops or a table full of Southernmost favorites.",
    arrival: "Early evening",
    first: "Start coastal or Caribbean",
    after: "Stay for Key lime and a game of pool",
    href: "/menu",
    action: "Open the dinner book",
  },
  late: {
    label: "Late night",
    title: "When dinner is only the beginning.",
    copy: "Check the weekly rhythm, call for tonight’s confirmed entertainment and make billiards part of the plan.",
    arrival: "After dinner",
    first: "Confirm tonight’s lineup",
    after: "Settle in for music and billiards",
    href: "/events",
    action: "Plan the late night",
  },
};

const address = "4449 Okeechobee Blvd, West Palm Beach, FL 33417";
const googleDirections =
  "https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417";
const appleDirections =
  "https://maps.apple.com/?q=Southernmost+Bar+%26+Grille&address=4449+Okeechobee+Blvd,+West+Palm+Beach,+FL+33417";

export function VisitExperience() {
  const [mode, setMode] = useState<VisitMode>("dinner");
  const [message, setMessage] = useState("");
  const plan = plans[mode];

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setMessage("Address copied");
    } catch {
      setMessage("Copy blocked—use either map link below");
    }
  }

  async function shareVisit() {
    if (navigator.share) {
      await navigator.share({
        title: "Southernmost Bar & Grille",
        text: `Meet me at Southernmost Bar & Grille — ${address}`,
        url: googleDirections,
      });
      setMessage("Visit shared");
      return;
    }
    await copyAddress();
  }

  return (
    <section className="visit-planner">
      <div className="shell">
        <div className="visit-planner-heading">
          <div>
            <p className="eyebrow light">Plan the arrival</p>
            <h2>
              What brings you
              <br />
              <em>south tonight?</em>
            </h2>
          </div>
          <VenueStatus />
        </div>
        <div className="visit-planner-grid">
          <div className="visit-plan-tabs" role="tablist" aria-label="Choose a visit">
            {(Object.entries(plans) as [VisitMode, (typeof plans)[VisitMode]][]).map(
              ([key, item], index) => (
                <button
                  className={mode === key ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  key={key}
                  onClick={() => setMode(key)}
                >
                  <span>0{index + 1}</span>
                  {item.label}
                </button>
              ),
            )}
          </div>
          <div className="visit-plan-card" key={mode}>
            <div className="visit-plan-story">
              <p className="eyebrow">{plan.label} plan</p>
              <h3>{plan.title}</h3>
              <p>{plan.copy}</p>
              <dl>
                <div>
                  <dt>Best arrival</dt>
                  <dd>{plan.arrival}</dd>
                </div>
                <div>
                  <dt>Start here</dt>
                  <dd>{plan.first}</dd>
                </div>
                <div>
                  <dt>Then</dt>
                  <dd>{plan.after}</dd>
                </div>
              </dl>
              <Link className="button sun" href={plan.href}>
                {plan.action} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <aside className="arrival-card">
              <span className="arrival-card-kicker">Your destination</span>
              <strong>4449<br />Okeechobee</strong>
              <small>West Palm Beach · Florida</small>
              <div className="arrival-actions">
                <a href={googleDirections} target="_blank" rel="noreferrer">
                  Google Maps
                </a>
                <a href={appleDirections} target="_blank" rel="noreferrer">
                  Apple Maps
                </a>
                <button type="button" onClick={copyAddress}>
                  Copy address
                </button>
                <button type="button" onClick={shareVisit}>
                  Share meetup
                </button>
              </div>
              <p aria-live="polite">{message}</p>
            </aside>
          </div>
        </div>
        <p className="listed-hours-note">
          Live status is based on the hours currently listed on this site.
          Holiday hours and special-event schedules may vary; call ahead when
          timing is essential.
        </p>
      </div>
    </section>
  );
}
