import { NextRequest, NextResponse } from "next/server";
import { fetchAllMetrics } from "@/services/graph";

export async function POST(request: NextRequest) {
  const apiKey = process.env.THE_GRAPH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "THE_GRAPH_API_KEY environment variable is not configured" },
      { status: 503 },
    );
  }

  const { timeframe } = await request.json();
  const subgraphId = "tzAqe6bWVrFZeSmLJRc9bp5i1tHic2QbnMY3kNZihUv";
  const queryUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
  const dayInSeconds = 24 * 60 * 60;
  const startTime = isNaN(timeframe)
    ? 1
    : Math.floor(Date.now() / 1000) - timeframe * dayInSeconds;

  try {
    const metricsSnapshots = await fetchAllMetrics(queryUrl, startTime);
    return NextResponse.json({ data: { metricsSnapshots } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error fetching metrics";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
