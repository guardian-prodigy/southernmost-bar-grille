import Link from "next/link";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="legal-page">
      <header className="legal-hero">
        <div className="shell">
          <p className="eyebrow light">{eyebrow}</p>
          <h1>{title}</h1>
          <p>Last updated {updated}</p>
        </div>
      </header>
      <article className="shell legal-content">
        {children}
        <div className="legal-contact">
          <h2>Questions?</h2>
          <p>
            Call Southernmost at{" "}
            <a href="tel:+17279106118">+1 (727) 910-6118</a>.
          </p>
          <Link className="text-link" href="/visit">
            View location details <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </main>
  );
}
