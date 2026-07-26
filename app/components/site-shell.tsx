"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useOrder } from "./order-provider";
import { VenueStatus } from "./venue-status";

export function SiteHeader() {
  const { itemCount, openCart } = useOrder();
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (mobileMenu.current) mobileMenu.current.open = false;
      setMobileOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileMenu.current) mobileMenu.current.open = false;
      setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <>
      <div className="announcement">
        <div className="shell announcement-inner">
          <VenueStatus compact />
          <span className="announcement-center">
            4449 Okeechobee Blvd · West Palm Beach
          </span>
          <a href="tel:+17279106118">+1 (727) 910-6118</a>
        </div>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" href="/" aria-label="Southernmost home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/southernmost-wordmark.webp"
              alt="Southernmost Bar & Grille"
            />
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href="/menu" aria-current={pathname === "/menu" ? "page" : undefined}>
              Menu
            </Link>
            <Link href="/events" aria-current={pathname === "/events" ? "page" : undefined}>
              Live & Events
            </Link>
            <Link
              href="/private-events"
              aria-current={pathname === "/private-events" ? "page" : undefined}
            >
              Private Events
            </Link>
            <Link href="/visit" aria-current={pathname === "/visit" ? "page" : undefined}>
              Visit
            </Link>
          </nav>
          <div className="header-actions">
            <button
              className="header-cart"
              type="button"
              onClick={openCart}
              aria-label={`Open order with ${itemCount} items`}
            >
              Order <b>{itemCount}</b>
            </button>
            <Link className="button nav-order" href="/order">
              Order online
            </Link>
            <details
              ref={mobileMenu}
              className="mobile-menu"
              onToggle={(event) => setMobileOpen(event.currentTarget.open)}
            >
              <summary
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
              >
                <span />
                <span />
                <span />
              </summary>
              <nav aria-label="Mobile navigation">
                <Link href="/">Home</Link>
                <Link href="/menu">Menu</Link>
                <Link href="/events">Live & Events</Link>
                <Link href="/private-events">Private Events</Link>
                <Link href="/visit">Visit</Link>
                <button className="mobile-cart-link" type="button" onClick={openCart}>
                  View order <b>{itemCount}</b>
                </button>
                <Link className="button sun" href="/order">
                  Order online
                </Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/southernmost-logo-plate.webp"
            alt="Southernmost Bar & Grille"
          />
          <p>
            Coastal kitchen, handcrafted cocktails, billiards and live island
            energy in West Palm Beach.
          </p>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link href="/menu">Menu</Link>
          <Link href="/events">Live & Events</Link>
          <Link href="/private-events">Private Events</Link>
          <Link href="/visit">Visit</Link>
        </div>
        <div className="footer-column">
          <h3>Find us</h3>
          <a
            href="https://www.google.com/maps/search/?api=1&query=4449+Okeechobee+Blvd+West+Palm+Beach+FL+33417"
            target="_blank"
            rel="noreferrer"
          >
            4449 Okeechobee Blvd
            <br />
            West Palm Beach, FL 33417
          </a>
          <span>Mon–Thu · 11 AM–11 PM</span>
          <span>Fri–Sun · 11 AM–2 AM</span>
        </div>
        <div className="footer-column footer-contact">
          <h3>Contact</h3>
          <a href="tel:+17279106118">+1 (727) 910-6118</a>
          <Link className="button footer-button" href="/order">
            Start an order
          </Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Southernmost Bar & Grille. All rights reserved.</span>
        <div>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/accessibility">Accessibility</Link>
        </div>
        <span>
          Designed by{" "}
          <a
            href="https://ajlwebcraft.com"
            target="_blank"
            rel="noreferrer"
          >
            AJL WebCraft
          </a>
        </span>
      </div>
    </footer>
  );
}
