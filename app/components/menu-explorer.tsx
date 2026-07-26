"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { menuCategories } from "../menu-data";
import type { MenuItem } from "../menu-data";
import { useOrder } from "./order-provider";
import { ThreeMenuBook } from "./three-menu-book";

const FAVORITES_KEY = "southernmost-favorites-v1";

export function MenuExplorer() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"book" | "list">("book");
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState<{
    direction: "next" | "previous";
    key: number;
  }>({ direction: "next", key: 0 });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState("");
  const touchStart = useRef<number | null>(null);
  const { addItem, openCart } = useOrder();

  const currentPage = menuCategories[pageIndex];

  const goToPage = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(menuCategories.length - 1, nextIndex));
    if (bounded === pageIndex) return;
    setTurn({
      direction: bounded > pageIndex ? "next" : "previous",
      key: turn.key + 1,
    });
    setPageIndex(bounded);
    setCategory(menuCategories[bounded].id);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(FAVORITES_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((value): value is string => typeof value === "string"));
        }
      } catch {
        window.localStorage.removeItem(FAVORITES_KEY);
      } finally {
        setFavoritesReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (favoritesReady) {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, favoritesReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (view !== "book" || detailItem) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPage(pageIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToPage(pageIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useEffect(() => {
    if (!detailItem) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailItem(null);
    };
    window.addEventListener("keydown", handleKey);
    document.body.classList.add("drawer-open");
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("drawer-open");
    };
  }, [detailItem]);

  function toggleFavorite(item: MenuItem) {
    setFavorites((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
    setToast(
      favorites.includes(item.id)
        ? `${item.name} removed from saved dishes.`
        : `${item.name} saved for later.`,
    );
  }

  function addFromMenu(item: MenuItem) {
    if (item.alcoholic) {
      setToast(`${item.name} is available for guests dining in.`);
      return;
    }
    addItem(item);
    setToast(`${item.name} added to your order.`);
  }

  const filteredCategories = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return menuCategories
      .filter(
        (group) =>
          category === "all" || category === "saved" || group.id === category,
      )
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            (category !== "saved" || favorites.includes(item.id)) &&
            (!needle ||
              item.name.toLowerCase().includes(needle) ||
              item.description.toLowerCase().includes(needle)),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [category, favorites, search]);

  const resultCount = filteredCategories.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <section className="menu-explorer">
      <div className="shell">
        <div className="menu-view-intro">
          <div>
            <p className="menu-v2-kicker">Choose how you browse</p>
            <h2>A menu designed for the table.</h2>
            <p className="menu-v2-intro-copy">
              Browse the dining-room folio or switch to the searchable list
              when you already know what you want.
            </p>
          </div>
          <div className="menu-view-toggle" aria-label="Choose menu view">
            <button
              className={view === "book" ? "active" : ""}
              type="button"
              onClick={() => {
                setView("book");
                setSearch("");
              }}
            >
              Menu folio
            </button>
            <button
              className={view === "list" ? "active" : ""}
              type="button"
              onClick={() => {
                setView("list");
                if (category === "saved") setCategory("all");
              }}
            >
              Searchable list
            </button>
            <button
              className={view === "list" && category === "saved" ? "active" : ""}
              type="button"
              onClick={() => {
                setView("list");
                setCategory("saved");
                setSearch("");
              }}
            >
              Saved
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </button>
          </div>
        </div>

        {view === "book" && (
          <div
            className="menu-pro-stage"
            tabIndex={0}
            aria-label={`${currentPage.name} menu chapter. Use left and right arrow keys to change chapters.`}
            onTouchStart={(event) => {
              touchStart.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              const end = event.changedTouches[0]?.clientX;
              touchStart.current = null;
              if (start === null || end === undefined || Math.abs(start - end) < 45) return;
              goToPage(start > end ? pageIndex + 1 : pageIndex - 1);
            }}
          >
            <nav className="menu-pro-chapters" aria-label="Menu chapters">
              {menuCategories.map((group, index) => (
                <button
                  className={index === pageIndex ? "active" : ""}
                  type="button"
                  key={group.id}
                  onClick={() => goToPage(index)}
                  aria-current={index === pageIndex ? "page" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {group.name}
                </button>
              ))}
            </nav>

            <div className="menu-pro-book-layout">
              <div className="menu-pro-canvas-column">
                <ThreeMenuBook
                  categoryName={currentPage.name}
                  subtitle={currentPage.subtitle}
                  pageNumber={pageIndex + 1}
                  pageCount={menuCategories.length}
                  items={currentPage.items}
                  direction={turn.direction}
                  animationKey={turn.key}
                />
                <p className="menu-pro-canvas-note">
                  Drag your pointer to inspect · Change chapters to turn the page
                </p>
              </div>

              <section
                className="menu-pro-readable"
                aria-labelledby={`menu-pro-title-${currentPage.id}`}
              >
                <header>
                  <div>
                    <span>Chapter {String(pageIndex + 1).padStart(2, "0")}</span>
                    <h3 id={`menu-pro-title-${currentPage.id}`}>
                      {currentPage.name}
                    </h3>
                    <p>{currentPage.subtitle}</p>
                  </div>
                  <b>
                    {String(pageIndex + 1).padStart(2, "0")} /{" "}
                    {String(menuCategories.length).padStart(2, "0")}
                  </b>
                </header>
                <div className="menu-pro-items">
                  {currentPage.items.map((item) => (
                    <article className="menu-pro-item" key={item.id}>
                      <button
                        className="menu-pro-item-copy"
                        type="button"
                        onClick={() => setDetailItem(item)}
                        aria-label={`View details for ${item.name}`}
                      >
                        <span>
                          <strong>{item.name}</strong>
                          {item.badge && <small>{item.badge}</small>}
                        </span>
                        <p>{item.description}</p>
                      </button>
                      <div className="menu-pro-item-actions">
                        <strong>${item.price.toFixed(2)}</strong>
                        <button
                          className={`menu-pro-save ${
                            favorites.includes(item.id) ? "is-saved" : ""
                          }`}
                          type="button"
                          aria-label={
                            favorites.includes(item.id)
                              ? `Remove ${item.name} from saved dishes`
                              : `Save ${item.name}`
                          }
                          onClick={() => toggleFavorite(item)}
                        >
                          <span aria-hidden="true">
                            {favorites.includes(item.id) ? "♥" : "♡"}
                          </span>
                        </button>
                        <button
                          className="menu-pro-add"
                          type="button"
                          onClick={() => addFromMenu(item)}
                        >
                          {item.alcoholic ? "Dine-in · 21+" : "Add"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="menu-pro-allergy">
                  Select a dish for details · Please tell us about allergies
                </p>
              </section>
            </div>

            <div className="menu-pro-controls">
              <button
                type="button"
                disabled={pageIndex === 0}
                onClick={() => goToPage(pageIndex - 1)}
              >
                <span aria-hidden="true">←</span>
                Previous
              </button>
              <p aria-live="polite">
                <strong>{currentPage.name}</strong>
                <span>
                  Chapter {pageIndex + 1} of {menuCategories.length}
                </span>
              </p>
              <button
                type="button"
                disabled={pageIndex === menuCategories.length - 1}
                onClick={() => goToPage(pageIndex + 1)}
              >
                Next
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {view === "list" && (
          <>
        <div className="menu-tools">
          <label className="menu-search">
            <span>Search the menu</span>
            <input
              type="search"
              placeholder="Try “mahi,” “wings” or “coconut”…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="menu-result-count" aria-live="polite">
            <b>{resultCount}</b>
            <span>items found</span>
          </div>
        </div>
        <div className="category-tabs" aria-label="Menu categories">
          <button
            className={category === "all" ? "active" : ""}
            type="button"
            onClick={() => setCategory("all")}
          >
            Everything
          </button>
          <button
            className={category === "saved" ? "active" : ""}
            type="button"
            onClick={() => setCategory("saved")}
          >
            Saved dishes {favorites.length > 0 && `· ${favorites.length}`}
          </button>
          {menuCategories.map((group) => (
            <button
              className={category === group.id ? "active" : ""}
              type="button"
              key={group.id}
              onClick={() => {
                setCategory(group.id);
                setPageIndex(menuCategories.findIndex((item) => item.id === group.id));
              }}
            >
              {group.name}
            </button>
          ))}
        </div>

        {filteredCategories.length ? (
          <div className="menu-chapters">
            {filteredCategories.map((group, chapterIndex) => (
              <section className="menu-chapter" key={group.id}>
                <div className="menu-chapter-head">
                  <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
                  <div>
                    <h2>{group.name}</h2>
                    <p>{group.subtitle}</p>
                  </div>
                </div>
                <div className="menu-item-grid">
                  {group.items.map((item) => (
                    <article className="menu-item" key={item.id}>
                      <div className="menu-item-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt="" loading="lazy" />
                        {item.badge && <span>{item.badge}</span>}
                      </div>
                      <div className="menu-item-copy">
                        <div className="menu-item-title">
                          <h3>{item.name}</h3>
                          <strong>${item.price.toFixed(2)}</strong>
                        </div>
                        <p>{item.description}</p>
                        <div className="menu-item-actions">
                          {item.alcoholic ? (
                            <span className="menu-tag">21+ · Dine-in only</span>
                          ) : (
                            <span className="menu-tag">{group.name}</span>
                          )}
                          <button
                            className="menu-detail-link"
                            type="button"
                            onClick={() => setDetailItem(item)}
                          >
                            View details
                          </button>
                          <button
                            className={`menu-save-button ${
                              favorites.includes(item.id) ? "is-saved" : ""
                            }`}
                            type="button"
                            aria-label={
                              favorites.includes(item.id)
                                ? `Remove ${item.name} from saved dishes`
                                : `Save ${item.name}`
                            }
                            onClick={() => toggleFavorite(item)}
                          >
                            <span aria-hidden="true">♥</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addFromMenu(item)}
                          >
                            {item.alcoholic ? "Available dine-in" : "Add to order"}{" "}
                            <span aria-hidden="true">{item.alcoholic ? "21+" : "+"}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="menu-empty">
            <span aria-hidden="true">☀</span>
            <h2>No dishes matched that search.</h2>
            <p>Try another word or return to the complete menu.</p>
            <button
              className="button ink"
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Show the full menu
            </button>
          </div>
        )}
          </>
        )}
      </div>
      <div
        className={`menu-detail-layer ${detailItem ? "is-open" : ""}`}
        aria-hidden={!detailItem}
      >
        <button
          className="menu-detail-backdrop"
          type="button"
          aria-label="Close dish details"
          onClick={() => setDetailItem(null)}
        />
        {detailItem && (
          <aside
            className="menu-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`${detailItem.name} details`}
          >
            <button
              className="menu-detail-close"
              type="button"
              onClick={() => setDetailItem(null)}
              aria-label="Close dish details"
            >
              ×
            </button>
            <div className="menu-detail-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detailItem.image} alt="" />
              <span>{detailItem.categoryName}</span>
            </div>
            <div className="menu-detail-copy">
              <p className="eyebrow">{detailItem.badge ?? "Southernmost menu"}</p>
              <div className="menu-detail-title">
                <h2>{detailItem.name}</h2>
                <strong>${detailItem.price.toFixed(2)}</strong>
              </div>
              <p>{detailItem.description}</p>
              {detailItem.alcoholic && (
                <div className="menu-detail-notice">
                  <strong>21+ · Dine-in only</strong>
                  <span>Cocktails are not added to pickup orders.</span>
                </div>
              )}
              <div className="menu-detail-actions">
                <button
                  className={`button outline-dark ${
                    favorites.includes(detailItem.id) ? "is-saved" : ""
                  }`}
                  type="button"
                  onClick={() => toggleFavorite(detailItem)}
                >
                  {favorites.includes(detailItem.id) ? "Saved ♥" : "Save dish ♡"}
                </button>
                <button
                  className="button sun"
                  type="button"
                  onClick={() => {
                    if (detailItem.alcoholic) {
                      addFromMenu(detailItem);
                      return;
                    }
                    addFromMenu(detailItem);
                    setDetailItem(null);
                  }}
                >
                  {detailItem.alcoholic ? "Available when dining in" : "Add to order"}
                </button>
              </div>
              {!detailItem.alcoholic && (
                <button
                  className="menu-detail-cart"
                  type="button"
                  onClick={() => {
                    setDetailItem(null);
                    openCart();
                  }}
                >
                  View current order <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
      <div className={`menu-toast ${toast ? "is-visible" : ""}`} aria-live="polite">
        <span aria-hidden="true">✦</span>
        {toast}
        {toast.includes("added") && (
          <button type="button" onClick={openCart}>
            View order
          </button>
        )}
      </div>
    </section>
  );
}
