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
import { billItemsAtom } from "@/store/atom";
import { BillItem } from "@/type/types";
import { useAtom } from "jotai";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function BillItemsList() {
  const [billItems, setBillItems] = useAtom(billItemsAtom);
  const [newItem, setNewItem] = useState({ name: "", price: "" });

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const price = Number.parseFloat(newItem.price);
      if (!isNaN(price)) {
        setBillItems([
          ...billItems,
          {
            id: uuidv4(),
            name: newItem.name,
            price,
            quantity: 1,
            paidAmount: 0,
          },
        ]);
        setNewItem({ name: "", price: "" });
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof BillItem,
    value: string
  ) => {
    setBillItems(
      billItems.map((item) => {
        if (item.id === id) {
          if (field === "price") {
            const price = Number.parseFloat(value);
            return { ...item, [field]: isNaN(price) ? 0 : price };
          } else if (field === "quantity") {
            const quantity = Number.parseInt(value);
            return { ...item, [field]: isNaN(quantity) ? 0 : quantity };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const total = billItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Input
                  className="min-w-[200px]"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(item.id, "name", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="1"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(item.id, "price", e.target.value)
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(item.id, "quantity", e.target.value)
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
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
          step="1"
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
