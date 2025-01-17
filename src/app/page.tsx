"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricCards } from "@/components/metrics/MetricCards";
import { PerformanceChart } from "@/components/metrics/PerformanceChart";
import { MetricsSnapshot } from "@/types/metrics";

export default function Home() {
  const [timeframe, setTimeframe] = useState(30);
  const [data, setData] = useState<MetricsSnapshot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const dayInSeconds = 24 * 60 * 60;
      try {
        const startTime =
          Math.floor(Date.now() / 1000) - timeframe * dayInSeconds;
        const apiKey = process.env.NEXT_PUBLIC_THE_GRAPH_API_KEY;
        const queryUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/tzAqe6bWVrFZeSmLJRc9bp5i1tHic2QbnMY3kNZihUv`;
        const response = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query getMetricsSnapshots($startTime: BigInt!) {
                metricsSnapshots(
                  orderBy: timestamp
                  orderDirection: asc
                  where: { timestamp_gt: $startTime }
                ) {
                  exchangeRate
                  timestamp
                }
              }
            `,
            variables: { startTime },
          }),
        });

        const json = await response.json();
        const rawData = json.data.metricsSnapshots;

        const processedData: MetricsSnapshot[] = rawData.map(
          (snapshot: MetricsSnapshot) => ({
            timestamp: parseInt(snapshot.timestamp),
            exchangeRate: parseFloat(snapshot.exchangeRate),
          }),
        );
        setData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [timeframe]);

  const latestExchangeRate = Number(data[0]?.exchangeRate);

  return (
    <main className="p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ynETH Performance vs ETH</CardTitle>
            <Select
              value={timeframe.toString()}
              onValueChange={(tf) => setTimeframe(Number(tf))}
            >
              <SelectTrigger className="w-32">
                <SelectValue>{timeframe}d</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">24 hours</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <MetricCards exchangeRate={latestExchangeRate} />
          <PerformanceChart data={data} />
        </CardContent>
      </Card>
    </main>
  );
}
