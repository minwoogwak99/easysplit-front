"use client";

import { QrCodeGenerator } from "@/components/qr-code-generator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, QrCode, Share, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BillDetails({ params }) {
  const { id } = params;

  // This would come from Firebase in a real app
  const [bill, setBill] = useState({
    id,
    name: "Dinner at Italian Restaurant",
    date: "2024-02-25",
    amount: 120.5,
    tax: 10.5,
    tip: 18.0,
    status: "active",
    items: [
      { id: 1, name: "Pasta Carbonara", price: 15.99, assignedTo: "user1" },
      { id: 2, name: "Margherita Pizza", price: 12.5, assignedTo: "user2" },
      { id: 3, name: "Tiramisu", price: 7.99, assignedTo: "user1" },
      { id: 4, name: "Sparkling Water", price: 3.5, assignedTo: null },
      { id: 5, name: "Caesar Salad", price: 9.99, assignedTo: "user2" },
    ],
    participants: [
      {
        id: "user1",
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        paid: true,
      },
      {
        id: "user2",
        name: "Alex",
        avatar: "/placeholder.svg?height=40&width=40",
        paid: false,
      },
    ],
  });

  const [showQrCode, setShowQrCode] = useState(false);

  const getTotalByUser = (userId) => {
    const items = bill.items.filter((item) => item.assignedTo === userId);
    const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);

    // Calculate proportional tax and tip
    const proportion = itemsTotal / (bill.amount - bill.tax - bill.tip);
    const taxShare = bill.tax * proportion;
    const tipShare = bill.tip * proportion;

    return {
      items: itemsTotal,
      tax: taxShare,
      tip: tipShare,
      total: itemsTotal + taxShare + tipShare,
    };
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{bill.name}</h1>
            <Badge variant={bill.status === "active" ? "default" : "secondary"}>
              {bill.status === "active" ? "Active" : "Completed"}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bill Details</CardTitle>
                <CardDescription>
                  {new Date(bill.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      ${(bill.amount - bill.tax - bill.tip).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${bill.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${bill.tip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>${bill.amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={() => setShowQrCode(!showQrCode)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  {showQrCode ? "Hide QR Code" : "Show QR Code"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>People sharing this bill</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bill.participants.map((user) => {
                    const userTotal = getTotalByUser(user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              ${userTotal.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={user.paid ? "success" : "outline"}>
                          {user.paid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Invite More People
                </Button>
              </CardFooter>
            </Card>
          </div>

          {showQrCode && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Share Bill</CardTitle>
                <CardDescription>
                  Share this QR code with friends to join the bill splitting
                  session.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <QrCodeGenerator sessionId={id} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>
                  <Share className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
              <CardDescription>All items from the receipt</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.assignedTo ? (
                          bill.participants.find(
                            (p) => p.id === item.assignedTo
                          )?.name || "Unknown"
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
