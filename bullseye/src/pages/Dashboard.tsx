
import { useState } from "react";
import Navigation from "@/components/Navigation";
import StockSelector from "@/components/StockSelector";
import TradingSignals from "@/components/TradingSignals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import AIRecommendations from "./AIRecommendations";

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState("AAPL");

  // Mock data that changes based on selected stock
  const getStockData = (symbol: string) => {
    const basePrice = {
      "AAPL": 150,
      "GOOGL": 2780,
      "MSFT": 378,
      "TSLA": 243,
      "AMZN": 3100,
      "NVDA": 450
    }[symbol] || 150;

    return {
      currentPrice: basePrice + (Math.random() - 0.5) * 10,
      priceData: Array.from({ length: 6 }, (_, i) => ({
        time: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"][i],
        price: basePrice + (Math.random() - 0.5) * 20 + i * 2
      }))
    };
  };

  const stockData = getStockData(selectedStock);

  const portfolioData = [
    { date: "Jan", value: 10000 },
    { date: "Feb", value: 10500 },
    { date: "Mar", value: 10200 },
    { date: "Apr", value: 11800 },
    { date: "May", value: 12500 },
    { date: "Jun", value: 13200 },
  ];

  const stats = [
    {
      title: "Portfolio Value",
      value: "$13,247.50",
      change: "+8.2%",
      changeType: "positive",
      icon: DollarSign
    },
    {
      title: "Today's P&L",
      value: "+$234.80",
      change: "+1.8%",
      changeType: "positive",
      icon: TrendingUp
    },
    {
      title: "Active Positions",
      value: "7",
      change: "+2",
      changeType: "positive",
      icon: Activity
    },
    {
      title: "Win Rate",
      value: "67.3%",
      change: "-2.1%",
      changeType: "negative",
      icon: TrendingDown
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Dashboard</h1>
          <p className="text-gray-600">Monitor your trading performance and market data</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center mt-1">
                    <Badge 
                      variant={stat.changeType === "positive" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and AI Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Portfolio Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>6-month portfolio value trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Value"]} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Live Price Feed with Stock Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Live Price Feed - {selectedStock}</CardTitle>
              <CardDescription>Real-time market data for selected stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <StockSelector 
                  selectedStock={selectedStock}
                  onStockChange={setSelectedStock}
                />
              </div>
              <div className="mb-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${stockData.currentPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Current Price</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stockData.priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <AIRecommendations 
            currentPrice={stockData.currentPrice}
          />
        </div>

        {/* Active Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Positions</CardTitle>
            <CardDescription>Currently open trading positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { symbol: "AAPL", side: "LONG", quantity: 50, entry: 150.25, current: 153.45, pnl: "+$160.00" },
                { symbol: "GOOGL", side: "LONG", quantity: 10, entry: 2750.00, current: 2780.50, pnl: "+$305.00" },
                { symbol: "TSLA", side: "SHORT", quantity: 25, entry: 245.80, current: 243.20, pnl: "+$65.00" },
              ].map((position, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-semibold">{position.symbol}</div>
                      <div className="text-sm text-gray-600">{position.quantity} shares</div>
                    </div>
                    <Badge variant={position.side === "LONG" ? "default" : "destructive"}>
                      {position.side}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Entry: ${position.entry} → Current: ${position.current}
                    </div>
                    <div className="font-semibold text-green-600">{position.pnl}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;