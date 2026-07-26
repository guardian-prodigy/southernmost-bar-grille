import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <LegalPage eyebrow="Access for every guest" title="Accessibility" updated="July 26, 2026">
      <h2>Our commitment</h2>
      <p>
        Southernmost aims to provide a welcoming experience for every guest.
        This website supports keyboard navigation, visible focus states,
        responsive layouts, reduced-motion preferences and text alternatives
        for meaningful images.
      </p>
      <h2>Need assistance?</h2>
      <p>
        If you have difficulty using the website, need menu information in
        another format or have questions about visiting the restaurant, call
        us. We will make reasonable efforts to help.
      </p>
      <h2>Continuous improvement</h2>
      <p>
        Accessibility is an ongoing practice. Feedback about a specific page,
        control or in-person need helps us prioritize meaningful improvements.
      </p>
    </LegalPage>
  );
}
