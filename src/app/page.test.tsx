import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "./page";
import { calculateCurrentAPY } from "@/utils/apy";

vi.mock("@/utils/apy");
const mockCalculateAPY = vi.mocked(calculateCurrentAPY);
vi.mock("recharts", () => {
  const MockResponsiveContainer = ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="responsive-container">{children}</div>;

  const MockLineChart = ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) => (
    <div data-testid="line-chart" data-length={data?.length ?? 0}>
      {children}
    </div>
  );

  const MockLine = ({ name, dataKey }: { name: string; dataKey: string }) => (
    <div data-testid="line" data-name={name} data-key={dataKey} />
  );

  const MockXAxis = ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  );

  const MockYAxis = ({ yAxisId }: { yAxisId: string }) => (
    <div data-testid="y-axis" data-axis-id={yAxisId} />
  );

  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  const MockLegend = () => <div data-testid="legend" />;

  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    Line: MockLine,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
  };
});

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const createMockApiResponse = (count: number) => ({
  data: {
    metricsSnapshots: Array.from({ length: count }, (_, i) => ({
      timestamp: String(1700000000 + i * 86400),
      exchangeRate: String(1.0 + i * 0.001),
    })),
  },
});

const mockSuccessfulFetch = (responseData: unknown) => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => responseData,
  });
};

const mockFailedFetch = (error: Error) => {
  mockFetch.mockRejectedValueOnce(error);
};

describe("Home", () => {
  describe("initial rendering", () => {
    it("renders the main element", async () => {
      mockSuccessfulFetch(createMockApiResponse(0));

      render(<Home />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    });

    it("renders the card title", async () => {
      mockSuccessfulFetch(createMockApiResponse(0));

      render(<Home />);

      expect(screen.getByText("ynETH Performance vs ETH")).toBeInTheDocument();
    });

    it("renders the timeframe selector", async () => {
      mockSuccessfulFetch(createMockApiResponse(0));

      render(<Home />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("data fetching", () => {
    it("fetches data on initial mount with default timeframe", async () => {
      mockCalculateAPY.mockReturnValue(5.0);
      mockSuccessfulFetch(createMockApiResponse(5));

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeframe: "30" }),
      });
    });

    it("processes API response data correctly", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      const mockData = createMockApiResponse(3);
      mockSuccessfulFetch(mockData);

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Verify data is processed and passed to child components
      await waitFor(() => {
        const lineChart = screen.getByTestId("line-chart");
        expect(lineChart).toHaveAttribute("data-length", "3");
      });
    });

    it("handles fetch errors gracefully", async () => {
      mockCalculateAPY.mockReturnValue(null);

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFailedFetch(new Error("Network error"));

      render(<Home />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error fetching data:",
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("updates data state after successful fetch", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      const mockData = createMockApiResponse(5);
      mockSuccessfulFetch(mockData);

      render(<Home />);

      // After fetch completes, should have data
      await waitFor(() => {
        expect(screen.getByText("5.00%")).toBeInTheDocument();
      });
    });
  });

  describe("data processing", () => {
    it("converts timestamp strings to numbers", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      const mockData = createMockApiResponse(2);
      mockSuccessfulFetch(mockData);

      render(<Home />);

      // Wait for the second call (after data is fetched and processed)
      await waitFor(() => {
        expect(mockCalculateAPY).toHaveBeenCalledTimes(2);
      });

      // First call is with empty array [], second call is with processed data
      const callArg = mockCalculateAPY.mock.calls[1][0];
      expect(typeof callArg[0].timestamp).toBe("number");
    });

    it("converts exchangeRate strings to numbers", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      const mockData = createMockApiResponse(2);
      mockSuccessfulFetch(mockData);

      render(<Home />);

      // Wait for the second call (after data is fetched and processed)
      await waitFor(() => {
        expect(mockCalculateAPY).toHaveBeenCalledTimes(2);
      });

      // First call is with empty array [], second call is with processed data
      const callArg = mockCalculateAPY.mock.calls[1][0];
      expect(typeof callArg[0].exchangeRate).toBe("number");
    });
  });

  describe("timeframe selection", () => {
    it("renders the select trigger with combobox role", async () => {
      mockCalculateAPY.mockReturnValue(5.0);
      mockSuccessfulFetch(createMockApiResponse(5));

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toBeInTheDocument();
    });

    it("displays selected timeframe in the select trigger", async () => {
      mockCalculateAPY.mockReturnValue(5.0);
      mockSuccessfulFetch(createMockApiResponse(5));

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Default should show "30 days"
      expect(screen.getByText("30 days")).toBeInTheDocument();
    });

    it("fetches with default 30-day timeframe on mount", async () => {
      mockCalculateAPY.mockReturnValue(5.0);
      mockSuccessfulFetch(createMockApiResponse(5));

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeframe: "30" }),
      });
    });
  });

  describe("derived values", () => {
    it("calculates latest exchange rate from data", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      const mockData = {
        data: {
          metricsSnapshots: [
            { timestamp: "1700000000", exchangeRate: "1.001" },
            { timestamp: "1700086400", exchangeRate: "1.002" },
            { timestamp: "1700172800", exchangeRate: "1.234" }, // Latest
          ],
        },
      };
      mockSuccessfulFetch(mockData);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("1.2340 ETH")).toBeInTheDocument();
      });
    });

    it("calls calculateCurrentAPY with processed data", async () => {
      mockCalculateAPY.mockReturnValue(7.5);

      const mockData = createMockApiResponse(10);
      mockSuccessfulFetch(mockData);

      render(<Home />);

      await waitFor(() => {
        expect(mockCalculateAPY).toHaveBeenCalledTimes(2);
      });

      // Verify it was called with array of processed snapshots
      const callArg = mockCalculateAPY.mock.calls[1][0];
      expect(Array.isArray(callArg)).toBe(true);
      expect(callArg.length).toBe(10);
    });

    it("passes calculated APY to MetricCards", async () => {
      mockCalculateAPY.mockReturnValue(12.34);

      const mockData = createMockApiResponse(5);
      mockSuccessfulFetch(mockData);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("12.34%")).toBeInTheDocument();
      });
    });

    it("handles empty data array for latest exchange rate", async () => {
      mockCalculateAPY.mockReturnValue(null);

      mockSuccessfulFetch(createMockApiResponse(0));

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // With empty data, MetricCards should render "-" for APY
      // and NaN for exchange rate (which renders as "NaN ETH")
      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("edge cases", () => {
    it("handles API response with no metricsSnapshots", async () => {
      mockCalculateAPY.mockReturnValue(null);

      mockSuccessfulFetch({ data: { metricsSnapshots: [] } });

      render(<Home />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Should render without crashing
      expect(screen.getByText("ynETH Performance vs ETH")).toBeInTheDocument();
    });

    it("handles malformed API response gracefully", async () => {
      mockCalculateAPY.mockReturnValue(null);

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockSuccessfulFetch({ invalidStructure: true });

      render(<Home />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("handles very large datasets", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      mockSuccessfulFetch(createMockApiResponse(1000));

      render(<Home />);

      await waitFor(() => {
        const lineChart = screen.getByTestId("line-chart");
        expect(lineChart).toHaveAttribute("data-length", "1000");
      });
    });
  });

  describe("integration", () => {
    it("renders MetricCards with data from fetch", async () => {
      mockCalculateAPY.mockReturnValue(8.5);

      const mockData = {
        data: {
          metricsSnapshots: [
            { timestamp: "1700000000", exchangeRate: "1.0567" },
          ],
        },
      };
      mockSuccessfulFetch(mockData);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("1.0567 ETH")).toBeInTheDocument();
        expect(screen.getByText("8.50%")).toBeInTheDocument();
      });
    });

    it("renders PerformanceChart with processed data", async () => {
      mockCalculateAPY.mockReturnValue(5.0);

      mockSuccessfulFetch(createMockApiResponse(15));

      render(<Home />);

      await waitFor(() => {
        const lineChart = screen.getByTestId("line-chart");
        expect(lineChart).toHaveAttribute("data-length", "15");
      });
    });

    it("complete data flow: fetch -> process -> render", async () => {
      mockCalculateAPY.mockReturnValue(6.25);

      const mockData = {
        data: {
          metricsSnapshots: [
            { timestamp: "1700000000", exchangeRate: "1.0000" },
            { timestamp: "1700086400", exchangeRate: "1.0100" },
            { timestamp: "1700172800", exchangeRate: "1.0200" },
          ],
        },
      };
      mockSuccessfulFetch(mockData);

      render(<Home />);

      // 1. Verify fetch was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // 2. Verify data is processed and displayed
      await waitFor(() => {
        // Latest exchange rate (last item)
        expect(screen.getByText("1.0200 ETH")).toBeInTheDocument();
        // APY from mock
        expect(screen.getByText("6.25%")).toBeInTheDocument();
        // Chart has correct data length
        const lineChart = screen.getByTestId("line-chart");
        expect(lineChart).toHaveAttribute("data-length", "3");
      });

      // 3. Verify calculateCurrentAPY was called with processed data
      expect(mockCalculateAPY).toHaveBeenCalled();
      const lastCall =
        mockCalculateAPY.mock.calls[mockCalculateAPY.mock.calls.length - 1][0];
      expect(lastCall.length).toBe(3);
      expect(typeof lastCall[0].timestamp).toBe("number");
      expect(typeof lastCall[0].exchangeRate).toBe("number");
    });
  });
});
