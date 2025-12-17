import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/services/graph", () => ({
  fetchAllMetrics: vi.fn(),
}));

import { fetchAllMetrics } from "@/services/graph";

const createMockRequest = (body: object): NextRequest => {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
};

const createMockMetrics = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    exchangeRate: (1.0 + i * 0.001).toFixed(18),
    timestamp: (1700000000 + i * 3600).toString(),
  }));

describe("POST /api/metrics", () => {
  const mockApiKey = "test-api-key-12345";
  const mockNow = new Date("2024-01-01T00:00:00.000Z").getTime();

  beforeEach(() => {
    vi.stubEnv("THE_GRAPH_API_KEY", mockApiKey);
    vi.spyOn(Date, "now").mockReturnValue(mockNow);
    vi.mocked(fetchAllMetrics).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("request parsing", () => {
    it("extracts timeframe from request body", async () => {
      const mockMetrics = createMockMetrics(5);
      vi.mocked(fetchAllMetrics).mockResolvedValue(mockMetrics);

      const request = createMockRequest({ timeframe: 30 });
      await POST(request);

      expect(request.json).toHaveBeenCalledOnce();
    });
  });

  describe("time calculation", () => {
    it("calculates startTime from numeric timeframe", async () => {
      vi.mocked(fetchAllMetrics).mockResolvedValue([]);

      const request = createMockRequest({ timeframe: 30 });
      await POST(request);

      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      const nowInSeconds = Math.floor(mockNow / 1000);
      const expectedStartTime = nowInSeconds - thirtyDaysInSeconds;

      expect(fetchAllMetrics).toHaveBeenCalledWith(
        expect.any(String),
        expectedStartTime,
      );
    });

    it("defaults to startTime=1 for NaN timeframe", async () => {
      vi.mocked(fetchAllMetrics).mockResolvedValue([]);

      const request = createMockRequest({ timeframe: "max" });
      await POST(request);

      expect(fetchAllMetrics).toHaveBeenCalledWith(expect.any(String), 1);
    });

    it("handles undefined timeframe as NaN", async () => {
      vi.mocked(fetchAllMetrics).mockResolvedValue([]);

      const request = createMockRequest({});
      await POST(request);

      expect(fetchAllMetrics).toHaveBeenCalledWith(expect.any(String), 1);
    });
  });
});
