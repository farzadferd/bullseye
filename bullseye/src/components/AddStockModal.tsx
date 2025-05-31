
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddStockModalProps {
  onAddStock: (stock: {
    symbol: string;
    name: string;
    shares: number;
    price: number;
  }) => void;
}

const AddStockModal = ({ onAddStock }: AddStockModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    shares: 0,
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.symbol && formData.name && formData.shares > 0 && formData.price > 0) {
      onAddStock({
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        shares: formData.shares,
        price: formData.price
      });
      setFormData({ symbol: "", name: "", shares: 0, price: 0 });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
          <DialogDescription>
            Enter the details of the stock you want to add to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="e.g., AAPL"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Apple Inc."
              required
            />
          </div>
          <div>
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: Number(e.target.value) })}
              min="1"
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Purchase Price per Share</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              min="0.01"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Stock</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockModal;