"use client";

import { useMemo, useState } from "react";

type EventKind = "music" | "social" | "sports";

type WeeklyEvent = {
  day: number;
  label: string;
  title: string;
  time: string;
  copy: string;
  accent: string;
  kind: EventKind;
  startHour: number;
  durationHours: number;
};

const weeklyEvents: WeeklyEvent[] = [
  {
    day: 5,
    label: "Friday",
    title: "Live Music Fridays",
    time: "Evening · lineup varies",
    copy: "Local artists, cold drinks and an easygoing crowd to start the weekend right.",
    accent: "LIVE",
    kind: "music",
    startHour: 19,
    durationHours: 3,
  },
  {
    day: 6,
    label: "Saturday",
    title: "Southernmost Saturdays",
    time: "Late night · lineup varies",
    copy: "Live entertainment, tropical cocktails and a room that stays energized until close.",
    accent: "WEEKEND",
    kind: "music",
    startHour: 20,
    durationHours: 3,
  },
  {
    day: 0,
    label: "Sunday",
    title: "Acoustic Brunch",
    time: "Brunch · confirm performance time",
    copy: "A laid-back acoustic set, island-inspired plates and a slower Sunday pace.",
    accent: "ACOUSTIC",
    kind: "music",
    startHour: 11,
    durationHours: 3,
  },
  {
    day: 4,
    label: "Nightly",
    title: "Billiards Lounge",
    time: "Open late",
    copy: "Rack up a game with friends, join a casual matchup or make the tables your after-dinner plan.",
    accent: "PLAY",
    kind: "social",
    startHour: 19,
    durationHours: 3,
  },
  {
    day: 6,
    label: "Featured games",
    title: "Watch-Party Energy",
    time: "Schedule follows major matchups",
    copy: "Big screens, wings and cold drinks when the games everyone wants to see are on.",
    accent: "GAME DAY",
    kind: "sports",
    startHour: 18,
    durationHours: 4,
  },
];

const filterLabels: { value: "all" | EventKind; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "music", label: "Live music" },
  { value: "social", label: "Billiards" },
  { value: "sports", label: "Game day" },
];

function nextOccurrence(event: WeeklyEvent) {
  const date = new Date();
  const offset = (event.day - date.getDay() + 7) % 7;
  if (offset === 0 && date.getHours() >= event.startHour) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setDate(date.getDate() + offset);
  }
  date.setHours(event.startHour, 0, 0, 0);
  return date;
}

function calendarDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}00`;
}

function downloadReminder(event: WeeklyEvent) {
  const start = nextOccurrence(event);
  const end = new Date(start);
  end.setHours(end.getHours() + event.durationHours);
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Southernmost Bar & Grille//Guest Planner//EN",
    "BEGIN:VEVENT",
    `UID:southernmost-${event.kind}-${start.getTime()}@southernmost`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;TZID=America/New_York:${calendarDate(start)}`,
    `DTEND;TZID=America/New_York:${calendarDate(end)}`,
    `SUMMARY:${event.title} — planning reminder`,
    "LOCATION:4449 Okeechobee Blvd\\, West Palm Beach\\, FL 33417",
    `DESCRIPTION:${event.copy} Call +1 (727) 910-6118 to confirm the current lineup and time.`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const file = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `southernmost-${event.kind}-reminder.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EventExplorer() {
  const [filter, setFilter] = useState<"all" | EventKind>("all");
  const [saved, setSaved] = useState<string | null>(null);
  const events = useMemo(
    () => weeklyEvents.filter((event) => filter === "all" || event.kind === filter),
    [filter],
  );

  return (
    <>
      <div className="event-filter" aria-label="Filter the weekly lineup">
        {filterLabels.map((item) => (
          <button
            className={filter === item.value ? "active" : ""}
            type="button"
            key={item.value}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="lineup-grid enhanced-lineup" aria-live="polite">
        {events.map((event) => (
          <article key={event.title}>
            <div className="lineup-index">
              {String(weeklyEvents.indexOf(event) + 1).padStart(2, "0")}
            </div>
            <div className="lineup-label">
              <span>{event.accent}</span>
              <b>{event.label}</b>
            </div>
            <h3>{event.title}</h3>
            <p>{event.copy}</p>
            <small>{event.time}</small>
            <div className="lineup-actions">
              <button
                type="button"
                onClick={() => {
                  downloadReminder(event);
                  setSaved(event.title);
                }}
              >
                {saved === event.title ? "Reminder added ✓" : "Add planning reminder"}
              </button>
              <a href="tel:+17279106118">Confirm by phone</a>
            </div>
          </article>
        ))}
      </div>
      <p className="event-reminder-note">
        Calendar holds are planning reminders, not reservations. Performance
        details can change; call before traveling for a specific act.
      </p>
    </>
  );
}
