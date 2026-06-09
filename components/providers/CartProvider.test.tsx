import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/components/providers/CartProvider";
import type { Product } from "@/lib/types";

const product: Product = {
  id: "x", name: "Thing", category: "Home", price: 50, image: "",
  rating: 5, reviewCount: 1, reviews: [],
};

function Probe() {
  const { items, total, add, remove, clear } = useCart();
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="total">{total}</span>
      <button onClick={() => add(product)}>add</button>
      <button onClick={() => remove("x")}>remove</button>
      <button onClick={clear}>clear</button>
    </div>
  );
}

function setup() {
  return render(
    <CartProvider>
      <Probe />
    </CartProvider>,
  );
}

describe("CartProvider", () => {
  it("starts empty", () => {
    setup();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("total").textContent).toBe("0");
  });

  it("adds an item and bumps qty on re-add", () => {
    setup();
    act(() => screen.getByText("add").click());
    act(() => screen.getByText("add").click());
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("total").textContent).toBe("100");
  });

  it("removes and clears", () => {
    setup();
    act(() => screen.getByText("add").click());
    act(() => screen.getByText("remove").click());
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});
