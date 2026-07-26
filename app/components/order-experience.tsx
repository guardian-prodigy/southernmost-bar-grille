"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { featuredMenuItems } from "../menu-data";
import { useOrder } from "./order-provider";

type OrderMode = "pickup" | "dine-in";

type TableSession = {
  table: string;
  zone: string;
};

function readTableSession(): TableSession | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const table = params.get("table");
  const zone = params.get("zone");
  const qr = params.get("qr");
  if (!table || !zone || qr !== `SM-LOCAL-${table}`) return null;
  return { table, zone };
}

export function OrderExperience() {
  const [mode, setMode] = useState<OrderMode>("pickup");
  const [tableSession, setTableSession] = useState<TableSession | null>(null);
  const [copied, setCopied] = useState(false);
  const {
    cart,
    subtotal,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
  } = useOrder();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = readTableSession();
      setTableSession(session);
      if (session) setMode("dine-in");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const summary = useMemo(
    () =>
      [
        `Southernmost ${mode === "pickup" ? "pickup" : "dine-in"} order`,
        tableSession
          ? `Table ${tableSession.table} · ${tableSession.zone}`
          : null,
        ...cart.map(
          (line) =>
            `${line.quantity} × ${line.name} — $${(
              line.quantity * line.price
            ).toFixed(2)}`,
        ),
        `Estimated subtotal: $${subtotal.toFixed(2)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [cart, mode, subtotal, tableSession],
  );

  async function copyOrder() {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  return (
    <section className="order-experience">
      <div className="shell order-mode-bar">
        <div>
          <p className="eyebrow">How are you joining us?</p>
          <h2>Choose your order mode.</h2>
        </div>
        <div className="mode-switch" role="group" aria-label="Order mode">
          <button
            className={mode === "pickup" ? "active" : ""}
            type="button"
            onClick={() => setMode("pickup")}
          >
            <span>01</span>
            Pickup
          </button>
          <button
            className={mode === "dine-in" ? "active" : ""}
            type="button"
            onClick={() => setMode("dine-in")}
          >
            <span>02</span>
            Dine-in
          </button>
        </div>
      </div>

      {mode === "dine-in" && !tableSession ? (
        <div className="shell locked-table">
          <div className="lock-mark" aria-hidden="true">
            QR
          </div>
          <div>
            <p className="eyebrow">Table ordering is protected</p>
            <h2>Scan the QR at your table to begin.</h2>
            <p>
              Dine-in ordering opens only from a Southernmost table, bar, patio
              or lounge QR. This prevents orders from being routed to the wrong
              location.
            </p>
            <button className="button ink" type="button" onClick={() => setMode("pickup")}>
              Switch to pickup
            </button>
          </div>
        </div>
      ) : (
        <div className="shell order-layout">
          <div className="order-main">
            {tableSession && mode === "dine-in" && (
              <div className="session-banner">
                <span>Verified dine-in session</span>
                <strong>
                  Table {tableSession.table} · {tableSession.zone}
                </strong>
              </div>
            )}

            <div className="order-section-head">
              <div>
                <p className="eyebrow">Quick additions</p>
                <h2>Southernmost favorites</h2>
              </div>
              <Link className="text-link" href="/menu">
                Browse full menu <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="quick-order-grid">
              {featuredMenuItems.map((item) => (
                <article key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" />
                  <div>
                    <h3>{item.name}</h3>
                    <span>${item.price.toFixed(2)}</span>
                    <button type="button" onClick={() => addItem(item)}>
                      Add +
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="order-review">
            <div className="order-review-head">
              <div>
                <p className="eyebrow light">Order review</p>
                <h2>{mode === "pickup" ? "Pickup" : `Table ${tableSession?.table}`}</h2>
              </div>
              {cart.length > 0 && (
                <button type="button" onClick={clearCart}>
                  Clear
                </button>
              )}
            </div>
            <div className="order-review-body">
              {cart.length ? (
                cart.map((line) => (
                  <article key={line.id}>
                    <div>
                      <h3>{line.name}</h3>
                      <span>
                        ${(line.price * line.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="quantity">
                      <button
                        type="button"
                        onClick={() => decreaseItem(line.id)}
                        aria-label={`Remove one ${line.name}`}
                      >
                        −
                      </button>
                      <b>{line.quantity}</b>
                      <button
                        type="button"
                        onClick={() => addItem(line)}
                        aria-label={`Add one ${line.name}`}
                      >
                        +
                      </button>
                      <button
                        className="remove-line"
                        type="button"
                        onClick={() => removeItem(line.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="order-review-empty">
                  <span aria-hidden="true">☀</span>
                  <h3>Your order is empty.</h3>
                  <p>Add a favorite or explore the full menu.</p>
                </div>
              )}
            </div>
            <div className="order-review-total">
              <div>
                <span>Estimated subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <p>
                Final price, tax, availability and pickup timing are confirmed
                by the restaurant.
              </p>
              <button
                className="button sun"
                type="button"
                disabled={!cart.length}
                onClick={copyOrder}
              >
                {copied ? "Order summary copied" : "Copy order summary"}
              </button>
              <a
                className={`button glass ${cart.length ? "" : "disabled"}`}
                href={cart.length ? "tel:+17279106118" : undefined}
                aria-disabled={!cart.length}
              >
                Call to confirm order
              </a>
            </div>
          </aside>
        </div>
      )}

      <div className="shell order-boundary">
        <strong>Secure checkout connection</strong>
        <p>
          Online payment, live POS routing and automated order acceptance are
          not yet connected. Selections stay on this device until you call the
          restaurant to confirm.
        </p>
      </div>
    </section>
  );
}
