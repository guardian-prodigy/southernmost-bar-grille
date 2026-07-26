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
  const [copyError, setCopyError] = useState(false);
  const [requestedTime, setRequestedTime] = useState("ASAP");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
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
        mode === "pickup" ? `Requested pickup: ${requestedTime}` : null,
        guestName ? `Guest: ${guestName}` : null,
        guestPhone ? `Phone: ${guestPhone}` : null,
        ...cart.map(
          (line) =>
            `${line.quantity} × ${line.name} — $${(
              line.quantity * line.price
            ).toFixed(2)}`,
        ),
        specialInstructions
          ? `Special instructions: ${specialInstructions}`
          : null,
        `Estimated subtotal: $${subtotal.toFixed(2)}`,
        "Please confirm timing, availability, tax and final pricing by phone.",
      ]
        .filter(Boolean)
        .join("\n"),
    [
      cart,
      guestName,
      guestPhone,
      mode,
      requestedTime,
      specialInstructions,
      subtotal,
      tableSession,
    ],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cart, guestName, guestPhone, mode, requestedTime, specialInstructions]);

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  const activeStep = !cart.length ? 1 : guestName && guestPhone ? 3 : 2;
  const pickupItems = featuredMenuItems.filter((item) => !item.alcoholic);

  return (
    <section className="order-experience">
      <div className="shell order-journey" aria-label="Order progress">
        {[
          [1, "Build", "Choose your favorites"],
          [2, "Details", "Add a pickup request"],
          [3, "Review", "Copy and call to confirm"],
        ].map(([number, label, detail]) => (
          <div
            className={
              activeStep === number
                ? "active"
                : activeStep > Number(number)
                  ? "complete"
                  : ""
            }
            key={number}
          >
            <span>{activeStep > Number(number) ? "✓" : `0${number}`}</span>
            <p>
              <strong>{label}</strong>
              <small>{detail}</small>
            </p>
          </div>
        ))}
      </div>
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
              {pickupItems.map((item) => (
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

            {mode === "pickup" && (
              <section className="pickup-request" aria-labelledby="pickup-request-title">
                <div className="pickup-request-head">
                  <div>
                    <p className="eyebrow">Pickup request</p>
                    <h2 id="pickup-request-title">Add the details for the call.</h2>
                  </div>
                  <span>Nothing is transmitted</span>
                </div>
                <fieldset className="pickup-time-picker">
                  <legend>Requested timing</legend>
                  <div>
                    {["ASAP", "In 30 minutes", "In 45 minutes", "In 60 minutes"].map(
                      (time) => (
                        <button
                          className={requestedTime === time ? "active" : ""}
                          type="button"
                          key={time}
                          onClick={() => setRequestedTime(time)}
                        >
                          {time}
                        </button>
                      ),
                    )}
                  </div>
                  <small>Requested times are confirmed by the restaurant.</small>
                </fieldset>
                <div className="pickup-fields">
                  <label>
                    Name for the order
                    <input
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    Best phone
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(event) => setGuestPhone(event.target.value)}
                      placeholder="(555) 555-5555"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="pickup-notes">
                    Special instructions
                    <textarea
                      rows={4}
                      value={specialInstructions}
                      onChange={(event) => setSpecialInstructions(event.target.value)}
                      placeholder="Food preparation requests or anything the team should confirm…"
                    />
                  </label>
                </div>
              </section>
            )}
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
              {copyError && (
                <p className="order-copy-error" role="alert">
                  Copy was blocked by the browser. Keep this page open and call
                  the team to confirm the order.
                </p>
              )}
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
