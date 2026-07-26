"use client";

import { useEffect, useState } from "react";

const gallery = [
  {
    src: "/assets/interior.webp",
    kicker: "The room",
    title: "Built for lingering",
  },
  {
    src: "/assets/cocktails.webp",
    kicker: "The bar",
    title: "Sunset in a glass",
  },
  {
    src: "/assets/lamb.webp",
    kicker: "The signature",
    title: "Jerk Lamb Chops",
  },
  {
    src: "/assets/music.webp",
    kicker: "After dinner",
    title: "Live island energy",
  },
  {
    src: "/assets/mahi.webp",
    kicker: "Fresh catch",
    title: "Blackened Mahi",
  },
  {
    src: "/assets/key-lime.webp",
    kicker: "The finish",
    title: "Key lime, naturally",
  },
];

export function GalleryExperience() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") {
        setActive((current) =>
          current === null ? null : (current - 1 + gallery.length) % gallery.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActive((current) =>
          current === null ? null : (current + 1) % gallery.length,
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    document.body.classList.add("drawer-open");
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("drawer-open");
    };
  }, [active]);

  return (
    <section className="atmosphere-gallery">
      <div className="shell">
        <div className="gallery-heading">
          <div>
            <p className="eyebrow">Inside Southernmost</p>
            <h2>
              Come for the plate.
              <br />
              Remember <em>the feeling.</em>
            </h2>
          </div>
          <p>
            Food, drinks, music and a little tropical escape—tap any scene for
            the full view.
          </p>
        </div>
        <div className="gallery-mosaic">
          {gallery.map((item, index) => (
            <button
              type="button"
              key={item.title}
              onClick={() => setActive(index)}
              aria-label={`Open ${item.title} gallery image`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt="" loading="lazy" />
              <span>
                <small>{item.kicker}</small>
                <strong>{item.title}</strong>
              </span>
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </div>
      </div>

      <div className={`gallery-lightbox ${active !== null ? "is-open" : ""}`}>
        <button
          className="gallery-backdrop"
          type="button"
          onClick={() => setActive(null)}
          aria-label="Close gallery"
        />
        {active !== null && (
          <div className="gallery-lightbox-card" role="dialog" aria-modal="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery[active].src} alt={gallery[active].title} />
            <div>
              <span>{gallery[active].kicker}</span>
              <strong>{gallery[active].title}</strong>
              <small>{active + 1} / {gallery.length}</small>
            </div>
            <button
              className="gallery-previous"
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setActive((active - 1 + gallery.length) % gallery.length)
              }
            >
              ←
            </button>
            <button
              className="gallery-next"
              type="button"
              aria-label="Next image"
              onClick={() => setActive((active + 1) % gallery.length)}
            >
              →
            </button>
            <button
              className="gallery-close"
              type="button"
              aria-label="Close gallery"
              onClick={() => setActive(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
