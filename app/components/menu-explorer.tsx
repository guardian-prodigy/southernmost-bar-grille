"use client";

import { useMemo, useState } from "react";
import { menuCategories } from "../menu-data";
import { useOrder } from "./order-provider";

export function MenuExplorer() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { addItem, openCart } = useOrder();

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
              onClick={() => setCategory(group.id)}
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
      </div>
    </section>
  );
}
