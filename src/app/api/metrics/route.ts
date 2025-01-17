import { NextRequest, NextResponse } from "next/server";
import { fetchAllMetrics } from "@/services/graph";

export async function POST(request: NextRequest) {
  const { timeframe } = await request.json();
  const apiKey = process.env.THE_GRAPH_API_KEY;
  const subgraphId = "tzAqe6bWVrFZeSmLJRc9bp5i1tHic2QbnMY3kNZihUv";
  const queryUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
  const dayInSeconds = 24 * 60 * 60;
  const startTime = isNaN(timeframe)
    ? 1
    : Math.floor(Date.now() / 1000) - timeframe * dayInSeconds;
  const metricsSnapshots = await fetchAllMetrics(queryUrl, startTime);
  return NextResponse.json({ data: { metricsSnapshots } });
}
