import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Your information" title="Privacy Policy" updated="July 26, 2026">
      <h2>Information this website stores</h2>
      <p>
        The menu and order builder may store your current selections in your
        browser so they remain available while you move between pages. Those
        selections stay on your device unless you choose to copy or share them.
      </p>
      <h2>Information this website does not collect</h2>
      <p>
        The current website does not accept online payments, create customer
        accounts or submit event-planning details to a server. Private-event
        and order summaries are prepared locally for you to copy and use when
        calling the restaurant.
      </p>
      <h2>External services</h2>
      <p>
        Links to maps, phone services and other websites are governed by those
        providers&apos; own privacy practices. We recommend reviewing their
        policies before sharing personal information.
      </p>
    </LegalPage>
  );
}
