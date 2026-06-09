import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { InterceptOverlay } from "@/components/intercept/InterceptOverlay";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("InterceptOverlay", () => {
  it("shows processing first, then the saved amount", () => {
    render(<InterceptOverlay amount={203} processingMs={2000} onClose={() => {}} />);
    expect(screen.getByText(/placing your order/i)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(2000); });

    expect(screen.getByText(/\$203/)).toBeInTheDocument();
    expect(screen.getByText(/craving handled/i)).toBeInTheDocument();
  });
});
