"use client";

import Link from "next/link";
import { useState } from "react";

type NightMode = "dinner" | "golden-hour" | "live" | "celebration";

const modes: Record<
  NightMode,
  {
    label: string;
    eyebrow: string;
    title: string;
    copy: string;
    image: string;
    stops: { time: string; title: string; copy: string }[];
    href: string;
    action: string;
  }
> = {
  dinner: {
    label: "Dinner",
    eyebrow: "01 · Coastal dinner",
    title: "A full island table.",
    copy: "Build the night around fresh seafood, Caribbean signatures and the plates worth passing around.",
    image: "/assets/seafood.webp",
    stops: [
      { time: "START", title: "Share the table", copy: "Conch fritters or coconut shrimp." },
      { time: "MAIN", title: "Go Southernmost", copy: "Mahi, lamb chops or an island signature." },
      { time: "FINISH", title: "One more slice", copy: "Key lime pie, the Florida classic." },
    ],
    href: "/menu",
    action: "Explore dinner",
  },
  "golden-hour": {
    label: "Golden hour",
    eyebrow: "02 · Daily 5–7 PM",
    title: "Clock out. Drift south.",
    copy: "Trade the commute for cold drinks, shareable plates and a room that gets warmer as the sun drops.",
    image: "/assets/cocktails.webp",
    stops: [
      { time: "5:00", title: "First round", copy: "Start with a Southernmost Sunset." },
      { time: "6:00", title: "Share something", copy: "Wings, coconut shrimp or loaded fries." },
      { time: "7:00", title: "Stay for dinner", copy: "Turn golden hour into the whole night." },
    ],
    href: "/order",
    action: "Build a pickup order",
  },
  live: {
    label: "Live night",
    eyebrow: "03 · Weekend rhythm",
    title: "Dinner is the opening act.",
    copy: "Come early for a table, stay for live music, billiards and the late-night side of Southernmost.",
    image: "/assets/music.webp",
    stops: [
      { time: "EARLY", title: "Claim your corner", copy: "Dinner before the room turns up." },
      { time: "LIVE", title: "Catch the set", copy: "Friday and Saturday entertainment." },
      { time: "LATE", title: "Rack another game", copy: "Billiards and a final round." },
    ],
    href: "/events",
    action: "See the weekly rhythm",
  },
  celebration: {
    label: "Celebration",
    eyebrow: "04 · Bring your people",
    title: "Make the occasion feel like one.",
    copy: "Shape a birthday dinner, team night, watch party or full-room event around your group.",
    image: "/assets/interior.webp",
    stops: [
      { time: "PLAN", title: "Choose the format", copy: "Dinner, billiards social or private party." },
      { time: "BUILD", title: "Set the menu", copy: "Shared plates, plated service or bar bites." },
      { time: "TOAST", title: "Bring the energy", copy: "Full bar, music and room to celebrate." },
    ],
    href: "/private-events#event-planner",
    action: "Design your event",
  },
};

export function HomeExperience() {
  const [mode, setMode] = useState<NightMode>("dinner");
  const active = modes[mode];

  return (
    <section className="night-builder">
      <div className="shell">
        <div className="night-builder-heading">
          <div>
            <p className="eyebrow light">Choose your Southernmost</p>
            <h2>
              One room. Four ways
              <br />
              to <em>make a night of it.</em>
            </h2>
          </div>
          <p>
            Select the mood and see how the experience unfolds—from the first
            plate to the last song.
          </p>
        </div>
        <div className="night-builder-tabs" role="tablist" aria-label="Choose your night">
          {(Object.entries(modes) as [NightMode, (typeof modes)[NightMode]][]).map(
            ([key, item]) => (
              <button
                type="button"
                role="tab"
                aria-selected={mode === key}
                className={mode === key ? "active" : ""}
                key={key}
                onClick={() => setMode(key)}
              >
                <span>{String(Object.keys(modes).indexOf(key) + 1).padStart(2, "0")}</span>
                {item.label}
              </button>
            ),
          )}
        </div>
        <div className="night-builder-scene" key={mode}>
          <div className="night-builder-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.image} alt="" />
            <span>{active.eyebrow}</span>
          </div>
          <div className="night-builder-story">
            <p className="eyebrow">{active.eyebrow}</p>
            <h3>{active.title}</h3>
            <p>{active.copy}</p>
            <div className="night-itinerary">
              {active.stops.map((stop) => (
                <article key={stop.time}>
                  <span>{stop.time}</span>
                  <div>
                    <strong>{stop.title}</strong>
                    <p>{stop.copy}</p>
                  </div>
                </article>
              ))}
            </div>
            <Link className="button sun" href={active.href}>
              {active.action} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
