"use client";

import { BillItemsSelection } from "@/components/bill-items-selection";
import { QrCodeGenerator } from "@/components/qr-code-generator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { auth } from "@/lib/firebase";
import { endSession, markParticipantAsPaid } from "@/lib/session-service";
import { cn } from "@/lib/utils";
import { currentSessionAtom } from "@/store/atom";
import { BillItem } from "@/type/types";
import { useAtom } from "jotai";
import { CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const Page = () => {
  const { sessionid } = useParams();
  const router = useRouter();
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom);
  const [user] = useAuthState(auth);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Calculate total bill amount and remaining amount
  const calculateTotalAndRemaining = () => {
    if (!currentSession)
      return {
        total: 0,
        remaining: 0,
        percentage: 0,
        itemsPaid: 0,
        itemsTotal: 0,
      };

    const totalBillAmount = currentSession.items.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const totalPaidAmount = currentSession.items.reduce(
      (sum, item) => sum + item.paidAmount,
      0
    );

    const remainingAmount = Math.max(0, totalBillAmount - totalPaidAmount);
    const paymentPercentage =
      totalBillAmount > 0
        ? Math.min(100, Math.round((totalPaidAmount / totalBillAmount) * 100))
        : 0;

    // Calculate how many items are fully paid
    const itemsTotal = currentSession.items.length;
    const itemsPaid = currentSession.items.filter((item) =>
      isItemFullyPaid(item)
    ).length;

    return {
      total: totalBillAmount,
      remaining: remainingAmount,
      percentage: paymentPercentage,
      itemsPaid,
      itemsTotal,
    };
  };

  // Check if an item is fully paid based on paidAmount
  const isItemFullyPaid = (item: BillItem): boolean => {
    // Item is fully paid if paidAmount equals or exceeds price
    return item.paidAmount >= item.price;
  };

  // Check if the current user is the creator of the session
  const isCreator = (): boolean => {
    if (!currentSession || !user) return false;
    return currentSession.createdBy === user.uid;
  };

  // Check if the current user has already paid
  const hasUserPaid = (): boolean => {
    if (!currentSession || !user) return false;
    return currentSession.participants[user.uid]?.isPaid === true;
  };

  // Handle payment for the session creator
  const handlePayment = async () => {
    if (!user || !currentSession) return;

    try {
      setIsProcessingPayment(true);

      // Check if the user has any items to pay for
      const userItems = currentSession.participants[user.uid]?.items || [];
      if (userItems.length === 0) {
        alert("You don't have any items to pay for. Select some items first.");
        setIsProcessingPayment(false);
        return;
      }

      // Check if the user has already paid
      if (currentSession.participants[user.uid]?.isPaid) {
        alert("You have already paid for your items.");
        setIsProcessingPayment(false);
        return;
      }

      // Process the payment
      await markParticipantAsPaid(sessionid as string, user.uid);
      alert("Payment successful!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const { total, remaining, percentage, itemsPaid, itemsTotal } =
    calculateTotalAndRemaining();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share with Friends</CardTitle>
        <CardDescription>
          Share this QR code with friends to split the bill.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <QrCodeGenerator />

        <div className="border-t pt-6">
          <div className="flex justify-between pr-4">
            <h3 className="text-lg font-medium mb-4">Bill Items</h3>
            <div>
              <div className="flex -space-x-2 ml-2">
                {currentSession && (
                  <TooltipProvider>
                    {Object.entries(currentSession.participants).map(
                      ([userId, user]) => (
                        <Tooltip key={userId}>
                          <TooltipTrigger asChild>
                            <Avatar
                              className={cn(
                                "h-6 w-6 border-2 border-white",
                                user.isPaid && "border-green-500"
                              )}
                            >
                              <AvatarFallback
                                className={cn(
                                  "text-xs",
                                  user.isPaid && "bg-green-100"
                                )}
                              >
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="">
                            <p>
                              {user.name} {user.isPaid ? "(Paid)" : ""}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </TooltipProvider>
                )}
              </div>
              <div className="text-lg font-semibold">
                Your group paid total: $
                {currentSession?.items
                  .reduce((sum, item) => sum + item.paidAmount, 0)
                  .toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Payment Progress Section */}
          <div className="mb-6 border p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Payment Progress</span>
              <span className="text-sm font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2 mb-3" />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className=" p-3 rounded-md border">
                <div className="text-sm text-gray-500">Total Bill</div>
                <div className="text-lg font-bold">${total.toFixed(2)}</div>
              </div>
              <div className=" p-3 rounded-md border">
                <div className="text-sm text-gray-500">Remaining</div>
                <div
                  className={cn(
                    "text-lg font-bold",
                    remaining === 0 ? "text-green-600" : "text-amber-600"
                  )}
                >
                  ${remaining.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Items Payment Status */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2
                  className={cn(
                    "h-4 w-4 mr-2",
                    itemsPaid === itemsTotal
                      ? "text-green-500"
                      : "text-amber-500"
                  )}
                />
                <span className="text-sm">
                  {itemsPaid} of {itemsTotal} items fully paid
                </span>
              </div>

              {itemsPaid === itemsTotal && (
                <Badge className="bg-green-500">All Items Paid</Badge>
              )}
            </div>
          </div>

          <BillItemsSelection currentSessionId={sessionid as string} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {isCreator() && !hasUserPaid() && (
          <Button
            variant="outline"
            onClick={handlePayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? "Processing Payment..." : "Pay My Items"}
          </Button>
        )}
        <Button
          className={isCreator() && !hasUserPaid() ? "" : "ml-auto"}
          onClick={() => {
            endSession(sessionid as string);
            setCurrentSession(null);
            router.push("/dashboard");
          }}
        >
          End Session
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Page;
