"use client";

import { useState } from "react";

export function PrivateEventPlanner() {
  const [copied, setCopied] = useState(false);

  async function copyBrief(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const summary = [
      "Southernmost private event inquiry",
      `Name: ${form.get("name")}`,
      `Event: ${form.get("eventType")}`,
      `Preferred date: ${form.get("date") || "Flexible"}`,
      `Estimated guests: ${form.get("guests")}`,
      `Notes: ${form.get("notes") || "None"}`,
    ].join("\n");
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  return (
    <section className="section event-planner" id="event-planner">
      <div className="shell event-planner-grid">
        <div className="planner-copy">
          <p className="eyebrow light">Let&apos;s make a plan</p>
          <h2>Build a quick event brief.</h2>
          <p>
            Add the basics, copy the summary and call our team. We will confirm
            availability, pricing and the right setup for your group.
          </p>
          <a className="planner-phone" href="tel:+17279106118">
            <small>Call the Southernmost team</small>
            +1 (727) 910-6118
          </a>
        </div>
        <form onSubmit={copyBrief}>
          <div className="form-grid">
            <label>
              Your name
              <input name="name" required placeholder="First and last name" />
            </label>
            <label>
              Event type
              <select name="eventType" defaultValue="Birthday">
                <option>Birthday</option>
                <option>Corporate gathering</option>
                <option>Team celebration</option>
                <option>Watch party</option>
                <option>Rehearsal dinner</option>
                <option>Holiday party</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Preferred date
              <input name="date" type="date" />
            </label>
            <label>
              Estimated guests
              <input
                name="guests"
                type="number"
                min="6"
                max="300"
                defaultValue="20"
                required
              />
            </label>
            <label className="full-field">
              What should we know?
              <textarea
                name="notes"
                rows={5}
                placeholder="Timing, food preferences, celebration details…"
              />
            </label>
          </div>
          <div className="planner-actions">
            <button className="button sun" type="submit">
              {copied ? "Brief copied" : "Copy event brief"}
            </button>
            <a className="button glass" href="tel:+17279106118">
              Call now
            </a>
          </div>
          <p className="form-note">
            This planner keeps your information on your device and does not
            submit it online.
          </p>
        </form>
      </div>
    </section>
  );
}
