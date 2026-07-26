"use client";

import { useMemo, useState } from "react";
import { menuCategories } from "../menu-data";
import { useOrder } from "./order-provider";

export function MenuExplorer() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"book" | "list">("book");
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState({ direction: "next", key: 0 });
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

  const filteredCategories = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return menuCategories
      .filter((group) => category === "all" || group.id === category)
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !needle ||
            item.name.toLowerCase().includes(needle) ||
            item.description.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [category, search]);

  const resultCount = filteredCategories.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <section className="menu-explorer">
      <div className="shell">
        <div className="menu-view-intro">
          <div>
            <p className="eyebrow">The Southernmost menu book</p>
            <h2>Turn the pages. Find your favorite.</h2>
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
              <span aria-hidden="true">◫</span> 3D book
            </button>
            <button
              className={view === "list" ? "active" : ""}
              type="button"
              onClick={() => setView("list")}
            >
              <span aria-hidden="true">☰</span> Quick list
            </button>
          </div>
        </div>

        {view === "book" && (
          <div className="menu-book-stage">
            <div className="book-ambient book-ambient-one" aria-hidden="true" />
            <div className="book-ambient book-ambient-two" aria-hidden="true" />
            <div
              className={`menu-book turn-${turn.direction}`}
              key={turn.key}
              aria-label={`${currentPage.name} menu page`}
            >
              <div className="book-cover-edge" aria-hidden="true" />
              <section className="book-page book-page-left">
                <div className="book-page-texture" aria-hidden="true" />
                <span className="book-kicker">
                  Chapter {String(pageIndex + 1).padStart(2, "0")}
                </span>
                <h3>{currentPage.name}</h3>
                <p>{currentPage.subtitle}</p>
                <div className="book-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentPage.image} alt="" />
                  <span>Southernmost<br />Bar &amp; Grille</span>
                </div>
                <small>West Palm Beach · Florida</small>
              </section>
              <section className="book-page book-page-right">
                <div className="book-page-texture" aria-hidden="true" />
                <div className="book-page-rule">
                  <span>{currentPage.name}</span>
                  <span>{pageIndex + 1} / {menuCategories.length}</span>
                </div>
                <div className="book-items">
                  {currentPage.items.map((item) => (
                    <article className="book-item" key={item.id}>
                      <div>
                        <h4>{item.name}</h4>
                        {item.badge && <span>{item.badge}</span>}
                      </div>
                      <strong>${item.price.toFixed(2)}</strong>
                      <p>{item.description}</p>
                      <button
                        type="button"
                        aria-label={`Add ${item.name} to order`}
                        onClick={() => {
                          addItem(item);
                          openCart();
                        }}
                      >
                        Add <span aria-hidden="true">+</span>
                      </button>
                    </article>
                  ))}
                </div>
                <span className="book-corner-mark" aria-hidden="true">SM</span>
              </section>
              <div className="book-spine" aria-hidden="true" />
            </div>

            <div className="book-controls">
              <button
                type="button"
                disabled={pageIndex === 0}
                onClick={() => goToPage(pageIndex - 1)}
              >
                <span aria-hidden="true">←</span> Previous
              </button>
              <div className="book-progress" aria-label={`Page ${pageIndex + 1} of ${menuCategories.length}`}>
                {menuCategories.map((group, index) => (
                  <button
                    className={index === pageIndex ? "active" : ""}
                    type="button"
                    key={group.id}
                    onClick={() => goToPage(index)}
                    aria-label={`Open ${group.name}`}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={pageIndex === menuCategories.length - 1}
                onClick={() => goToPage(pageIndex + 1)}
              >
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="book-hint">
              Select the arrows or chapter markers to turn the pages.
            </p>
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
                            type="button"
                            onClick={() => {
                              addItem(item);
                              openCart();
                            }}
                          >
                            Add to order <span aria-hidden="true">+</span>
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
    </section>
  );
}
