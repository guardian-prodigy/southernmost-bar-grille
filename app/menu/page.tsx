import type { Metadata } from "next";
import { MenuExplorer } from "../components/menu-explorer";
import { menuCategories } from "../menu-data";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore Southernmost Bar & Grille's coastal plates, island signatures, wings, burgers, tropical cocktails and desserts.",
};

export default function MenuPage() {
  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Southernmost Bar & Grille Menu",
    hasMenuSection: menuCategories.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      description: category.subtitle,
      hasMenuItem: category.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.description,
        offers: {
          "@type": "Offer",
          price: item.price.toFixed(2),
          priceCurrency: "USD",
        },
      })),
    })),
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
      <section className="menu-v2-hero" aria-labelledby="menu-v2-title">
        <div className="menu-v2-hero-image" aria-hidden="true" />
        <div className="menu-v2-hero-overlay" aria-hidden="true" />
        <div className="shell menu-v2-hero-inner">
          <p className="menu-v2-kicker">The Southernmost menu</p>
          <h1 id="menu-v2-title">
            A taste of <em>island time.</em>
          </h1>
          <p>
            Coastal plates, Caribbean signatures and cold tropical drinks,
            presented in our dining-room menu folio.
          </p>
          <div className="menu-v2-hero-meta" aria-label="Menu highlights">
            <span>Lunch &amp; dinner</span>
            <span>Served seven days</span>
            <span>Pickup available</span>
          </div>
        </div>
      </section>
      <MenuExplorer />
      <section className="menu-note">
        <div className="shell menu-note-grid">
          <div>
            <p className="eyebrow">Allergy notice</p>
            <h2>Questions about ingredients?</h2>
          </div>
          <p>
            Please speak with a team member before ordering. Our kitchen
            handles common allergens, and menu descriptions do not list every
            ingredient. Consuming raw or undercooked foods may increase your
            risk of foodborne illness.
          </p>
        </div>
      </section>
    </main>
  );
}
