import type { Metadata } from "next";
import { OrderExperience } from "../components/order-experience";

export const metadata: Metadata = {
  title: "Order",
  description:
    "Build a Southernmost pickup order or open a verified dine-in table session.",
};

export default function OrderPage() {
  return (
    <main id="main-content">
      <section className="order-heading">
        <div className="shell">
          <p className="eyebrow light">Order Southernmost</p>
          <h1>
            Your favorites,{" "}
            <br />
            <em>your way.</em>
          </h1>
          <p>
            Build a pickup order or continue a dine-in session entered through
            a verified table QR.
          </p>
        </div>
      </section>
      <OrderExperience />
    </main>
  );
}
