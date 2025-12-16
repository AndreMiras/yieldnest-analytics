import { describe, it, expect } from "vitest";
import { calculateAPY, calculateCurrentAPY } from "./apy";
import { MetricsSnapshot } from "@/types/metrics";

describe("calculateAPY", () => {
  it("calculates APY for positive rate growth over one year", () => {
    const startRate = 1.0;
    const endRate = 1.05; // 5% growth
    const startTime = 0;
    const endTime = 365 * 24 * 60 * 60; // 1 year in seconds

    const apy = calculateAPY(startRate, endRate, startTime, endTime);

    expect(apy).toBeCloseTo(5.0, 1); // ~5% APY
  });

  it("calculates APY for partial year period", () => {
    const startRate = 1.0;
    const endRate = 1.01; // 1% growth
    const startTime = 0;
    const endTime = (365 * 24 * 60 * 60) / 12; // 1 month in seconds

    const apy = calculateAPY(startRate, endRate, startTime, endTime);

    // 1% monthly compounds to ~12.68% annually
    expect(apy).toBeGreaterThan(12);
    expect(apy).toBeLessThan(13);
  });

  it("returns negative APY for rate decrease", () => {
    const startRate = 1.0;
    const endRate = 0.95; // 5% decrease
    const startTime = 0;
    const endTime = 365 * 24 * 60 * 60; // 1 year

    const apy = calculateAPY(startRate, endRate, startTime, endTime);

    expect(apy).toBeLessThan(0);
  });

  it("returns 0 APY when rates are equal", () => {
    const startRate = 1.0;
    const endRate = 1.0;
    const startTime = 0;
    const endTime = 365 * 24 * 60 * 60;

    const apy = calculateAPY(startRate, endRate, startTime, endTime);

    expect(apy).toBe(0);
  });

  it("handles very small time periods", () => {
    const startRate = 1.0;
    const endRate = 1.0001; // 0.01% growth
    const startTime = 0;
    const endTime = 3600; // 1 hour

    const apy = calculateAPY(startRate, endRate, startTime, endTime);

    // Small growth over short period should annualize to large APY
    expect(apy).toBeGreaterThan(0);
    expect(Number.isFinite(apy)).toBe(true);
  });

  it("handles large exchange rates", () => {
    const startRate = 1000000;
    const endRate = 1050000; // 5% growth
    const startTime = 0;
    const endTime = 365 * 24 * 60 * 60;

    const apy = calculateAPY(startRate, endRate, startTime, endTime);

    expect(apy).toBeCloseTo(5.0, 1);
  });
});

describe("calculateCurrentAPY", () => {
  it("returns null for empty array", () => {
    const data: MetricsSnapshot[] = [];

    const result = calculateCurrentAPY(data);

    expect(result).toBeNull();
  });

  it("returns null for single element array", () => {
    const data: MetricsSnapshot[] = [
      { exchangeRate: "1.0", timestamp: "1000000" },
    ];

    const result = calculateCurrentAPY(data);

    expect(result).toBeNull();
  });

  it("calculates APY from array with two elements", () => {
    const startTime = 0;
    const endTime = 365 * 24 * 60 * 60; // 1 year
    const data: MetricsSnapshot[] = [
      { exchangeRate: "1.0", timestamp: startTime.toString() },
      { exchangeRate: "1.05", timestamp: endTime.toString() },
    ];

    const result = calculateCurrentAPY(data);

    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(5.0, 1);
  });

  it("uses first and last elements for calculation", () => {
    const year = 365 * 24 * 60 * 60;
    const data: MetricsSnapshot[] = [
      { exchangeRate: "1.0", timestamp: "0" },
      { exchangeRate: "1.02", timestamp: (year / 2).toString() }, // middle point ignored
      { exchangeRate: "1.05", timestamp: year.toString() },
    ];

    const result = calculateCurrentAPY(data);

    // Should use first (1.0) and last (1.05), ignoring middle
    expect(result).toBeCloseTo(5.0, 1);
  });

  it("handles string parsing correctly", () => {
    const data: MetricsSnapshot[] = [
      { exchangeRate: "1.123456789", timestamp: "1700000000" },
      { exchangeRate: "1.180000000", timestamp: "1731536000" }, // ~1 year later
    ];

    const result = calculateCurrentAPY(data);

    expect(result).not.toBeNull();
    expect(Number.isFinite(result!)).toBe(true);
  });
});
