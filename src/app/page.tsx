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
      try {
        const queryUrl = "/api/metrics";
        const response = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
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
