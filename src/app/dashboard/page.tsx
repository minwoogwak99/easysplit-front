"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, Receipt, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [recentBills, setRecentBills] = useState([
    {
      id: "bill-1",
      name: "Dinner at Italian Restaurant",
      date: "2024-02-25",
      amount: 120.5,
      participants: 4,
    },
    {
      id: "bill-2",
      name: "Lunch with Team",
      date: "2024-02-20",
      amount: 85.75,
      participants: 6,
    },
    {
      id: "bill-3",
      name: "Coffee Meeting",
      date: "2024-02-15",
      amount: 32.4,
      participants: 3,
    },
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" />
            <span>SplitSnap</span>
          </Link>
          <nav className="ml-auto flex gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Link href="/logout">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Link href="/scan-bill">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Scan New Bill
                </Button>
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Recent Bills</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentBills.map((bill) => (
                  <Card key={bill.id}>
                    <CardHeader>
                      <CardTitle>{bill.name}</CardTitle>
                      <CardDescription>
                        {new Date(bill.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">
                          ${bill.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span>{bill.participants}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/bills/${bill.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
