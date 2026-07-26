import type { Metadata } from "next";
import Link from "next/link";
import { EventExplorer } from "../components/event-explorer";

export const metadata: Metadata = {
  title: "Live Music & Events",
  description:
    "Live music, acoustic brunch, billiards and watch-party energy at Southernmost Bar & Grille.",
};

export default function EventsPage() {
  return (
    <main id="main-content">
      <section className="page-hero events-page-hero">
        <div className="page-hero-image" aria-hidden="true" />
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow light">Live at Southernmost</p>
            <h1>
              Dinner is only{" "}
              <br />
              <em>the opening act.</em>
            </h1>
            <p>
              Live music, billiards, watch parties and a weekly rhythm that
              turns an ordinary night into the one everyone remembers.
            </p>
          </div>
          <aside>
            <span>This weekend</span>
            <strong>Live Friday & Saturday</strong>
            <p>
              Artist details and special event times are announced as they are
              confirmed.
            </p>
            <a className="text-link light-link" href="tel:+17279106118">
              Call for tonight&apos;s lineup <span aria-hidden="true">→</span>
            </a>
          </aside>
        </div>
      </section>

      <section className="section lineup-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The weekly rhythm</p>
              <h2 className="section-title">
                Always a reason
                <br />
                to <em>stay awhile.</em>
              </h2>
            </div>
            <p className="section-side-copy">
              Schedules may change for holidays and special events. Call ahead
              when you are planning around a specific performance.
            </p>
          </div>
          <EventExplorer />
        </div>
      </section>

      <section className="section event-feature-section">
        <div className="shell event-feature-grid">
          <article className="billiards-card">
            <div className="billiards-visual" aria-hidden="true">
              <div className="pool-ball eight">8</div>
              <div className="pool-ball six">6</div>
              <div className="pool-ball nine">9</div>
              <span className="cue-line" />
            </div>
            <div className="event-feature-copy">
              <p className="eyebrow light">Rack & relax</p>
              <h2>Billiards, every night.</h2>
              <p>
                Competition-grade tables, cold cocktails and room for casual
                games, leagues and groups.
              </p>
              <Link className="button cream" href="/visit">
                Plan your night
              </Link>
            </div>
          </article>
          <article className="watch-card">
            <p className="eyebrow">Game day</p>
            <h2>Big screens. Big plays. Better snacks.</h2>
            <p>
              Catch major matchups with shareable plates, wings and a bar
              stocked for the whole game.
            </p>
            <a className="text-link" href="tel:+17279106118">
              Ask about the next watch party <span aria-hidden="true">→</span>
            </a>
          </article>
        </div>
      </section>

      <section className="section event-cta">
        <div className="shell event-cta-inner">
          <div>
            <p className="eyebrow light">Make it yours</p>
            <h2>
              Planning a birthday, team night or private celebration?
            </h2>
          </div>
          <Link className="button sun" href="/private-events">
            Explore private events
          </Link>
        </div>
      </section>
    </main>
  );
}
