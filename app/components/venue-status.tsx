"use client";

import { useEffect, useState } from "react";

type VenueState = {
  open: boolean;
  label: string;
  detail: string;
};

const dayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function readWestPalmTime(): VenueState {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const today = dayIndex[weekday] ?? 1;
  const now = hour * 60 + minute;
  const previousDay = (today + 6) % 7;
  const lateNightDay = previousDay === 0 || previousDay === 5 || previousDay === 6;

  if (now < 120 && lateNightDay) {
    return {
      open: true,
      label: "Open now",
      detail: `Kitchen & bar until 2 AM`,
    };
  }

  const closesLate = today === 0 || today === 5 || today === 6;
  const close = closesLate ? 24 * 60 : 23 * 60;
  const open = now >= 11 * 60 && now < close;

  if (open) {
    const happyHour = now >= 17 * 60 && now < 19 * 60;
    return {
      open: true,
      label: happyHour ? "Happy hour now" : "Open now",
      detail: happyHour
        ? "Daily specials until 7 PM"
        : `Serving until ${closesLate ? "2 AM" : "11 PM"}`,
    };
  }

  return {
    open: false,
    label: "Opens at 11 AM",
    detail: "Seven days a week",
  };
}

export function VenueStatus({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<VenueState>({
    open: false,
    label: "Open daily",
    detail: "11 AM until late",
  });

  useEffect(() => {
    const kickoff = window.setTimeout(() => setStatus(readWestPalmTime()), 0);
    const timer = window.setInterval(() => setStatus(readWestPalmTime()), 60_000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <span className={`venue-status ${status.open ? "is-open" : ""} ${compact ? "is-compact" : ""}`}>
      <i aria-hidden="true" />
      <span>
        <b>{status.label}</b>
        {!compact && <small>{status.detail}</small>}
      </span>
    </span>
  );
}
