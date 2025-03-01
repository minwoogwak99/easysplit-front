"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Receipt } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface JoinSessionParams {
  params: {
    sessionid: string;
  };
}

export default function JoinSession({ params }: JoinSessionParams) {
  const { sessionid: sessionId } = params;
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  // This would come from Firebase in a real app
  const [session, setSession] = useState({
    id: sessionId,
    billName: "Dinner at Italian Restaurant",
    date: "2024-02-25",
    amount: 120.5,
    items: [
      { id: 1, name: "Pasta Carbonara", price: 15.99, selected: false },
      { id: 2, name: "Margherita Pizza", price: 12.5, selected: false },
      { id: 3, name: "Tiramisu", price: 7.99, selected: false },
      { id: 4, name: "Sparkling Water", price: 3.5, selected: false },
      { id: 5, name: "Caesar Salad", price: 9.99, selected: false },
    ],
    participants: [
      {
        id: "user1",
        name: "John",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
  });

  const handleJoin = () => {
    if (name.trim()) {
      // In a real app, this would add the user to the Firebase session
      setJoined(true);
    }
  };

  const handleItemSelect = (itemId: number) => {
    setSession((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      ),
    }));
  };

  const selectedItems = session.items.filter((item) => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);

  // Calculate tax and tip proportionally
  const totalBeforeTaxAndTip = session.items.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const taxAndTipTotal = session.amount - totalBeforeTaxAndTip;
  const proportion = subtotal / totalBeforeTaxAndTip;
  const taxAndTipShare = taxAndTipTotal * proportion;

  const total = subtotal + taxAndTipShare;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" />
            <span>SplitSnap</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">
            Join Bill Splitting Session
          </h1>

          {!joined ? (
            <Card>
              <CardHeader>
                <CardTitle>Join &quot;{session.billName}&quot;</CardTitle>
                <CardDescription>
                  Enter your name to join this bill splitting session.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Current Participants:</h3>
                    <div className="flex flex-wrap gap-2">
                      {session.participants.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 bg-muted p-2 rounded-md"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleJoin} className="w-full">
                  Join Session
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Items</CardTitle>
                  <CardDescription>
                    Check the items you consumed from &quot;{session.billName}
                    &quot;.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={() => handleItemSelect(item.id)}
                            />
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax & Tip (proportional):</span>
                      <span>${taxAndTipShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Your Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Selection
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
