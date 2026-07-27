"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { menuCategories } from "../menu-data";
import type { MenuItem } from "../menu-data";
import { InteractiveMenuBook } from "./interactive-menu-book";
import { useOrder } from "./order-provider";

const FAVORITES_KEY = "southernmost-favorites-v1";

export function MenuExplorer() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"book" | "list">("book");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState("");
  const { addItem, openCart } = useOrder();

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

  const toggleFavorite = useCallback((item: MenuItem) => {
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
  }, [favorites]);

  const addFromMenu = useCallback((item: MenuItem) => {
    if (item.alcoholic) {
      setToast(`${item.name} is available for guests dining in.`);
      return;
    }
    addItem(item);
    setToast(`${item.name} added to your order.`);
  }, [addItem]);

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
          <InteractiveMenuBook
            favorites={favorites}
            onAddItem={addFromMenu}
            onSelectItem={setDetailItem}
            onToggleFavorite={toggleFavorite}
          />
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
