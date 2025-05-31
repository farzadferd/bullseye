
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TradingSignalsProps {
  symbol: string;
  currentPrice: number;
}

const TradingSignals = ({ symbol, currentPrice }: TradingSignalsProps) => {
  // Mock trading signals based on current price and symbol
  const getSignals = () => {
    const rsi = Math.random() * 100;
    const macd = (Math.random() - 0.5) * 2;
    const sma20 = currentPrice * (0.95 + Math.random() * 0.1);
    const sma50 = currentPrice * (0.90 + Math.random() * 0.2);

    return {
      rsi,
      macd,
      sma20,
      sma50,
      signal: rsi > 70 ? "SELL" : rsi < 30 ? "BUY" : "HOLD",
      confidence: Math.floor(Math.random() * 40) + 60
    };
  };

  const signals = getSignals();

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY": return "text-green-600";
      case "SELL": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "BUY": return <TrendingUp className="h-4 w-4" />;
      case "SELL": return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Trading Signals for {symbol}
          <Badge 
            variant={signals.signal === "BUY" ? "default" : signals.signal === "SELL" ? "destructive" : "secondary"}
            className="flex items-center space-x-1"
          >
            {getSignalIcon(signals.signal)}
            <span>{signals.signal}</span>
          </Badge>
        </CardTitle>
        <CardDescription>AI-powered trading recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">RSI</div>
              <div className="text-lg font-semibold">{signals.rsi.toFixed(1)}</div>
              <div className="text-xs text-gray-500">
                {signals.rsi > 70 ? "Overbought" : signals.rsi < 30 ? "Oversold" : "Neutral"}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">MACD</div>
              <div className="text-lg font-semibold">{signals.macd.toFixed(2)}</div>
              <div className="text-xs text-gray-500">
                {signals.macd > 0 ? "Bullish" : "Bearish"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Price:</span>
              <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">20-day SMA:</span>
              <span className={currentPrice > signals.sma20 ? "text-green-600" : "text-red-600"}>
                ${signals.sma20.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">50-day SMA:</span>
              <span className={currentPrice > signals.sma50 ? "text-green-600" : "text-red-600"}>
                ${signals.sma50.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Signal Confidence:</span>
              <span className="text-sm font-bold text-blue-900">{signals.confidence}%</span>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${signals.confidence}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            <p className="font-medium">Strategy Notes:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              {signals.signal === "BUY" && (
                <>
                  <li>RSI indicates oversold conditions</li>
                  <li>Price above key moving averages</li>
                  <li>Consider entering position with stop-loss</li>
                </>
              )}
              {signals.signal === "SELL" && (
                <>
                  <li>RSI indicates overbought conditions</li>
                  <li>Consider taking profits or reducing position</li>
                  <li>Monitor for bearish divergence</li>
                </>
              )}
              {signals.signal === "HOLD" && (
                <>
                  <li>Market in neutral territory</li>
                  <li>Wait for clearer signals</li>
                  <li>Monitor key support/resistance levels</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSignals;