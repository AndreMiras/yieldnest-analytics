import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCards } from "./MetricCards";

describe("MetricCards", () => {
  describe("exchange rate display", () => {
    it("renders exchange rate formatted to 4 decimal places", () => {
      render(<MetricCards exchangeRate={1.123456789} apy={null} />);

      expect(screen.getByText("1.1235 ETH")).toBeInTheDocument();
    });

    it("renders exchange rate label", () => {
      render(<MetricCards exchangeRate={1.0} apy={null} />);

      expect(screen.getByText("Current Exchange Rate")).toBeInTheDocument();
    });

    it("handles whole number exchange rate", () => {
      render(<MetricCards exchangeRate={2} apy={null} />);

      expect(screen.getByText("2.0000 ETH")).toBeInTheDocument();
    });
  });

  describe("APY display", () => {
    it("renders APY formatted to 2 decimal places with percent", () => {
      render(<MetricCards exchangeRate={1.0} apy={5.678} />);

      expect(screen.getByText("5.68%")).toBeInTheDocument();
    });

    it("renders APY label", () => {
      render(<MetricCards exchangeRate={1.0} apy={5.0} />);

      expect(screen.getByText("Current APY")).toBeInTheDocument();
    });

    it("renders dash when APY is null", () => {
      render(<MetricCards exchangeRate={1.0} apy={null} />);

      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders dash when APY is zero", () => {
      render(<MetricCards exchangeRate={1.0} apy={0} />);

      // 0 is falsy, so it should render "-"
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders negative APY correctly", () => {
      render(<MetricCards exchangeRate={1.0} apy={-2.5} />);

      expect(screen.getByText("-2.50%")).toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("renders two cards", () => {
      const { container } = render(
        <MetricCards exchangeRate={1.0} apy={5.0} />,
      );

      const cards = container.querySelectorAll('[class*="rounded-xl"]');
      expect(cards.length).toBe(2);
    });

    it("renders in a grid layout", () => {
      const { container } = render(
        <MetricCards exchangeRate={1.0} apy={5.0} />,
      );

      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass("grid-cols-2");
    });
  });
});
