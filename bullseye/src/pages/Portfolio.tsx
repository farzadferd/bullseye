import { useState } from "react";
import Navigation from "@/components/Navigation";
import AddStockModal from "@/components/AddStockModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Trash2 } from "lucide-react";

const Portfolio = () => {
  const [holdings, setHoldings] = useState([
    { symbol: "AAPL", name: "Apple Inc.", shares: 50, price: 153.45, value: 7672.50, change: "+2.1%", allocation: 25.6 },
    { symbol: "GOOGL", name: "Alphabet Inc.", shares: 10, price: 2780.50, value: 27805.00, change: "+1.8%", allocation: 92.8 },
    { symbol: "TSLA", name: "Tesla Inc.", shares: 25, price: 243.20, value: 6080.00, change: "-0.5%", allocation: 20.3 },
    { symbol: "MSFT", name: "Microsoft Corp.", shares: 30, price: 378.90, value: 11367.00, change: "+1.2%", allocation: 38.0 },
  ]);

  const addStock = (newStock: { symbol: string; name: string; shares: number; price: number }) => {
    const value = newStock.shares * newStock.price;
    const change = (Math.random() > 0.5 ? "+" : "") + (Math.random() * 5 - 2.5).toFixed(1) + "%";
    
    setHoldings(prev => [...prev, {
      ...newStock,
      value,
      change,
      allocation: (value / (totalValue + value)) * 100
    }]);
  };

  const removeStock = (symbol: string) => {
    setHoldings(prev => prev.filter(holding => holding.symbol !== symbol));
  };

  const allocationData = holdings.map((holding, index) => ({
    name: holding.symbol,
    value: holding.allocation,
    fill: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280", "#8b5cf6"][index % 6]
  }));

  const performanceData = [
    { date: "Jan", value: 50000, benchmark: 50000 },
    { date: "Feb", value: 52000, benchmark: 51000 },
    { date: "Mar", value: 48000, benchmark: 49000 },
    { date: "Apr", value: 55000, benchmark: 52000 },
    { date: "May", value: 58000, benchmark: 53500 },
    { date: "Jun", value: 62000, benchmark: 55000 },
  ];

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
            <p className="text-gray-600">Track your investment performance and allocation</p>
          </div>
          <AddStockModal onAddStock={addStock} />
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalValue + 15000).toLocaleString()}</div>
              <div className="text-sm text-green-600">+$8,247 (+15.2%)</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Day's Change</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+$1,234</div>
              <div className="text-sm text-gray-500">+1.8% today</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cash Balance</CardTitle>
              <Percent className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15,000</div>
              <div className="text-sm text-gray-500">22.8% allocation</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Positions</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{holdings.length}</div>
              <div className="text-sm text-gray-500">Active holdings</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>Your active stock positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdings.map((holding, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-semibold">{holding.symbol}</div>
                          <div className="text-sm text-gray-600">{holding.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{holding.shares} shares</div>
                          <div className="text-sm text-gray-600">@ ${holding.price}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold">${holding.value.toLocaleString()}</div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={holding.change.startsWith("+") ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {holding.change}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStock(holding.symbol)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Portfolio Value:</span>
                    <span className="text-xl font-bold">${(totalValue + 15000).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Portfolio distribution by holdings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allocation Details</CardTitle>
                  <CardDescription>Breakdown by percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allocationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.value.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">
                            ${((item.value / 100) * (totalValue + 15000)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>6-month performance vs benchmark</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                      name="Portfolio"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#64748b" 
                      fill="#64748b" 
                      fillOpacity={0.1}
                      name="Benchmark"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">6M Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+24.0%</div>
                  <div className="text-sm text-gray-500">vs Benchmark: +10.0%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Volatility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5%</div>
                  <div className="text-sm text-gray-500">Annualized</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sharpe Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.92</div>
                  <div className="text-sm text-gray-500">Risk-adjusted</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;