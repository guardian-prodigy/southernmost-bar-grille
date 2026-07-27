"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { menuCategories } from "../menu-data";
import type { MenuItem } from "../menu-data";
import { BookAtmosphere } from "./book-atmosphere";

type InteractiveMenuBookProps = {
  favorites: string[];
  onAddItem: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
  onToggleFavorite: (item: MenuItem) => void;
};

type FlipEngine = {
  flip: (page: number, corner?: "top" | "bottom") => void;
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
  getCurrentPageIndex: () => number;
  getOrientation: () => "portrait" | "landscape";
};

type FlipBookHandle = {
  pageFlip: () => FlipEngine | undefined;
};

type FlipEvent = {
  data: number | "portrait" | "landscape" | {
    page?: number;
    mode?: "portrait" | "landscape";
  };
};

type BookPageProps = {
  children: React.ReactNode;
  className?: string;
  density?: "hard" | "soft";
  label: string;
};

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(
  ({ children, className = "", density = "soft", label }, ref) => (
    <section
      className={`menu-book-page ${className}`}
      data-density={density}
      aria-label={label}
      ref={ref}
    >
      {children}
    </section>
  ),
);

BookPage.displayName = "BookPage";

function categoryFromPage(page: number) {
  if (page <= 0) return 0;
  return Math.min(
    menuCategories.length - 1,
    Math.max(0, Math.floor((page - 1) / 2)),
  );
}

export function InteractiveMenuBook({
  favorites,
  onAddItem,
  onSelectItem,
  onToggleFavorite,
}: InteractiveMenuBookProps) {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const chapterRailRef = useRef<HTMLElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orientation, setOrientation] = useState<
    "portrait" | "landscape"
  >("landscape");
  const [flipState, setFlipState] = useState("read");
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const activeChapter = categoryFromPage(currentPage);
  const activeCategory = menuCategories[activeChapter];
  const finalMenuPage = menuCategories.length * 2;

  const flipToChapter = useCallback((index: number) => {
    const page = 1 + index * 2;
    bookRef.current?.pageFlip()?.flip(page, "top");
  }, []);

  const flipPrevious = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev("top");
  }, []);

  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext("bottom");
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && currentPage > 1) {
        event.preventDefault();
        flipPrevious();
      }

      if (event.key === "ArrowRight" && currentPage < finalMenuPage) {
        event.preventDefault();
        flipNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, finalMenuPage, flipNext, flipPrevious]);

  useEffect(() => {
    const rail = chapterRailRef.current;
    const active = rail?.querySelector<HTMLElement>("[aria-current='page']");
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeChapter]);

  const pages = useMemo(
    () => [
      <BookPage
        className="menu-book-cover"
        density="hard"
        key="front-cover"
        label="Southernmost menu cover"
      >
        <div className="menu-book-cover-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/southernmost-logo-plate.webp"
            alt="Southernmost Bar & Grille"
          />
          <p>Coastal kitchen · bar · island vibes</p>
          <button type="button" onClick={flipNext}>
            Open the menu
          </button>
          <small>Drag the corner to begin</small>
        </div>
      </BookPage>,
      ...menuCategories.flatMap((group, categoryIndex) => {
        const chapterNumber = String(categoryIndex + 1).padStart(2, "0");
        const isDense = group.items.length > 7;
        const isFeature = group.items.length === 1;

        return [
          <BookPage
            className="menu-book-chapter-page"
            key={`${group.id}-chapter`}
            label={`${group.name} chapter introduction`}
          >
            <div className="menu-book-chapter-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={group.image} alt="" />
            </div>
            <div className="menu-book-chapter-shade" aria-hidden="true" />
            <div className="menu-book-chapter-copy">
              <span>Chapter {chapterNumber}</span>
              <h3>{group.name}</h3>
              <p>{group.subtitle}</p>
              <div>
                <b>{group.items.length}</b>
                <small>{group.items.length === 1 ? "selection" : "selections"}</small>
              </div>
            </div>
            <p className="menu-book-page-number">{categoryIndex * 2 + 1}</p>
          </BookPage>,
          <BookPage
            className={`menu-book-items-page ${
              isDense ? "is-dense" : ""
            } ${isFeature ? "is-feature" : ""}`}
            key={`${group.id}-items`}
            label={`${group.name} menu items`}
          >
            <header className="menu-book-paper-header">
              <div>
                <span>Southernmost · Chapter {chapterNumber}</span>
                <h3>{group.name}</h3>
              </div>
              <b>{String(categoryIndex + 1).padStart(2, "0")}</b>
            </header>

            <div className="menu-book-item-list">
              {group.items.map((item) => (
                <article className="menu-book-item" key={item.id}>
                  <button
                    className="menu-book-item-copy"
                    type="button"
                    onClick={() => onSelectItem(item)}
                    aria-label={`View details for ${item.name}`}
                  >
                    <strong>{item.name}</strong>
                    {item.badge && <small>{item.badge}</small>}
                    <p>{item.description}</p>
                  </button>
                  <div className="menu-book-item-actions">
                    <strong>${item.price.toFixed(2)}</strong>
                    <button
                      className={`menu-book-save ${
                        favorites.includes(item.id) ? "is-saved" : ""
                      }`}
                      type="button"
                      aria-label={
                        favorites.includes(item.id)
                          ? `Remove ${item.name} from saved dishes`
                          : `Save ${item.name}`
                      }
                      onClick={() => onToggleFavorite(item)}
                    >
                      {favorites.includes(item.id) ? "♥" : "♡"}
                    </button>
                    <button
                      className="menu-book-add"
                      type="button"
                      onClick={() => onAddItem(item)}
                    >
                      {item.alcoholic ? "Dine-in · 21+" : "Add"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <footer className="menu-book-paper-footer">
              <span>Tap a dish for details</span>
              <span>Please tell us about allergies</span>
            </footer>
            <p className="menu-book-page-number">{categoryIndex * 2 + 2}</p>
          </BookPage>,
        ];
      }),
      <BookPage
        className="menu-book-cover menu-book-back-cover"
        density="hard"
        key="back-cover"
        label="Southernmost menu back cover"
      >
        <div className="menu-book-cover-frame">
          <span>Stay awhile.</span>
          <h3>Good food. Cold drinks. Island nights.</h3>
          <a href="tel:+17279106118">+1 (727) 910-6118</a>
          <button type="button" onClick={() => flipToChapter(0)}>
            Return to the beginning
          </button>
        </div>
      </BookPage>,
    ],
    [
      favorites,
      flipNext,
      flipToChapter,
      onAddItem,
      onSelectItem,
      onToggleFavorite,
    ],
  );

  return (
    <div
      className={`menu-book-experience is-${orientation} ${
        flipState === "read" ? "" : "is-turning"
      }`}
    >
      <BookAtmosphere activeChapter={activeChapter} />

      <nav
        className="menu-book-chapter-rail"
        aria-label="Menu chapters"
        ref={chapterRailRef}
      >
        {menuCategories.map((group, index) => (
          <button
            className={index === activeChapter ? "active" : ""}
            type="button"
            key={group.id}
            onClick={() => flipToChapter(index)}
            aria-current={index === activeChapter ? "page" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {group.name}
          </button>
        ))}
      </nav>

      <div className="menu-book-workspace">
        <div className="menu-book-corner menu-book-corner-left" aria-hidden="true">
          <span>‹</span>
        </div>
        <div className="menu-book-corner menu-book-corner-right" aria-hidden="true">
          <span>›</span>
        </div>

        <HTMLFlipBook
          ref={bookRef}
          className="menu-flip-book"
          style={{}}
          width={520}
          height={720}
          size="stretch"
          minWidth={280}
          maxWidth={540}
          minHeight={388}
          maxHeight={748}
          startPage={1}
          drawShadow
          flippingTime={reducedMotion ? 120 : 920}
          usePortrait
          startZIndex={10}
          autoSize
          maxShadowOpacity={0.72}
          showCover
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={22}
          showPageCorners={!reducedMotion}
          disableFlipByClick
          renderOnlyPageLengthChange={false}
          onFlip={(event: FlipEvent) => {
            if (typeof event.data === "number") setCurrentPage(event.data);
          }}
          onChangeOrientation={(event: FlipEvent) => {
            if (event.data === "portrait" || event.data === "landscape") {
              setOrientation(event.data);
            }
          }}
          onChangeState={(event: FlipEvent) => {
            if (typeof event.data === "string") setFlipState(event.data);
          }}
          onInit={(event: FlipEvent) => {
            if (
              typeof event.data === "object" &&
              event.data !== null &&
              "mode" in event.data &&
              event.data.mode
            ) {
              setOrientation(event.data.mode);
            }
          }}
        >
          {pages}
        </HTMLFlipBook>
      </div>

      <div className="menu-book-controls">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={flipPrevious}
          aria-label="Turn to the previous menu page"
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>
        <p aria-live="polite">
          <span>
            Chapter {activeChapter + 1} of {menuCategories.length}
          </span>
          <strong>{activeCategory.name}</strong>
          <small>
            {orientation === "portrait"
              ? "Swipe the page left or right"
              : "Grab a page corner and drag"}
          </small>
        </p>
        <button
          type="button"
          disabled={currentPage >= finalMenuPage}
          onClick={flipNext}
          aria-label="Turn to the next menu page"
        >
          Next
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
