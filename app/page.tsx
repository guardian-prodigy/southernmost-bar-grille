import Link from "next/link";

const favorites = [
  {
    name: "Jerk Lamb Chops",
    description:
      "Caribbean jerk, guava rum glaze, coconut rice, vegetables and sweet plantains.",
    price: "$34",
    image: "/assets/lamb.webp",
    tag: "Chef's signature",
  },
  {
    name: "Blackened Mahi",
    description:
      "Fresh Florida-style mahi with coconut rice and seasonal grilled vegetables.",
    price: "$24",
    image: "/assets/mahi.webp",
    tag: "Fresh catch",
  },
  {
    name: "Southernmost Wings",
    description:
      "Crisp wings tossed in one of twelve island-inspired house flavors.",
    price: "From $15",
    image: "/assets/wings.webp",
    tag: "Crowd favorite",
  },
  {
    name: "Southernmost Sunset",
    description:
      "A tropical rum cocktail with pineapple, citrus and a sunset finish.",
    price: "$12",
    image: "/assets/cocktails.webp",
    tag: "Signature sip",
  },
];

const events = [
  {
    day: "FRI",
    title: "Live Music Fridays",
    copy: "Local artists, coastal plates and an easy start to the weekend.",
    note: "Evening",
  },
  {
    day: "SAT",
    title: "Southernmost Saturdays",
    copy: "Live entertainment, tropical cocktails and late-night energy.",
    note: "Open until 2 AM",
  },
  {
    day: "SUN",
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
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <section className="hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-sun" aria-hidden="true" />
        <div className="hero-palm-shadow palm-shadow-one" aria-hidden="true" />
        <div className="hero-palm-shadow palm-shadow-two" aria-hidden="true" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow light">West Palm&apos;s island room</p>
            <h1>
              Where West Palm
              <br />goes <em>island.</em>
            </h1>
            <p className="hero-lead">
              Coastal fire, handcrafted cocktails and late-night tropical
              energy—wrapped in one unforgettable neighborhood escape.
            </p>
            <div className="button-row">
              <Link className="button sun" href="/menu">
                Open the 3D menu <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button glass" href="/visit">
                Find the island
              </Link>
            </div>
            <div className="hero-proof" aria-label="Southernmost highlights">
              <span>✦ Coastal kitchen</span>
              <span>✦ Live music</span>
              <span>✦ Happy hour 5–7</span>
            </div>
          </div>

          <aside className="hero-visual" aria-label="Explore Southernmost">
            <div className="hero-book-glow" aria-hidden="true" />
            <Link className="hero-menu-book" href="/menu">
              <span className="hero-book-pages" aria-hidden="true" />
              <span className="hero-book-spine" aria-hidden="true" />
              <span className="hero-book-cover">
                <span className="hero-book-kicker">The taste of island time</span>
                <span className="hero-book-brand">Southernmost</span>
                <span className="hero-book-subbrand">
                  Coastal Kitchen · Bar · Island Vibes
                </span>
                <span className="hero-book-rule" />
                <strong>MENU</strong>
                <small>West Palm Beach · Florida</small>
              </span>
            </Link>
            <div className="hero-cocktail-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/cocktails.webp" alt="" />
              <span>Signature sip</span>
              <strong>Southernmost Sunset</strong>
            </div>
            <div className="hero-night-card">
              <span className="live-dot" />
              <div>
                <small>Tonight</small>
                <strong>Golden hour into island night.</strong>
              </div>
            </div>
            <span className="hero-seal" aria-hidden="true">
              <b>SM</b>
              <small>WEST PALM</small>
            </span>
          </aside>
        </div>
        <div className="marquee" aria-hidden="true">
          <div>
            SOUTH FLORIDA FLAVOR <i>✦</i> COLD DRINKS <i>✦</i> LIVE MUSIC{" "}
            <i>✦</i> BILLIARDS <i>✦</i> ISLAND TIME <i>✦</i> SOUTH FLORIDA
            FLAVOR <i>✦</i> COLD DRINKS <i>✦</i> LIVE MUSIC
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="shell intro-grid">
          <div className="intro-sticky">
            <p className="eyebrow">Meet Southernmost</p>
            <h2 className="section-title">
              A little farther
              <br />
              <em>from ordinary.</em>
            </h2>
          </div>
          <div className="intro-copy">
            <p className="lead-copy">
              We bring the ease of the Florida Keys to your Palm Beach
              neighborhood: bold island flavor, honest hospitality and a room
              that knows how to have a good time.
            </p>
            <p>
              Come for lunch, date night, a birthday, the game or a quick drink.
              Stay for the music, a round of billiards and one more story with
              the people at your table.
            </p>
            <div className="experience-list">
              <article>
                <span>01</span>
                <div>
                  <h3>Coastal kitchen</h3>
                  <p>
                    Seafood, premium steaks, island signatures, burgers and
                    shareable plates made for the whole table.
                  </p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Bar with a pulse</h3>
                  <p>
                    Tropical signatures, frozen favorites, premium pours and
                    plenty of cold beer.
                  </p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>Something always happening</h3>
                  <p>
                    Live music, billiards, acoustic brunch and watch-party
                    energy throughout the week.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section favorites-section" id="favorites">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Worth the trip</p>
              <h2 className="section-title">
                Meet the <em>favorites.</em>
              </h2>
            </div>
            <Link className="text-link" href="/menu">
              View the full menu <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="food-grid">
            {favorites.map((item, index) => (
              <article className="food-card" key={item.name}>
                <Link href="/menu" aria-label={`View ${item.name} on the menu`}>
                  <div className="food-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} />
                    <span>{item.tag}</span>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                  </div>
                  <div className="food-card-copy">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>
                    <strong>{item.price}</strong>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section experience-section">
        <div className="shell experience-grid">
          <article className="experience-feature image-interior">
            <div className="feature-scrim" />
            <div className="feature-copy">
              <p className="eyebrow light">Made for gathering</p>
              <h2>Lunch. Dinner. One more round.</h2>
              <p>
                A relaxed neighborhood room with enough polish for date night
                and enough energy for the whole crew.
              </p>
              <Link className="button cream" href="/visit">
                Find your table
              </Link>
            </div>
          </article>
          <div className="experience-stack">
            <article className="experience-mini happy-hour">
              <div>
                <p className="eyebrow">Daily · 5–7 PM</p>
                <h3>Golden hour tastes better here.</h3>
                <p>
                  Ease into the evening with drink specials, shareable plates
                  and that end-of-day island glow.
                </p>
              </div>
              <span className="sun-disc" aria-hidden="true" />
            </article>
            <article className="experience-mini image-music">
              <div className="feature-scrim" />
              <div className="feature-copy compact">
                <p className="eyebrow light">Live every weekend</p>
                <h3>Good music. No bad seats.</h3>
                <Link className="text-link light-link" href="/events">
                  See what&apos;s on <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section events-section">
        <div className="shell">
          <div className="section-heading light-heading">
            <div>
              <p className="eyebrow light">This week</p>
              <h2 className="section-title">
                Come for dinner.
                <br />
                Stay for <em>what&apos;s next.</em>
              </h2>
            </div>
            <Link className="text-link light-link" href="/events">
              Explore all events <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="event-list">
            {events.map((event) => (
              <article key={event.day}>
                <div className="event-day">{event.day}</div>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.copy}</p>
                </div>
                <span>{event.note}</span>
                <Link href="/events" aria-label={`Learn more about ${event.title}`}>
                  ↗
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section visit-teaser">
        <div className="shell visit-teaser-grid">
          <div>
            <p className="eyebrow">Your table is closer than you think</p>
            <h2 className="section-title">
              Meet us at the
              <br />
              corner of <em>island time.</em>
            </h2>
          </div>
          <div className="visit-address">
            <p>4449 Okeechobee Blvd</p>
            <p>West Palm Beach, FL 33417</p>
            <p className="muted">Okeechobee at Military Trail</p>
            <div className="button-row">
              <a
                className="button ink"
                href="https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417"
                target="_blank"
                rel="noreferrer"
              >
                Get directions
              </a>
              <a className="button outline-dark" href="tel:+17279106118">
                Call +1 (727) 910-6118
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
