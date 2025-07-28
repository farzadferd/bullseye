import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import AddStockModal from "@/components/AddStockModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Trash2, Edit3, Check, X } from "lucide-react";
import { toast } from 'sonner'; // Assuming you have shadcn/ui toast component for notifications

// --- API Service (You might want to put this in a separate file like `src/services/api.ts`) ---
const API_BASE_URL = "http://localhost:8000"; // Adjust if your backend runs on a different port/URL

// Helper to get the auth token (replace with your actual auth logic)
const getAuthToken = () => {
    // This is a placeholder. In a real app, you'd get this from localStorage, a context, or a state management solution.
    // Make sure your backend authentication expects "Bearer YOUR_TOKEN"
    const token = localStorage.getItem('access_token'); // Example: store token after login
    return token ? `Bearer ${token}` : '';
};

const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
    };

    const config: RequestInit = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API Error: ${response.statusText}`);
    }

    return response.json();
};

// --- End API Service ---


interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  change: number; // Assuming change will be a number now
  percent_change: number; // Assuming percent_change will be a number now
  value: number;
  error?: string; // For handling API errors on individual stock fetches
}

const Portfolio = () => {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [tempCashValue, setTempCashValue] = useState('');
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [tempStockData, setTempStockData] = useState({ shares: '', price: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Portfolio Data ---
  const fetchPortfolioData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const portfolioResponse: StockHolding[] = await apiCall("/portfolio");
      setHoldings(portfolioResponse);

      const cashResponse: { cash_balance: number } = await apiCall("/portfolio/cash");
      setCashBalance(cashResponse.cash_balance);
      setTempCashValue(cashResponse.cash_balance.toString()); // Initialize temp value

    } catch (err: any) {
      console.error("Failed to fetch portfolio data:", err);
      setError(err.message || "Failed to load portfolio data.");
      toast.error("Failed to load portfolio data", { description: err.message || "Please try again later." });
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies for initial load

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);


  // --- API Calls for Actions ---

  const addStock = async (newStock: { symbol: string; name: string; shares: number; price: number }) => {
    try {
      // Backend's add_stock function expects StockCreate schema, which has symbol, name, shares.
      // The price is fetched by the backend itself using AlphaVantageService.
      const stockToAdd = {
        symbol: newStock.symbol,
        name: newStock.name,
        shares: newStock.shares,
      };
      await apiCall("/portfolio/add", "POST", stockToAdd);
      toast.success("Stock added successfully!");
      fetchPortfolioData(); // Refresh data after adding
    } catch (err: any) {
      console.error("Failed to add stock:", err);
      toast.error("Failed to add stock", { description: err.message || "Could not add stock." });
    }
  };

  const removeStock = async (symbol: string) => {
    try {
      await apiCall(`/portfolio/remove/${symbol}`, "DELETE");
      toast.success(`${symbol} removed from portfolio!`);
      fetchPortfolioData(); // Refresh data after removing
    } catch (err: any) {
      console.error("Failed to remove stock:", err);
      toast.error("Failed to remove stock", { description: err.message || "Could not remove stock." });
    }
  };

  const handleSaveCash = async () => {
    const newValue = parseFloat(tempCashValue);
    if (isNaN(newValue) || newValue < 0) {
      toast.error("Invalid cash amount", { description: "Please enter a non-negative number." });
      return;
    }

    try {
      // Backend expects a JSON body like {"amount": value}
      await apiCall("/portfolio/cash", "POST", { amount: newValue - cashBalance }); // Send the change in cash
      setCashBalance(newValue); // Update optimistic UI first
      toast.success("Cash balance updated!");
    } catch (err: any) {
      console.error("Failed to update cash balance:", err);
      toast.error("Failed to update cash balance", { description: err.message || "Please try again." });
      setCashBalance(parseFloat(tempCashValue)); // Revert if API fails
    } finally {
      setIsEditingCash(false);
    }
  };

  const handleEditCash = () => {
    setIsEditingCash(true);
    setTempCashValue(cashBalance.toString());
  };

  const handleCancelCash = () => {
    setTempCashValue(cashBalance.toString());
    setIsEditingCash(false);
  };

  const handleEditStock = (symbol: string) => {
    const stock = holdings.find(h => h.symbol === symbol);
    if (stock) {
      setEditingStock(symbol);
      setTempStockData({
        shares: stock.shares.toString(),
        price: stock.price.toString()
      });
    }
  };

  const handleSaveStock = async () => {
    if (!editingStock) return;

    const shares = parseFloat(tempStockData.shares);
    const price = parseFloat(tempStockData.price);

    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) {
      toast.error("Invalid input", { description: "Shares and price must be positive numbers." });
      return;
    }

    try {
      // Backend expects StockUpdate schema: symbol, shares, price
      await apiCall("/portfolio/update", "PUT", {
        symbol: editingStock,
        shares: shares,
        price: price // This "price" here is intended as the new "purchase_price" or cost basis for update
      });
      toast.success(`${editingStock} updated successfully!`);
      setEditingStock(null);
      fetchPortfolioData(); // Refresh data after updating
    } catch (err: any) {
      console.error("Failed to update stock:", err);
      toast.error("Failed to update stock", { description: err.message || "Could not update stock." });
    } finally {
      setTempStockData({ shares: '', price: '' });
    }
  };

  const handleCancelStock = () => {
    setEditingStock(null);
    setTempStockData({ shares: '', price: '' });
  };

  // --- Calculations (derived state) ---
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalPortfolioValue = totalValue + cashBalance;

  // Filter out holdings with errors for allocation data, or handle them gracefully
  const validHoldings = holdings.filter(h => !h.error && h.value > 0);

  const allocationData = validHoldings.map((holding, index) => ({
    name: holding.symbol,
    value: (holding.value / totalPortfolioValue) * 100,
    fill: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280", "#8b5cf6"][index % 6]
  }));

  // Mock performance data remains as backend doesn't provide it yet
  const performanceData = [
    { date: "Jan", value: 50000, benchmark: 50000 },
    { date: "Feb", value: 52000, benchmark: 51000 },
    { date: "Mar", value: 48000, benchmark: 49000 },
    { date: "Apr", value: 55000, benchmark: 52000 },
    { date: "May", value: 58000, benchmark: 53500 },
    { date: "Jun", value: 62000, benchmark: 55000 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700">Loading portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

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
              <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
              {/* Daily change from backend data is needed for accuracy here */}
              <div className="text-sm text-gray-500">Day's change not available from current backend response</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Day's Change</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
               {/* This needs to be calculated from backend data */}
              <div className="text-2xl font-bold text-gray-600">N/A</div>
              <div className="text-sm text-gray-500">Requires more backend data</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cash Balance</CardTitle>
              <div className="flex items-center space-x-2">
                {!isEditingCash && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditCash}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
                <Percent className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isEditingCash ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">$</span>
                    <Input
                      type="number"
                      value={tempCashValue}
                      onChange={(e) => setTempCashValue(e.target.value)}
                      className="text-lg font-bold h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveCash}
                      className="h-6 px-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelCash}
                      className="h-6 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold">${cashBalance.toLocaleString()}</div>
              )}
              <div className="text-sm text-gray-500">
                {((cashBalance / totalPortfolioValue) * 100).toFixed(1)}% allocation
              </div>
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
                  {holdings.length === 0 ? (
                    <p className="text-center text-gray-500">No holdings in your portfolio. Add a stock to get started!</p>
                  ) : (
                    holdings.map((holding) => (
                      <div key={holding.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        {holding.error ? (
                            <div className="flex items-center space-x-4 w-full">
                                <div className="font-semibold">{holding.symbol}</div>
                                <div className="text-sm text-red-500">Error: {holding.error}</div>
                                <div className="ml-auto">
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
                        ) : (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <div className="font-semibold">{holding.symbol}</div>
                                        <div className="text-sm text-gray-600">{holding.name}</div>
                                    </div>
                                    <div className="text-right w-32">
                                        {editingStock === holding.symbol ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Input
                                                        type="number"
                                                        value={tempStockData.shares}
                                                        onChange={(e) => setTempStockData(prev => ({ ...prev, shares: e.target.value }))}
                                                        className="w-20 h-7 text-sm text-right"
                                                        min="0"
                                                        step="any"
                                                    />
                                                    <span className="text-xs text-gray-600 w-12">shares</span>
                                                </div>
                                                <div className="flex items-center justify-end space-x-1">
                                                    <span className="text-xs text-gray-600">@</span>
                                                    <Input
                                                        type="number"
                                                        value={tempStockData.price}
                                                        onChange={(e) => setTempStockData(prev => ({ ...prev, price: e.target.value }))}
                                                        className="w-20 h-7 text-sm text-right"
                                                        min="0"
                                                        step="any"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-sm text-gray-600">{holding.shares} shares</div>
                                                <div className="text-sm text-gray-600">@ ${holding.price.toFixed(2)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {editingStock === holding.symbol ? (
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSaveStock}
                                                className="h-8 px-3 text-green-600 hover:text-green-700"
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelStock}
                                                className="h-8 px-3 text-gray-600 hover:text-gray-700"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-right">
                                                <div className="font-semibold">${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Badge
                                                        variant={holding.percent_change >= 0 ? "default" : "destructive"}
                                                        className="text-xs"
                                                    >
                                                        {holding.percent_change >= 0 ? "+" : ""}{holding.percent_change.toFixed(2)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditStock(holding.symbol)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeStock(holding.symbol)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Portfolio Value:</span>
                    <span className="text-xl font-bold">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                  {validHoldings.length === 0 ? (
                      <p className="text-center text-gray-500 py-10">No valid holdings to display allocation.</p>
                  ) : (
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
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allocation Details</CardTitle>
                  <CardDescription>Breakdown by percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allocationData.length === 0 ? (
                        <p className="text-center text-gray-500">No allocation details to display.</p>
                    ) : (
                        allocationData.map((item, index) => (
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
                                        ${((item.value / 100) * totalPortfolioValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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