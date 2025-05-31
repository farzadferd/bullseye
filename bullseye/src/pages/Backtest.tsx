import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Play, RotateCcw, Calendar, DollarSign, TestTube } from "lucide-react";

const Backtest = () => {
  const [strategy, setStrategy] = useState("");
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [initialCapital, setInitialCapital] = useState("10000");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  // Mock backtest data
  const mockResults = {
    totalReturn: 23.5,
    sharpeRatio: 1.34,
    maxDrawdown: -8.2,
    winRate: 65.4,
    totalTrades: 47,
    profitFactor: 1.89,
    performanceData: [
      { date: "2024-01", value: 10000, drawdown: 0 },
      { date: "2024-02", value: 10250, drawdown: -2.1 },
      { date: "2024-03", value: 9800, drawdown: -4.8 },
      { date: "2024-04", value: 11200, drawdown: 0 },
      { date: "2024-05", value: 11800, drawdown: 0 },
      { date: "2024-06", value: 12350, drawdown: -1.2 },
    ],
    monthlyReturns: [
      { month: "Jan", return: 2.5 },
      { month: "Feb", return: -4.4 },
      { month: "Mar", return: 14.3 },
      { month: "Apr", return: 5.4 },
      { month: "May", return: 4.7 },
      { month: "Jun", return: 1.2 },
    ]
  };

  const runBacktest = async () => {
    setIsRunning(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockResults);
      setIsRunning(false);
    }, 2000);
  };

  const resetBacktest = () => {
    setResults(null);
    setStrategy("");
    setSymbol("");
    setStartDate("");
    setEndDate("");
    setInitialCapital("10000");
  };

  const strategies = [
    "Moving Average Crossover",
    "RSI Mean Reversion",
    "Bollinger Bands Squeeze",
    "MACD Divergence",
    "Support/Resistance Breakout"
  ];

  const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "SPY", "QQQ"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategy Backtesting</h1>
          <p className="text-gray-600">Test your trading strategies against historical market data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Backtest Configuration</CardTitle>
              <CardDescription>Set up your strategy parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="strategy">Trading Strategy</Label>
                <Select value={strategy} onValueChange={setStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strat) => (
                      <SelectItem key={strat} value={strat}>
                        {strat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((sym) => (
                      <SelectItem key={sym} value={sym}>
                        {sym}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="capital">Initial Capital ($)</Label>
                <Input
                  id="capital"
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-4">
                <Button 
                  onClick={runBacktest} 
                  className="w-full" 
                  disabled={isRunning || !strategy || !symbol}
                >
                  {isRunning ? (
                    <>Running Backtest...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Backtest
                    </>
                  )}
                </Button>
                <Button onClick={resetBacktest} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {results ? (
              <>
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Return</p>
                          <p className="text-2xl font-bold text-green-600">+{results.totalReturn}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sharpe Ratio</p>
                          <p className="text-2xl font-bold text-blue-600">{results.sharpeRatio}</p>
                        </div>
                        <Badge variant="default" className="text-xs">Good</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Max Drawdown</p>
                          <p className="text-2xl font-bold text-red-600">{results.maxDrawdown}%</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Win Rate</p>
                          <p className="text-2xl font-bold text-green-600">{results.winRate}%</p>
                        </div>
                        <Badge variant="default" className="text-xs">High</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Trades</p>
                          <p className="text-2xl font-bold text-gray-900">{results.totalTrades}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-gray-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Profit Factor</p>
                          <p className="text-2xl font-bold text-green-600">{results.profitFactor}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                    <CardDescription>Strategy performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Portfolio Value"]} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Monthly Returns */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Returns</CardTitle>
                    <CardDescription>Month-by-month performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={results.monthlyReturns}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Return"]} />
                        <Bar 
                          dataKey="return" 
                          fill="#3b82f6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <TestTube className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to Test Your Strategy?
                      </h3>
                      <p className="text-gray-600">
                        Configure your backtest parameters and click "Run Backtest" to analyze your strategy performance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtest;