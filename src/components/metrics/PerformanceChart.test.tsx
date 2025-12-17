import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PerformanceChart } from "./PerformanceChart";
import { MetricsSnapshot } from "@/types/metrics";

const SECONDS_PER_DAY = 24 * 60 * 60;
const BASE_TIMESTAMP = Math.floor(
  new Date("2023-11-14T00:00:00Z").getTime() / 1000,
);

// Mock recharts to avoid ResponsiveContainer dimension issues in jsdom
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

const createMockData = (count: number): MetricsSnapshot[] =>
  Array.from({ length: count }, (_, i) => ({
    exchangeRate: (1.0 + i * 0.001).toString(),
    timestamp: (BASE_TIMESTAMP + i * SECONDS_PER_DAY).toString(),
  }));

describe("PerformanceChart", () => {
  describe("container structure", () => {
    it("renders with correct height class", () => {
      const { container } = render(<PerformanceChart data={[]} />);

      const chartContainer = container.querySelector(".h-\\[400px\\]");
      expect(chartContainer).toBeInTheDocument();
    });

    it("renders ResponsiveContainer", () => {
      render(<PerformanceChart data={[]} />);

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("renders LineChart", () => {
      render(<PerformanceChart data={[]} />);

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("chart components", () => {
    it("renders CartesianGrid", () => {
      render(<PerformanceChart data={[]} />);

      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("renders XAxis with timestamp dataKey", () => {
      render(<PerformanceChart data={[]} />);

      const xAxis = screen.getByTestId("x-axis");
      expect(xAxis).toBeInTheDocument();
      expect(xAxis).toHaveAttribute("data-key", "timestamp");
    });

    it("renders YAxis with exchange axis id", () => {
      render(<PerformanceChart data={[]} />);

      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toBeInTheDocument();
      expect(yAxis).toHaveAttribute("data-axis-id", "exchange");
    });

    it("renders Tooltip", () => {
      render(<PerformanceChart data={[]} />);

      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("renders Legend", () => {
      render(<PerformanceChart data={[]} />);

      expect(screen.getByTestId("legend")).toBeInTheDocument();
    });

    it("renders Line with exchangeRate dataKey", () => {
      render(<PerformanceChart data={[]} />);

      const line = screen.getByTestId("line");
      expect(line).toBeInTheDocument();
      expect(line).toHaveAttribute("data-key", "exchangeRate");
      expect(line).toHaveAttribute("data-name", "Exchange Rate");
    });
  });

  describe("data handling", () => {
    it("passes data to LineChart", () => {
      const data = createMockData(5);
      render(<PerformanceChart data={data} />);

      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-length", "5");
    });

    it("handles empty data array", () => {
      render(<PerformanceChart data={[]} />);

      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-length", "0");
    });

    it("handles large data sets", () => {
      const data = createMockData(1000);
      render(<PerformanceChart data={data} />);

      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-length", "1000");
    });
  });
});
