"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";

interface BillItem {
  name: string;
  price: number;
  quantity: number;
}

interface BillItemsListProps {
  items: BillItem[];
}

export function BillItemsList({ items: initialItems }: BillItemsListProps) {
  const [items, setItems] = useState<BillItem[]>(initialItems || []);
  const [newItem, setNewItem] = useState({ name: "", price: "" });

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const price = Number.parseFloat(newItem.price);
      if (!isNaN(price)) {
        setItems([
          ...items,
          {
            name: newItem.name,
            price,
            quantity: 1,
          },
        ]);
        setNewItem({ name: "", price: "" });
      }
    }
  };

  const handleRemoveItem = (name: string) => {
    setItems(items.filter((item) => item.name !== name));
  };

  const handleItemChange = (
    name: string,
    field: keyof BillItem,
    value: string
  ) => {
    setItems(
      items.map((item) => {
        if (item.name === name) {
          if (field === "price") {
            const price = Number.parseFloat(value);
            return { ...item, [field]: isNaN(price) ? 0 : price };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.name}>
              <TableCell>
                <Input
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(item.name, "name", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(item.name, "price", e.target.value)
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(item.name)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <Input
          placeholder="Price"
          type="number"
          step="0.01"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          className="w-24"
        />
        <Button onClick={handleAddItem} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between font-medium text-lg pt-4 border-t">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
