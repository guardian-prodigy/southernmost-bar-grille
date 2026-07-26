import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <div className="not-found-sun" aria-hidden="true" />
      <div className="shell not-found-copy">
        <p className="eyebrow light">404 · Off the map</p>
        <h1>
          This road doesn&apos;t lead
          <br />
          to <em>Southernmost.</em>
        </h1>
        <p>
          The page may have moved, but the menu, live music and cold drinks are
          still right where you left them.
        </p>
        <div className="button-row">
          <Link className="button sun" href="/">
            Return home
          </Link>
          <Link className="button glass" href="/menu">
            Browse the menu
          </Link>
        </div>
      </div>
    </main>
  );
}
