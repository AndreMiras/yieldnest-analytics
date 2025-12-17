import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the logo with app name", () => {
    render(<Header />);

    expect(screen.getByText("YieldNest Analytics")).toBeInTheDocument();
  });

  it("renders the home link pointing to root", () => {
    render(<Header />);

    const homeLink = screen.getByRole("link", { name: /yieldnest analytics/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders the GitHub about link", () => {
    render(<Header />);

    const aboutLink = screen.getByRole("link", { name: /about/i });
    expect(aboutLink).toHaveAttribute(
      "href",
      "https://github.com/AndreMiras/yieldnest-analytics",
    );
    expect(aboutLink).toHaveAttribute("target", "_blank");
  });

  it("renders with the correct header structure", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("border-b", "bg-blue-100");
  });

  it("renders navigation element", () => {
    render(<Header />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});
