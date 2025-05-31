
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StockSelectorProps {
  selectedStock: string;
  onStockChange: (symbol: string) => void;
}

const StockSelector = ({ selectedStock, onStockChange }: StockSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const popularStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
  ];

  const filteredStocks = popularStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {filteredStocks.map((stock) => (
          <Button
            key={stock.symbol}
            variant={selectedStock === stock.symbol ? "default" : "outline"}
            size="sm"
            onClick={() => onStockChange(stock.symbol)}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-semibold">{stock.symbol}</div>
              <div className="text-xs opacity-70">{stock.name}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StockSelector;