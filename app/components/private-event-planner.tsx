"use client";

import { useMemo, useState } from "react";

type PlannerStep = 1 | 2 | 3;

const occasions = [
  "Birthday",
  "Corporate gathering",
  "Team celebration",
  "Watch party",
  "Rehearsal dinner",
  "Holiday party",
];

const formats = [
  {
    id: "Group dining",
    kicker: "The long table",
    copy: "A seated gathering centered on dinner and conversation.",
  },
  {
    id: "Private party",
    kicker: "The full island",
    copy: "A dedicated, higher-energy celebration with a custom flow.",
  },
  {
    id: "Billiards social",
    kicker: "Play together",
    copy: "Casual competition, shareable food and a relaxed group setup.",
  },
];

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

export function PrivateEventPlanner() {
  const [step, setStep] = useState<PlannerStep>(1);
  const [copied, setCopied] = useState(false);
  const [occasion, setOccasion] = useState("Birthday");
  const [format, setFormat] = useState("Group dining");
  const [date, setDate] = useState("");
  const [daypart, setDaypart] = useState("Dinner");
  const [guests, setGuests] = useState("20");
  const [foodStyle, setFoodStyle] = useState("Shared island plates");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const brief = useMemo(
    () =>
      [
        "Southernmost private event inquiry",
        `Name: ${name || "To be added"}`,
        `Occasion: ${occasion}`,
        `Preferred format: ${format}`,
        `Preferred date: ${date || "Flexible"}`,
        `Daypart: ${daypart}`,
        `Estimated guests: ${guests || "To be confirmed"}`,
        `Food direction: ${foodStyle}`,
        `Notes: ${notes || "None"}`,
        "",
        "Please confirm availability, capacity, pricing and final event details.",
      ].join("\n"),
    [date, daypart, foodStyle, format, guests, name, notes, occasion],
  );

  const minimumDate = new Date().toISOString().slice(0, 10);

  function update(action: () => void) {
    action();
    setCopied(false);
  }

  async function copyBrief() {
    await copyText(brief);
    setCopied(true);
  }

  return (
    <section className="section event-planner" id="event-planner">
      <div className="shell">
        <div className="event-folio-heading">
          <div>
            <p className="eyebrow light">Your event folio</p>
            <h2>Shape the night in three steps.</h2>
          </div>
          <p>
            Create a clear starting brief on your device, then call the team to
            confirm availability, capacity, pricing and the right setup.
          </p>
        </div>

        <div className="event-folio">
          <nav className="folio-steps" aria-label="Event-planning steps">
            {([
              [1, "Occasion"],
              [2, "Details"],
              [3, "Review"],
            ] satisfies [PlannerStep, string][]).map(([number, label]) => (
              <button
                className={step === number ? "active" : step > number ? "complete" : ""}
                type="button"
                key={number}
                onClick={() => setStep(number as PlannerStep)}
              >
                <span>{step > number ? "✓" : `0${number}`}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="folio-workspace">
            <div className="folio-form">
              {step === 1 && (
                <div className="folio-step-panel">
                  <div className="folio-panel-head">
                    <span>Step 01</span>
                    <div>
                      <h3>What are we celebrating?</h3>
                      <p>Choose an occasion and the shape that feels closest.</p>
                    </div>
                  </div>
                  <div className="occasion-picker" role="group" aria-label="Occasion">
                    {occasions.map((item) => (
                      <button
                        className={occasion === item ? "active" : ""}
                        type="button"
                        key={item}
                        onClick={() => update(() => setOccasion(item))}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="format-picker" role="radiogroup" aria-label="Event format">
                    {formats.map((item, index) => (
                      <button
                        className={format === item.id ? "active" : ""}
                        type="button"
                        role="radio"
                        aria-checked={format === item.id}
                        key={item.id}
                        onClick={() => update(() => setFormat(item.id))}
                      >
                        <span>0{index + 1}</span>
                        <small>{item.kicker}</small>
                        <strong>{item.id}</strong>
                        <p>{item.copy}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="folio-step-panel">
                  <div className="folio-panel-head">
                    <span>Step 02</span>
                    <div>
                      <h3>Set the starting details.</h3>
                      <p>Flexible is fine. These choices are a conversation starter.</p>
                    </div>
                  </div>
                  <div className="folio-fields">
                    <label>
                      Preferred date
                      <input
                        type="date"
                        min={minimumDate}
                        value={date}
                        onChange={(event) => update(() => setDate(event.target.value))}
                      />
                    </label>
                    <label>
                      Estimated guests
                      <input
                        type="number"
                        min="2"
                        inputMode="numeric"
                        value={guests}
                        onChange={(event) => update(() => setGuests(event.target.value))}
                      />
                    </label>
                  </div>
                  <fieldset className="folio-fieldset">
                    <legend>Preferred time</legend>
                    <div>
                      {["Lunch", "Happy hour", "Dinner", "Late night"].map((item) => (
                        <button
                          className={daypart === item ? "active" : ""}
                          type="button"
                          key={item}
                          onClick={() => update(() => setDaypart(item))}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="folio-select">
                    Food direction
                    <select
                      value={foodStyle}
                      onChange={(event) => update(() => setFoodStyle(event.target.value))}
                    >
                      <option>Shared island plates</option>
                      <option>Seated dinner</option>
                      <option>Bar bites & cocktails</option>
                      <option>Open to recommendations</option>
                    </select>
                  </label>
                </div>
              )}

              {step === 3 && (
                <div className="folio-step-panel">
                  <div className="folio-panel-head">
                    <span>Step 03</span>
                    <div>
                      <h3>Add a name and the finishing notes.</h3>
                      <p>Your live brief is ready to copy when you are.</p>
                    </div>
                  </div>
                  <div className="folio-fields">
                    <label>
                      Your name
                      <input
                        required
                        placeholder="First and last name"
                        value={name}
                        onChange={(event) => update(() => setName(event.target.value))}
                      />
                    </label>
                    <label>
                      Best phone
                      <input
                        type="tel"
                        placeholder="Add it when you call"
                        aria-describedby="phone-local-note"
                      />
                    </label>
                  </div>
                  <label className="folio-notes">
                    What should the team know?
                    <textarea
                      rows={6}
                      placeholder="Timing, food preferences, accessibility needs, celebration details…"
                      value={notes}
                      onChange={(event) => update(() => setNotes(event.target.value))}
                    />
                  </label>
                  <p id="phone-local-note" className="form-note">
                    Nothing is submitted online. The phone field stays only in this page.
                  </p>
                </div>
              )}

              <div className="folio-navigation">
                {step > 1 ? (
                  <button
                    className="button glass"
                    type="button"
                    onClick={() => setStep((step - 1) as PlannerStep)}
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <button
                    className="button sun"
                    type="button"
                    onClick={() => setStep((step + 1) as PlannerStep)}
                  >
                    Continue <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button className="button sun" type="button" onClick={copyBrief}>
                    {copied ? "Event brief copied ✓" : "Copy event brief"}
                  </button>
                )}
              </div>
            </div>

            <aside className="folio-preview">
              <div className="folio-preview-cover">
                <span>Southernmost · West Palm</span>
                <strong>EVENT<br />FOLIO</strong>
                <small>Created for {name || "your gathering"}</small>
              </div>
              <div className="folio-preview-page">
                <p className="eyebrow">Live brief</p>
                <h3>{occasion}</h3>
                <dl>
                  <div>
                    <dt>Format</dt>
                    <dd>{format}</dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>{date || "Flexible"} · {daypart}</dd>
                  </div>
                  <div>
                    <dt>Guests</dt>
                    <dd>{guests || "TBD"}</dd>
                  </div>
                  <div>
                    <dt>Food</dt>
                    <dd>{foodStyle}</dd>
                  </div>
                </dl>
                <p>
                  This brief is a starting direction—not an availability,
                  capacity or price confirmation.
                </p>
                <a href="tel:+17279106118">Call +1 (727) 910-6118</a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
