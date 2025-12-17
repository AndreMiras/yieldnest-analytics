import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMetricsPage, fetchAllMetrics } from "./graph";

const createMockMetric = (index: number) => ({
  exchangeRate: (1.0 + index * 0.001).toFixed(18),
  timestamp: (1700000000 + index * 3600).toString(),
});

const createMockMetrics = (count: number) =>
  Array.from({ length: count }, (_, i) => createMockMetric(i));

const createMockResponse = (
  metrics: Array<{ exchangeRate: string; timestamp: string }>,
) => ({
  ok: true,
  json: async () => ({
    data: {
      metricsSnapshots: metrics,
    },
  }),
});

describe("graph service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchMetricsPage", () => {
    const mockQueryUrl = "https://api.thegraph.com/subgraphs/name/test";
    const mockStartTime = 1700000000;
    const mockSkip = 0;

    it("makes POST request with correct headers", async () => {
      const mockFetch = vi.fn().mockResolvedValue(createMockResponse([]));
      vi.stubGlobal("fetch", mockFetch);

      await fetchMetricsPage(mockQueryUrl, mockStartTime, mockSkip);

      expect(mockFetch).toHaveBeenCalledWith(
        mockQueryUrl,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("sends correct query variables in request body", async () => {
      const mockFetch = vi.fn().mockResolvedValue(createMockResponse([]));
      vi.stubGlobal("fetch", mockFetch);

      await fetchMetricsPage(mockQueryUrl, mockStartTime, mockSkip);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.variables).toEqual({
        startTime: mockStartTime,
        skip: mockSkip,
      });
    });

    it("returns metrics array from response", async () => {
      const mockMetrics = createMockMetrics(5);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(createMockResponse(mockMetrics)),
      );

      const result = await fetchMetricsPage(
        mockQueryUrl,
        mockStartTime,
        mockSkip,
      );

      expect(result).toEqual(mockMetrics);
      expect(result).toHaveLength(5);
    });

    it("returns empty array when no metrics", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(createMockResponse([])));

      const result = await fetchMetricsPage(
        mockQueryUrl,
        mockStartTime,
        mockSkip,
      );

      expect(result).toEqual([]);
    });

    it("passes skip parameter correctly", async () => {
      const mockFetch = vi.fn().mockResolvedValue(createMockResponse([]));
      vi.stubGlobal("fetch", mockFetch);

      await fetchMetricsPage(mockQueryUrl, mockStartTime, 2000);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.variables.skip).toBe(2000);
    });
  });

  describe("fetchAllMetrics", () => {
    const mockQueryUrl = "https://api.thegraph.com/subgraphs/name/test";
    const mockStartTime = 1700000000;

    it("returns single page when results less than PAGE_SIZE", async () => {
      const mockMetrics = createMockMetrics(500);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(createMockResponse(mockMetrics)),
      );

      const result = await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(result).toEqual(mockMetrics);
      expect(result).toHaveLength(500);
    });

    it("fetches only once when first page has less than 1000 items", async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValue(createMockResponse(createMockMetrics(500)));
      vi.stubGlobal("fetch", mockFetch);

      await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("paginates when first page has exactly 1000 items", async () => {
      const firstPage = createMockMetrics(1000);
      const secondPage = createMockMetrics(500);

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createMockResponse(firstPage))
        .mockResolvedValueOnce(createMockResponse(secondPage));
      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1500);
    });

    it("continues pagination through multiple full pages", async () => {
      const fullPage = createMockMetrics(1000);
      const partialPage = createMockMetrics(100);

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createMockResponse(fullPage))
        .mockResolvedValueOnce(createMockResponse(fullPage))
        .mockResolvedValueOnce(createMockResponse(partialPage));
      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(2100);
    });

    it("stops pagination when empty page received", async () => {
      const fullPage = createMockMetrics(1000);

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createMockResponse(fullPage))
        .mockResolvedValueOnce(createMockResponse([]));
      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1000);
    });

    it("passes correct skip values for each page", async () => {
      const fullPage = createMockMetrics(1000);
      const partialPage = createMockMetrics(100);

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createMockResponse(fullPage))
        .mockResolvedValueOnce(createMockResponse(fullPage))
        .mockResolvedValueOnce(createMockResponse(partialPage));
      vi.stubGlobal("fetch", mockFetch);

      await fetchAllMetrics(mockQueryUrl, mockStartTime);

      // Check skip values in each call
      const calls = mockFetch.mock.calls;
      expect(JSON.parse(calls[0][1].body).variables.skip).toBe(0);
      expect(JSON.parse(calls[1][1].body).variables.skip).toBe(1000);
      expect(JSON.parse(calls[2][1].body).variables.skip).toBe(2000);
    });

    it("returns empty array when first page is empty", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(createMockResponse([])));

      const result = await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(result).toEqual([]);
    });

    it("accumulates data correctly across pages", async () => {
      // Create distinct data for each page to verify accumulation
      const page1 = [{ exchangeRate: "1.001", timestamp: "1000" }];
      const page2 = [{ exchangeRate: "1.002", timestamp: "2000" }];

      // First page needs 1000 items to trigger pagination
      const fullFirstPage = [...createMockMetrics(999), ...page1];

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createMockResponse(fullFirstPage))
        .mockResolvedValueOnce(createMockResponse(page2));
      vi.stubGlobal("fetch", mockFetch);

      const result = await fetchAllMetrics(mockQueryUrl, mockStartTime);

      expect(result).toHaveLength(1001);
      expect(result[result.length - 1]).toEqual(page2[0]);
    });
  });
});
