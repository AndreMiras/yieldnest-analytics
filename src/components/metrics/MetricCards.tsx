import { Card, CardContent } from "@/components/ui/card";

interface MetricCardsProps {
  exchangeRate: number | undefined;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ exchangeRate }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{exchangeRate?.toFixed(4)} ETH</div>
        <div className="text-sm text-muted-foreground">
          Current Exchange Rate
        </div>
      </CardContent>
    </Card>
  </div>
);
