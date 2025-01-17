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
  const timeframes = [
    { value: "1", text: "1 day" },
    { value: "7", text: "7 days" },
    { value: "30", text: "30 days" },
    { value: "90", text: "90 days" },
  ];

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
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>{tf.text}</SelectItem>
                ))}
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
