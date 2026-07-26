import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Visit",
  description:
    "Find Southernmost Bar & Grille at 4449 Okeechobee Blvd in West Palm Beach.",
};

const directions =
  "https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417";

export default function VisitPage() {
  return (
    <main id="main-content">
      <section className="visit-hero">
        <div className="shell visit-hero-grid">
          <div className="visit-hero-copy">
            <p className="eyebrow light">Come find us</p>
            <h1>
              Meet at the corner{" "}
              <br />
              of <em>island time.</em>
            </h1>
            <p>
              Easy to find at Okeechobee and Military Trail. Much harder to
              leave once the drinks are cold and the music starts.
            </p>
            <div className="button-row">
              <a
                className="button sun"
                href={directions}
                target="_blank"
                rel="noreferrer"
              >
                Open directions
              </a>
              <a className="button glass" href="tel:+17279106118">
                Call +1 (727) 910-6118
              </a>
            </div>
          </div>
          <div className="visit-map" aria-label="Location map illustration">
            <span className="map-road road-one">Okeechobee Blvd</span>
            <span className="map-road road-two">Military Trail</span>
            <div className="map-pin">
              <b>
                <i>S</i>
              </b>
              <span>Southernmost</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section visit-details">
        <div className="shell visit-detail-grid">
          <article>
            <span>01</span>
            <p className="eyebrow">Address</p>
            <h2>4449 Okeechobee Blvd</h2>
            <p>West Palm Beach, FL 33417</p>
            <p>Okeechobee at Military Trail</p>
            <a className="text-link" href={directions} target="_blank" rel="noreferrer">
              Get directions <span aria-hidden="true">→</span>
            </a>
          </article>
          <article>
            <span>02</span>
            <p className="eyebrow">Hours</p>
            <h2>Open seven days</h2>
            <dl>
              <div>
                <dt>Monday–Thursday</dt>
                <dd>11 AM–11 PM</dd>
              </div>
              <div>
                <dt>Friday–Sunday</dt>
                <dd>11 AM–2 AM</dd>
              </div>
              <div>
                <dt>Happy hour</dt>
                <dd>Daily · 5–7 PM</dd>
              </div>
            </dl>
          </article>
          <article>
            <span>03</span>
            <p className="eyebrow">Contact</p>
            <h2>Questions before you go?</h2>
            <p>
              Call for tonight&apos;s entertainment, group seating, holiday
              hours or accessibility questions.
            </p>
            <a className="visit-phone" href="tel:+17279106118">
              +1 (727) 910-6118
            </a>
          </article>
        </div>
      </section>

      <section className="map-embed-section">
        <div className="shell map-embed-wrap">
          <iframe
            title="Map showing Southernmost Bar & Grille at 4449 Okeechobee Blvd"
            src="https://www.google.com/maps?q=4449%20Okeechobee%20Blvd%2C%20West%20Palm%20Beach%2C%20FL%2033417&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-embed-card">
            <p className="eyebrow light">Okeechobee × Military Trail</p>
            <h2>One turn from island time.</h2>
            <a
              className="button sun"
              href={directions}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <section className="section visit-final">
        <div className="shell visit-final-grid">
          <div className="visit-final-image" aria-hidden="true" />
          <div>
            <p className="eyebrow">Before you arrive</p>
            <h2>Browse first. Order when you&apos;re ready.</h2>
            <p>
              The full menu works beautifully on mobile, so everyone can find
              their favorite before the first round hits the table.
            </p>
            <div className="button-row">
              <Link className="button ink" href="/menu">
                View menu
              </Link>
              <Link className="button outline-dark" href="/events">
                See live & events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
