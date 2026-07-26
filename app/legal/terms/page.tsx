import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Website use" title="Terms & Conditions" updated="July 26, 2026">
      <h2>Menu information</h2>
      <p>
        Menu descriptions, prices, hours and availability may change. The
        restaurant confirms current pricing, ingredients, availability and
        ordering terms before an order is accepted.
      </p>
      <h2>Order builder</h2>
      <p>
        The website&apos;s order builder is a convenience tool and does not by
        itself place, transmit or charge an order. An order is accepted only
        after it is confirmed directly by Southernmost.
      </p>
      <h2>Alcohol and age restrictions</h2>
      <p>
        Alcohol is available only to guests who meet applicable age
        requirements and present valid identification. Southernmost may refuse
        alcohol service when required by law or responsible-service practices.
      </p>
      <h2>Allergens and food safety</h2>
      <p>
        Our kitchen handles common allergens. Tell a team member about allergies
        before ordering. Consuming raw or undercooked foods may increase the
        risk of foodborne illness.
      </p>
    </LegalPage>
  );
}
