import type { Metadata } from "next";
import { PrivateEventPlanner } from "../components/private-event-planner";

export const metadata: Metadata = {
  title: "Private Events",
  description:
    "Plan birthdays, corporate gatherings, watch parties and celebrations at Southernmost Bar & Grille.",
};

const occasions = [
  "Birthday dinners",
  "Corporate gatherings",
  "Team celebrations",
  "Watch parties",
  "Rehearsal dinners",
  "Holiday parties",
];

export default function PrivateEventsPage() {
  return (
    <main id="main-content">
      <section className="page-hero private-page-hero">
        <div className="page-hero-image" aria-hidden="true" />
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow light">Gather at Southernmost</p>
            <h1>
              Your celebration,{" "}
              <br />
              <em>on island time.</em>
            </h1>
            <p>
              Flexible spaces, coastal menus, a full bar and a team ready to
              make your next gathering feel effortless.
            </p>
          </div>
          <aside>
            <span>Start planning</span>
            <strong>Tell us the shape of your event.</strong>
            <p>
              We will help match your guest count, timing and vision with the
              best Southernmost setup.
            </p>
            <a className="text-link light-link" href="#event-planner">
              Build your brief <span aria-hidden="true">↓</span>
            </a>
          </aside>
        </div>
      </section>

      <section className="section private-intro">
        <div className="shell private-intro-grid">
          <div>
            <p className="eyebrow">Good people. Great setting.</p>
            <h2 className="section-title">
              Gather without
              <br />
              the <em>usual.</em>
            </h2>
          </div>
          <div>
            <p className="lead-copy">
              From intimate dinners to full-room energy, Southernmost gives
              every group a built-in sense of occasion.
            </p>
            <div className="occasion-tags">
              {occasions.map((occasion) => (
                <span key={occasion}>{occasion}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="event-packages">
        <div className="shell event-package-grid">
          <article>
            <span>01</span>
            <p className="eyebrow">The long table</p>
            <h3>Group Dining</h3>
            <p>
              A relaxed, seated experience for birthdays, team meals and family
              celebrations.
            </p>
            <ul>
              <li>Flexible shared or plated menus</li>
              <li>Dedicated table area</li>
              <li>Optional beverage packages</li>
            </ul>
          </article>
          <article className="featured-package">
            <span>02</span>
            <p className="eyebrow light">The full island</p>
            <h3>Private Party</h3>
            <p>
              A higher-energy setup for celebrations that need their own space,
              soundtrack and flow.
            </p>
            <ul>
              <li>Custom food and bar plan</li>
              <li>Entertainment coordination</li>
              <li>Dedicated event point of contact</li>
            </ul>
          </article>
          <article>
            <span>03</span>
            <p className="eyebrow">Play together</p>
            <h3>Billiards Social</h3>
            <p>
              Casual competition, shareable food and cold drinks for teams and
              friend groups.
            </p>
            <ul>
              <li>Reserved billiards area</li>
              <li>Shareable food packages</li>
              <li>Flexible open-bar options</li>
            </ul>
          </article>
        </div>
      </section>

      <PrivateEventPlanner />
    </main>
  );
}
