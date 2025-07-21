
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface AIRecommendationsProps {
  currentPrice?: number;
}

const AIRecommendations = ({ currentPrice }: AIRecommendationsProps) => {
  console.log("AIRecommendations component loaded with currentPrice:", currentPrice);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Mock portfolio stocks - in a real app, this would come from user's portfolio
  const portfolioStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
  ];

  const generateRecommendations = async () => {
    if (!selectedStock) return;
    
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI recommendations
    const mockRecommendations = [
      {
        action: "BUY",
        confidence: 0.78,
        reason: "Strong technical momentum and positive earnings outlook",
        targetPrice: currentPrice ? Math.round(currentPrice + 15) : 165,
        timeframe: "3-6 months"
      },
      {
        action: "HOLD",
        confidence: 0.65,
        reason: "Market consolidation expected, wait for clear breakout",
        targetPrice: currentPrice ? Math.round(currentPrice + 5) : 155,
        timeframe: "1-3 months"
      },
      {
        action: "ACCUMULATE",
        confidence: 0.82,
        reason: "Oversold conditions present good entry opportunity",
        targetPrice: currentPrice ? Math.round(currentPrice + 25) : 175,
        timeframe: "6-12 months"
      }
    ];

    setRecommendations(mockRecommendations);
    setIsGenerating(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
      case "ACCUMULATE":
        return "text-green-600 bg-green-50";
      case "HOLD":
        return "text-yellow-600 bg-yellow-50";
      case "SELL":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "BUY":
      case "ACCUMULATE":
        return <TrendingUp className="h-4 w-4" />;
      case "HOLD":
        return <AlertTriangle className="h-4 w-4" />;
      case "SELL":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span>Generate AI Recommendations</span>
        </CardTitle>
        <CardDescription>Get AI-powered trading recommendations for your portfolio stocks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Stock from Portfolio
            </label>
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a stock from your portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolioStocks.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{stock.symbol}</span>
                      <span className="text-gray-500">- {stock.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateRecommendations}
            disabled={!selectedStock || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating Recommendations...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Generate AI Recommendations</span>
              </div>
            )}
          </Button>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-gray-900">
              Recommendations for {selectedStock}
            </h4>
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getActionColor(rec.action)}>
                      {getActionIcon(rec.action)}
                      {rec.action}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Confidence: {(rec.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Target: ${rec.targetPrice}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{rec.reason}</p>
                <p className="text-xs text-gray-500">Timeframe: {rec.timeframe}</p>
              </div>
            ))}
          </div>
        )}

        {recommendations.length === 0 && selectedStock && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Select a stock and click generate to get AI recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;