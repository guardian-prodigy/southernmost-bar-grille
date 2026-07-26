import type { Metadata } from "next";
import Link from "next/link";
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
      <section className="page-hero menu-page-hero">
        <div className="page-hero-image" aria-hidden="true" />
        <div className="menu-hero-sun" aria-hidden="true" />
        <div className="menu-hero-leaf menu-hero-leaf-one" aria-hidden="true" />
        <div className="menu-hero-leaf menu-hero-leaf-two" aria-hidden="true" />
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow light">An interactive island menu</p>
            <h1>
              Open a taste of <em>South Florida.</em>
            </h1>
            <p>
              Turn through coastal plates, Caribbean signatures, cold drinks
              and the favorites that keep West Palm coming back.
            </p>
          </div>
          <aside>
            <span>Not another menu grid</span>
            <strong>Turn it. Taste it. Make it yours.</strong>
            <p>
              Explore the dimensional menu book, add favorites from each page,
              or switch to the fast searchable list whenever you prefer.
            </p>
            <Link className="text-link light-link" href="/order">
              Start an order <span aria-hidden="true">→</span>
            </Link>
          </aside>
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
