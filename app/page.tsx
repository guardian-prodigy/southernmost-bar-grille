import Link from "next/link";
import { featuredMenuItems, menuCategories } from "./menu-data";

const guestMoments = [
  {
    number: "01",
    title: "Billiards lounge",
    copy: "Settle into a game after dinner or make the tables the center of the night. The lounge is open nightly.",
    link: "/visit",
    label: "Explore the space",
  },
  {
    number: "02",
    title: "Coastal kitchen",
    copy: "Florida seafood, Caribbean heat, premium steaks and generous shareables—familiar food with an island point of view.",
    link: "/menu",
    label: "Read the full menu",
  },
  {
    number: "03",
    title: "Live under the stars",
    copy: "Friday and Saturday nights bring live music, tropical drinks and the kind of energy that keeps the table together.",
    link: "/events",
    label: "See what’s on",
  },
];

const weeklyRhythm = [
  {
    days: "Every day",
    title: "Golden hour",
    time: "5–7 PM",
    copy: "Rotating drink and food specials as the workday gives way to island time.",
  },
  {
    days: "Friday",
    title: "Live music Friday",
    time: "Evening",
    copy: "Ease into the weekend with local sound, coastal plates and a full bar.",
  },
  {
    days: "Saturday",
    title: "Southernmost Saturday",
    time: "Late night",
    copy: "Live entertainment, billiards and a room built to stay lively after dinner.",
  },
];

const faqs = [
  {
    question: "Do you welcome walk-ins?",
    answer:
      "Yes. Walk-ins are welcome. For current seating information or a larger group, call +1 (727) 910-6118 before you head over.",
  },
  {
    question: "Can I order food for pickup?",
    answer:
      "Yes. Build a pickup order on this site, review every item, then submit it to the restaurant. Alcohol is available only to guests dining in.",
  },
  {
    question: "Is Southernmost good for groups?",
    answer:
      "Absolutely. The dining room, bar and billiards lounge work for casual groups, and the private-event planner can help organize a larger occasion.",
  },
  {
    question: "What if someone in my party has an allergy?",
    answer:
      "Please speak directly with a team member before ordering. The kitchen handles common allergens, and online descriptions do not list every ingredient.",
  },
];

export default function Home() {
  const starterChapter = menuCategories.find((group) => group.id === "starters");

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
    <main id="main-content" className="premier-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />

      <section className="premier-hero" aria-labelledby="premier-hero-title">
        <div className="premier-hero-media" aria-hidden="true" />
        <div className="premier-hero-wash" aria-hidden="true" />
        <div className="premier-hero-palm premier-hero-palm-left" aria-hidden="true" />
        <div className="premier-hero-palm premier-hero-palm-right" aria-hidden="true" />
        <div className="shell premier-hero-inner">
          <div className="premier-hero-copy">
            <p className="premier-eyebrow">West Palm Beach · Florida</p>
            <h1 id="premier-hero-title">
              Welcome to the
              <br />
              <em>end of the road.</em>
            </h1>
            <p className="premier-hero-lead">
              Coastal plates, a proper tropical bar, billiards and live music—one
              neighborhood escape with the soul of the Keys.
            </p>
            <div className="premier-actions">
              <Link className="premier-button premier-button-sun" href="/menu">
                Explore the menu <span aria-hidden="true">↗</span>
              </Link>
              <Link className="premier-text-link premier-text-link-light" href="/order">
                Build a pickup order <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="premier-hero-aside">
            <p>Tonight at Southernmost</p>
            <div>
              <span>Happy hour</span>
              <strong>5–7 PM daily</strong>
            </div>
            <div>
              <span>After dinner</span>
              <strong>Billiards nightly</strong>
            </div>
            <a href="tel:+17279106118">Call for a table</a>
          </div>
        </div>
        <a className="premier-hero-scroll" href="#arrival">
          <span>Discover Southernmost</span>
          <i aria-hidden="true" />
        </a>
      </section>

      <section className="premier-compass" aria-label="Southernmost highlights">
        <div className="shell premier-compass-grid">
          <p>
            <span>Find us</span>
            <strong>4449 Okeechobee Blvd</strong>
          </p>
          <p>
            <span>Kitchen</span>
            <strong>Lunch · dinner · late night</strong>
          </p>
          <p>
            <span>Weekends</span>
            <strong>Live music Friday &amp; Saturday</strong>
          </p>
          <a href="tel:+17279106118">
            <span>Talk to us</span>
            <strong>+1 (727) 910-6118</strong>
          </a>
        </div>
      </section>

      <section
        className="premier-arrival"
        id="arrival"
        aria-labelledby="premier-arrival-title"
      >
        <div className="shell premier-arrival-grid">
          <div className="premier-arrival-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/interior.webp" alt="The warmly lit Southernmost dining room and bar" />
            <span>West Palm Beach, Florida</span>
          </div>
          <div className="premier-arrival-copy">
            <p className="premier-eyebrow">Through the mahogany doors</p>
            <h2 id="premier-arrival-title">
              Leave the traffic.
              <br />
              <em>Find the tropics.</em>
            </h2>
            <p className="premier-arrival-lead">
              The neighborhood bar took a trip south. Southernmost is the
              easygoing Keys escape you wish were down the street—except this
              one is.
            </p>
            <p>
              Step inside for rich wood, warm light, serious cocktails and a
              kitchen that moves from shareable bites to fresh seafood and bold
              Caribbean signatures. Come as you are. Stay as long as the night
              feels good.
            </p>
            <div className="premier-arrival-links">
              <Link className="premier-text-link" href="/visit">
                Plan your visit <span aria-hidden="true">→</span>
              </Link>
              <a
                className="premier-text-link"
                href="https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417"
                target="_blank"
                rel="noreferrer"
              >
                Get directions <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="premier-do-most" aria-labelledby="premier-do-most-title">
        <div className="shell">
          <div className="premier-editorial-heading">
            <p className="premier-eyebrow">Not just another bar &amp; grille</p>
            <h2 id="premier-do-most-title">
              We do the most
              <br />
              <em>for our guests.</em>
            </h2>
            <p>
              Three reasons a quick dinner has a habit of becoming the whole
              evening.
            </p>
          </div>
          <div className="premier-moments">
            {guestMoments.map((moment) => (
              <article key={moment.number}>
                <span>{moment.number}</span>
                <h3>{moment.title}</h3>
                <p>{moment.copy}</p>
                <Link className="premier-text-link premier-text-link-light" href={moment.link}>
                  {moment.label} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="premier-menu" aria-labelledby="premier-menu-title">
        <div className="shell">
          <div className="premier-section-heading">
            <div>
              <p className="premier-eyebrow">From the coastal kitchen</p>
              <h2 id="premier-menu-title">
                Florida comfort.
                <br />
                <em>Southernmost flavor.</em>
              </h2>
            </div>
            <div>
              <p>
                Start with conch fritters. Stay for the jerk lamb chops.
                Somewhere in between, order enough for the table.
              </p>
              <Link className="premier-text-link" href="/menu">
                Open the complete menu <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="premier-featured-grid">
            {featuredMenuItems.slice(0, 4).map((item, index) => (
              <Link
                className={`premier-featured-card premier-featured-card-${index + 1}`}
                href="/menu"
                key={item.id}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} />
                <span className="premier-card-shade" aria-hidden="true" />
                <span className="premier-card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="premier-card-copy">
                  {item.badge && <small>{item.badge}</small>}
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                  <b>${item.price.toFixed(2)}</b>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="premier-starters" aria-labelledby="premier-starters-title">
        <div className="premier-starters-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/seafood.webp" alt="A colorful Southernmost coastal seafood plate" />
          <p>
            <span>Made for the middle</span>
            Pass the plate. Order another.
          </p>
        </div>
        <div className="premier-starters-menu">
          <p className="premier-eyebrow">Begin here</p>
          <h2 id="premier-starters-title">Shareables from the island.</h2>
          <div className="premier-starter-list">
            {starterChapter?.items.slice(0, 5).map((item) => (
              <div key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
                <b>${item.price.toFixed(2)}</b>
              </div>
            ))}
          </div>
          <Link className="premier-button premier-button-ink" href="/menu">
            Browse all {menuCategories.length} menu chapters
          </Link>
        </div>
      </section>

      <section className="premier-golden" aria-labelledby="premier-golden-title">
        <div className="premier-golden-image" aria-hidden="true" />
        <div className="premier-golden-wash" aria-hidden="true" />
        <div className="shell premier-golden-inner">
          <p className="premier-eyebrow">Every day · 5–7 PM</p>
          <h2 id="premier-golden-title">
            Where every hour
            <br />
            feels like <em>golden hour.</em>
          </h2>
          <p>
            Pull up to the bar for rotating food and drink specials, tropical
            signatures and a room that knows how to exhale.
          </p>
          <div className="premier-actions">
            <Link className="premier-button premier-button-sun" href="/menu">
              See cocktails &amp; bites
            </Link>
            <a className="premier-text-link premier-text-link-light" href="tel:+17279106118">
              Call the bar <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="premier-after-dark" aria-labelledby="premier-after-dark-title">
        <div className="shell premier-after-dark-grid">
          <div className="premier-after-dark-copy">
            <p className="premier-eyebrow">After dark</p>
            <h2 id="premier-after-dark-title">
              Dinner is only
              <br />
              <em>the first chapter.</em>
            </h2>
            <p>
              The lights warm up, the music gets louder and the billiards
              lounge finds its rhythm. Southernmost is designed for the part of
              the night nobody wants to rush.
            </p>
            <Link className="premier-text-link premier-text-link-light" href="/events">
              Explore live music &amp; events <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="premier-after-dark-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/music.webp" alt="Live music under warm tropical lights" />
            <span>
              <small>Friday &amp; Saturday</small>
              Live under the stars
            </span>
          </div>
        </div>
      </section>

      <section className="premier-week" aria-labelledby="premier-week-title">
        <div className="shell">
          <div className="premier-section-heading premier-section-heading-compact">
            <div>
              <p className="premier-eyebrow">The weekly rhythm</p>
              <h2 id="premier-week-title">
                Something worth
                <br />
                <em>staying out for.</em>
              </h2>
            </div>
            <Link className="premier-text-link" href="/events">
              Visit the event guide <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="premier-week-list">
            {weeklyRhythm.map((event, index) => (
              <article key={event.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{event.days}</p>
                <h3>{event.title}</h3>
                <p>{event.copy}</p>
                <strong>{event.time}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="premier-gallery" aria-label="A glimpse inside Southernmost">
        <div className="premier-gallery-main">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/hero.webp" alt="Southernmost's tropical bar atmosphere" />
          <span>Good nights begin here.</span>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/cocktails.webp" alt="Colorful Southernmost tropical cocktails" />
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/wings.webp" alt="Southernmost's crisp house wings" />
        </div>
        <div className="premier-gallery-word">
          <p>Eat.</p>
          <p>Drink.</p>
          <p>Play.</p>
          <Link href="/visit">Plan the night →</Link>
        </div>
      </section>

      <section className="premier-gather" aria-labelledby="premier-gather-title">
        <div className="shell premier-gather-grid">
          <div>
            <p className="premier-eyebrow">Host your event</p>
            <h2 id="premier-gather-title">
              Bring the people.
              <br />
              <em>We’ll bring the atmosphere.</em>
            </h2>
          </div>
          <div>
            <p>
              Birthdays, team nights, celebrations and casual private
              gatherings belong somewhere with real personality. Start with
              the group size, timing and food style; the planner will turn it
              into a clear request.
            </p>
            <div className="premier-gather-tags" aria-label="Private event ideas">
              <span>Birthdays</span>
              <span>Company nights</span>
              <span>Celebrations</span>
              <span>Group dining</span>
            </div>
            <Link className="premier-button premier-button-sun" href="/private-events">
              Plan a private event
            </Link>
          </div>
        </div>
      </section>

      <section className="premier-faq" aria-labelledby="premier-faq-title">
        <div className="shell premier-faq-grid">
          <div>
            <p className="premier-eyebrow">Good to know</p>
            <h2 id="premier-faq-title">
              Before you
              <br />
              <em>head south.</em>
            </h2>
            <p>
              Need something more specific? The fastest route is a call to the
              restaurant.
            </p>
            <a className="premier-text-link" href="tel:+17279106118">
              +1 (727) 910-6118 <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="premier-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="premier-visit" aria-labelledby="premier-visit-title">
        <div className="premier-visit-image" aria-hidden="true" />
        <div className="premier-visit-wash" aria-hidden="true" />
        <div className="shell premier-visit-inner">
          <p className="premier-eyebrow">Your neighborhood escape</p>
          <h2 id="premier-visit-title">
            Take the long way home.
            <br />
            <em>Stop here first.</em>
          </h2>
          <div className="premier-visit-details">
            <div>
              <span>Address</span>
              <strong>
                4449 Okeechobee Blvd
                <br />
                West Palm Beach, FL 33417
              </strong>
            </div>
            <div>
              <span>Hours</span>
              <strong>
                Mon–Thu · 11 AM–11 PM
                <br />
                Fri–Sun · 11 AM–2 AM
              </strong>
            </div>
            <div>
              <span>Contact</span>
              <a href="tel:+17279106118">+1 (727) 910-6118</a>
            </div>
          </div>
          <div className="premier-actions">
            <a
              className="premier-button premier-button-sun"
              href="https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417"
              target="_blank"
              rel="noreferrer"
            >
              Get directions <span aria-hidden="true">↗</span>
            </a>
            <Link className="premier-text-link premier-text-link-light" href="/visit">
              Visit details <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
