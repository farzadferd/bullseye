
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Settings, TrendingUp } from "lucide-react";

const Strategy = () => {
  const strategies = [
    {
      name: "SMA Crossover",
      description: "Simple Moving Average crossover strategy",
      status: "active",
      performance: "+12.5%",
      trades: 45,
      winRate: "67%"
    },
    {
      name: "RSI Momentum",
      description: "RSI-based momentum trading",
      status: "paused",
      performance: "+8.2%",
      trades: 32,
      winRate: "59%"
    },
    {
      name: "Bollinger Bands",
      description: "Mean reversion using Bollinger Bands",
      status: "inactive",
      performance: "-2.1%",
      trades: 18,
      winRate: "44%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Strategies</h1>
          <p className="text-gray-600">Manage and configure your automated trading strategies</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {strategies.map((strategy, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>{strategy.name}</span>
                        </CardTitle>
                        <CardDescription>{strategy.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            strategy.status === "active" ? "default" : 
                            strategy.status === "paused" ? "secondary" : "outline"
                          }
                        >
                          {strategy.status}
                        </Badge>
                        <Switch checked={strategy.status === "active"} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Performance</div>
                        <div className={`font-semibold ${
                          strategy.performance.startsWith("+") ? "text-green-600" : "text-red-600"
                        }`}>
                          {strategy.performance}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Trades</div>
                        <div className="font-semibold">{strategy.trades}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Win Rate</div>
                        <div className="font-semibold">{strategy.winRate}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm">
                          {strategy.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMA Crossover Configuration</CardTitle>
                <CardDescription>Configure the Simple Moving Average crossover strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="short-ma">Short MA Period</Label>
                    <Input id="short-ma" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="long-ma">Long MA Period</Label>
                    <Input id="long-ma" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Trading Symbol</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select symbol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AAPL">AAPL</SelectItem>
                        <SelectItem value="GOOGL">GOOGL</SelectItem>
                        <SelectItem value="TSLA">TSLA</SelectItem>
                        <SelectItem value="MSFT">MSFT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position-size">Position Size (%)</Label>
                    <Input id="position-size" placeholder="10" />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Risk Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                      <Input id="stop-loss" placeholder="2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="take-profit">Take Profit (%)</Label>
                      <Input id="take-profit" placeholder="5" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button>Save Configuration</Button>
                  <Button variant="outline">Reset to Default</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Strategy</CardTitle>
                <CardDescription>Build a custom trading strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="strategy-name">Strategy Name</Label>
                  <Input id="strategy-name" placeholder="My Custom Strategy" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy-type">Strategy Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trend">Trend Following</SelectItem>
                      <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                      <SelectItem value="momentum">Momentum</SelectItem>
                      <SelectItem value="arbitrage">Arbitrage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indicators">Technical Indicators</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["SMA", "EMA", "RSI", "MACD", "Bollinger Bands", "Stochastic"].map((indicator) => (
                      <div key={indicator} className="flex items-center space-x-2">
                        <input type="checkbox" id={indicator} />
                        <Label htmlFor={indicator}>{indicator}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Create Strategy</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Strategy;