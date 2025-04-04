import getMetricsSnapshotsQuery from "@/queries/metrics";

// The Graph's maximum page size
const PAGE_SIZE = 1000;

interface MetricsResponse {
  data: {
    metricsSnapshots: Array<{
      exchangeRate: string;
      timestamp: string;
    }>;
  };
}

export const fetchMetricsPage = async (
  queryUrl: string,
  startTime: number,
  skip: number,
): Promise<Array<{ exchangeRate: string; timestamp: string }>> => {
  const body = JSON.stringify({
    query: getMetricsSnapshotsQuery,
    variables: { startTime, skip },
  });
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = (await response.json()) as MetricsResponse;
  return json.data.metricsSnapshots;
};

export const fetchAllMetrics = async (
  queryUrl: string,
  startTime: number,
): Promise<Array<{ exchangeRate: string; timestamp: string }>> => {
  // Fetch first page
  const firstPage = await fetchMetricsPage(queryUrl, startTime, 0);
  let allData = [...firstPage];

  // If we got a full page, there might be more
  if (firstPage.length === PAGE_SIZE) {
    let skip = PAGE_SIZE;
    while (true) {
      const nextPage = await fetchMetricsPage(queryUrl, startTime, skip);
      if (nextPage.length === 0) break;

      allData = [...allData, ...nextPage];
      if (nextPage.length < PAGE_SIZE) break;

      skip += PAGE_SIZE;
    }
  }

  return allData;
};
