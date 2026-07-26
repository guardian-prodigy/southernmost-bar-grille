"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MenuItem } from "../menu-data";

export type CartLine = MenuItem & { quantity: number };

type OrderContextValue = {
  cart: CartLine[];
  itemCount: number;
  subtotal: number;
  cartOpen: boolean;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);
const STORAGE_KEY = "southernmost-cart-v2";

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used inside OrderProvider");
  }
  return context;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setCart(JSON.parse(stored) as CartLine[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, ready]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.classList.add("drawer-open");
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("drawer-open");
    };
  }, [cartOpen]);

  const addItem = useCallback((item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id);
      return existing
        ? current.map((line) =>
            line.id === item.id
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          )
        : [...current, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((current) => current.filter((line) => line.id !== itemId));
  }, []);

  const decreaseItem = useCallback((itemId: string) => {
    setCart((current) =>
      current
        .map((line) =>
          line.id === itemId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const value = useMemo<OrderContextValue>(() => {
    const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = cart.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );
    return {
      cart,
      itemCount,
      subtotal,
      cartOpen,
      addItem,
      removeItem,
      decreaseItem,
      clearCart: () => setCart([]),
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
    };
  }, [cart, cartOpen, addItem, removeItem, decreaseItem]);

  return (
    <OrderContext.Provider value={value}>
      {children}
      <CartDrawer />
    </OrderContext.Provider>
  );
}

function CartDrawer() {
  const {
    cart,
    itemCount,
    subtotal,
    cartOpen,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
    closeCart,
  } = useOrder();

  return (
    <div className={`cart-layer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}>
      <button
        className="cart-backdrop"
        type="button"
        aria-label="Close order"
        onClick={closeCart}
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
      >
        <div className="cart-head">
          <div>
            <p className="eyebrow">Your order</p>
            <h2>{itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"}` : "Ready when you are"}</h2>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close order">
            ×
          </button>
        </div>
        <div className="cart-body">
          {cart.length ? (
            <>
              <div className="cart-lines">
                {cart.map((line) => (
                  <article className="cart-line" key={line.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.image} alt="" />
                    <div>
                      <h3>{line.name}</h3>
                      <span>${line.price.toFixed(2)}</span>
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
                      </div>
                    </div>
                    <button
                      className="remove-line"
                      type="button"
                      onClick={() => removeItem(line.id)}
                      aria-label={`Remove ${line.name}`}
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
              <button className="clear-cart" type="button" onClick={clearCart}>
                Clear order
              </button>
            </>
          ) : (
            <div className="empty-cart">
              <span aria-hidden="true">☀</span>
              <h3>Nothing here yet.</h3>
              <p>
                Explore the menu and build your ideal Southernmost spread.
              </p>
              <Link className="button ink" href="/menu" onClick={closeCart}>
                Browse the menu
              </Link>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-summary">
            <div>
              <span>Estimated subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <p>Taxes, availability and final pricing are confirmed at checkout.</p>
            <Link className="button sun" href="/order" onClick={closeCart}>
              Review order
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
