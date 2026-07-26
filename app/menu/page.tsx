import type { Metadata } from "next";
import Link from "next/link";
import { MenuExplorer } from "../components/menu-explorer";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore Southernmost Bar & Grille's coastal plates, island signatures, wings, burgers, tropical cocktails and desserts.",
};

export default function MenuPage() {
  return (
    <main id="main-content">
      <section className="page-hero menu-page-hero">
        <div className="page-hero-image" aria-hidden="true" />
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow light">Coastal · Caribbean · American</p>
            <h1>
              The full <em>island menu.</em>
            </h1>
            <p>
              Shareable starters, fresh seafood, signature plates, cold drinks
              and the favorites that keep West Palm coming back.
            </p>
          </div>
          <aside>
            <span>QR-ready menu</span>
            <strong>Scan. Browse. Order.</strong>
            <p>
              This page is designed for quick table access on any phone—no app
              or account required.
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
