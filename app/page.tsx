import Link from "next/link";

const signatures = [
  {
    name: "Jerk Lamb Chops",
    description:
      "Caribbean jerk, guava rum glaze, coconut rice, vegetables and sweet plantains.",
    price: "$34",
    image: "/assets/lamb.webp",
    note: "Chef's signature",
    className: "home-v2-signature-primary",
  },
  {
    name: "Blackened Mahi",
    description:
      "Fresh Florida-style mahi with coconut rice and seasonal vegetables.",
    price: "$24",
    image: "/assets/mahi.webp",
    note: "Fresh catch",
    className: "",
  },
  {
    name: "Southernmost Wings",
    description:
      "Crisp wings tossed in one of twelve island-inspired house flavors.",
    price: "From $15",
    image: "/assets/wings.webp",
    note: "House favorite",
    className: "",
  },
  {
    name: "Southernmost Sunset",
    description:
      "Rum, pineapple, orange and a slow fade into island time.",
    price: "$12",
    image: "/assets/cocktails.webp",
    note: "Signature cocktail",
    className: "",
  },
];

const events = [
  {
    day: "Friday",
    title: "Live Music Fridays",
    copy: "Local artists, coastal plates and an easy start to the weekend.",
    note: "Evening",
  },
  {
    day: "Saturday",
    title: "Southernmost Saturdays",
    copy: "Live entertainment, tropical cocktails and late-night energy.",
    note: "Open until 2 AM",
  },
  {
    day: "Sunday",
    title: "Acoustic Brunch",
    copy: "A laid-back Sunday session with island-inspired brunch energy.",
    note: "Brunch",
  },
];

export default function Home() {
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Southernmost Bar & Grille",
    description:
      "Coastal food, handcrafted cocktails, billiards and live music in West Palm Beach.",
    telephone: "+17279106118",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4449 Okeechobee Blvd",
      addressLocality: "West Palm Beach",
      addressRegion: "FL",
      postalCode: "33417",
      addressCountry: "US",
    },
    servesCuisine: ["Coastal", "Caribbean", "American", "Seafood"],
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "11:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "02:00",
      },
    ],
  };

  return (
    <main id="main-content" className="home-v2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />

      <section className="home-v2-hero" aria-labelledby="home-v2-title">
        <div className="home-v2-hero-image" aria-hidden="true" />
        <div className="home-v2-hero-overlay" aria-hidden="true" />
        <div className="shell home-v2-hero-inner">
          <div className="home-v2-hero-copy">
            <p className="home-v2-kicker">Southernmost · West Palm Beach</p>
            <h1 id="home-v2-title">
              Coastal plates.
              <br />
              Cold drinks.
              <br />
              <em>Island time.</em>
            </h1>
            <p>
              Fresh seafood, bold Caribbean flavor, handcrafted cocktails and
              live energy—seven days a week.
            </p>
            <div className="home-v2-actions">
              <Link className="home-v2-primary-action" href="/menu">
                Explore the menu <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-v2-secondary-action" href="/visit">
                Plan your visit
              </Link>
            </div>
          </div>
          <p className="home-v2-hero-location">
            <span>4449 Okeechobee Blvd</span>
            <span>West Palm Beach, Florida</span>
          </p>
        </div>
        <div className="home-v2-pulse">
          <div className="shell home-v2-pulse-grid">
            <p>
              <span>Today</span>
              Open from 11 AM
            </p>
            <p>
              <span>Daily</span>
              Happy hour · 5–7 PM
            </p>
            <p>
              <span>Weekends</span>
              Live music &amp; late nights
            </p>
            <a href="tel:+17279106118">
              <span>Contact</span>
              +1 (727) 910-6118
            </a>
          </div>
        </div>
      </section>

      <section className="home-v2-intro" aria-labelledby="home-v2-intro-title">
        <div className="shell home-v2-intro-grid">
          <div className="home-v2-intro-heading">
            <p className="home-v2-kicker">A neighborhood escape</p>
            <h2 id="home-v2-intro-title">
              The neighborhood bar took a trip <em>south.</em>
            </h2>
          </div>
          <div className="home-v2-intro-copy">
            <p className="home-v2-intro-lead">
              Southernmost brings the ease of the Florida Keys to West Palm:
              generous plates, a serious bar and a room built for a good time.
            </p>
            <p>
              Come for lunch, date night, the game or a quick drink. Stay for
              live music, billiards and one more story with the people at your
              table.
            </p>
          </div>
        </div>
        <div className="shell home-v2-pillars">
          <article>
            <span>01</span>
            <h3>Coastal kitchen</h3>
            <p>
              Seafood, premium steaks, island signatures and shareable plates.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Proper tropical bar</h3>
            <p>
              Handcrafted signatures, frozen favorites and plenty of cold beer.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Live after dark</h3>
            <p>
              Weekend music, billiards, watch parties and late-night energy.
            </p>
          </article>
        </div>
      </section>

      <section className="home-v2-signatures" aria-labelledby="signature-title">
        <div className="shell">
          <div className="home-v2-section-heading">
            <div>
              <p className="home-v2-kicker">From the kitchen &amp; bar</p>
              <h2 id="signature-title">
                The Southernmost <em>signatures.</em>
              </h2>
            </div>
            <Link href="/menu">
              View the full menu <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-v2-signature-grid">
            {signatures.map((item) => (
              <Link
                className={`home-v2-signature-card ${item.className}`}
                href="/menu"
                key={item.name}
                aria-label={`View ${item.name} on the menu`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} />
                <span className="home-v2-signature-shade" aria-hidden="true" />
                <span className="home-v2-signature-note">{item.note}</span>
                <span className="home-v2-signature-copy">
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  <b>{item.price}</b>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-v2-atmosphere" aria-labelledby="atmosphere-title">
        <div className="home-v2-atmosphere-image" aria-hidden="true" />
        <div className="home-v2-atmosphere-overlay" aria-hidden="true" />
        <div className="shell home-v2-atmosphere-inner">
          <p className="home-v2-kicker">Stay awhile</p>
          <h2 id="atmosphere-title">
            Polished enough for date night.
            <br />
            Relaxed enough for <em>one more round.</em>
          </h2>
          <p>
            Lunch, dinner, live music and easy South Florida nights—under one
            roof.
          </p>
          <Link className="home-v2-secondary-action" href="/visit">
            See the space
          </Link>
        </div>
      </section>

      <section className="home-v2-week" aria-labelledby="week-title">
        <div className="shell home-v2-week-grid">
          <div className="home-v2-week-heading">
            <p className="home-v2-kicker">This week</p>
            <h2 id="week-title">
              Dinner is only the <em>beginning.</em>
            </h2>
            <p>
              From acoustic brunch to Saturday-night energy, there is always a
              reason to stay.
            </p>
            <Link href="/events">
              See all events <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-v2-event-list">
            {events.map((event, index) => (
              <Link href="/events" key={event.day}>
                <span className="home-v2-event-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="home-v2-event-copy">
                  <small>{event.day}</small>
                  <strong>{event.title}</strong>
                  <p>{event.copy}</p>
                </span>
                <span className="home-v2-event-note">
                  {event.note} <b aria-hidden="true">↗</b>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-v2-visit" aria-labelledby="visit-title">
        <div className="shell home-v2-visit-grid">
          <div>
            <p className="home-v2-kicker">Find your island time</p>
            <h2 id="visit-title">
              Meet us in <em>West Palm.</em>
            </h2>
          </div>
          <div className="home-v2-address">
            <p>4449 Okeechobee Blvd</p>
            <p>West Palm Beach, FL 33417</p>
            <span>Okeechobee at Military Trail</span>
          </div>
          <div className="home-v2-visit-actions">
            <a
              className="home-v2-primary-action"
              href="https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417"
              target="_blank"
              rel="noreferrer"
            >
              Get directions <span aria-hidden="true">↗</span>
            </a>
            <a className="home-v2-phone" href="tel:+17279106118">
              +1 (727) 910-6118
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
