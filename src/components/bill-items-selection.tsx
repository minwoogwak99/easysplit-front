"use client";

import { useEffect } from "react";

import { auth, db } from "@/lib/firebase";
import { assignItemToUser, unassignItemFromUser } from "@/lib/session-service";
import { currentSessionAtom } from "@/store/atom";
import { BillItem, BillSession } from "@/type/types";
import { doc, onSnapshot } from "firebase/firestore";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

import { CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface BillItemsSelectionProps {
  currentSessionId: string;
}

export function BillItemsSelection({
  currentSessionId,
}: BillItemsSelectionProps) {
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom);
  const [user] = useAuthState(auth);

  const router = useRouter();

  useEffect(() => {
    // Set up real-time listener for the session document
    const sessionRef = doc(db, "billSessions", currentSessionId);
    const unsubscribe = onSnapshot(
      sessionRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const sessionData = docSnapshot.data() as BillSession;
          if (sessionData.status === "completed") {
            router.push("/dashboard");
            setCurrentSession(null);
          }
          setCurrentSession(sessionData);
        }
      },
      (error) => {
        console.error("Error listening to session updates:", error);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  if (!currentSession || !user) {
    return (
      <div className="flex gap-3">
        <div>No active session or user</div>
        <div>{currentSession?.id}</div>
        <Button
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Go Home
        </Button>
      </div>
    );
  }

  const userHasPaid = currentSession.participants[user.uid]?.isPaid;

  // Check if an item is fully paid based on paidAmount
  const isItemFullyPaid = (item: BillItem): boolean => {
    // Item is fully paid if paidAmount equals or exceeds price
    return item.paidAmount >= item.price;
  };

  // Calculate payment progress percentage for an item
  const getItemPaymentProgress = (item: BillItem): number => {
    if (item.price === 0) return 100;
    return Math.min(100, Math.round((item.paidAmount / item.price) * 100));
  };

  // Calculate how many users have paid for an item
  const getItemPaymentStatus = (
    item: BillItem
  ): { paid: number; total: number } => {
    if (!item.assignedTo || item.assignedTo.length === 0) {
      return { paid: 0, total: 0 };
    }

    const paidUsers = item.assignedTo.filter(
      (userId) => currentSession.participants[userId]?.isPaid === true
    ).length;

    return {
      paid: paidUsers,
      total: item.assignedTo.length,
    };
  };

  const handleItemSelection = async (item: BillItem) => {
    if (!currentSession || !user || userHasPaid || isItemFullyPaid(item))
      return;

    try {
      const isSelected = item.assignedTo?.includes(user.uid);

      if (isSelected) {
        await unassignItemFromUser(currentSession.id, item.id, user.uid);
      } else {
        await assignItemToUser(currentSession.id, item.id, user.uid);
      }
    } catch (error) {
      console.error("Error updating item selection:", error);
    }
  };

  if (userHasPaid) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Your Selected Items</h3>
          <Badge className="bg-green-500">Payment Completed</Badge>
        </div>

        <Card className="border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mr-2" />
              <div className="text-lg font-medium text-green-700">
                Thank you for your payment!
              </div>
            </div>

            <div className="space-y-2">
              {currentSession.items
                .filter((item) => item.assignedTo?.includes(user.uid))
                .map((item) => {
                  const fullyPaid = isItemFullyPaid(item);
                  const { paid, total } = getItemPaymentStatus(item);
                  const paymentProgress = getItemPaymentProgress(item);

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-wrap items-center justify-between p-3 border rounded-md ${
                        fullyPaid ? "bg-green-50" : "bg-green-50/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{item.name}</span>
                        {fullyPaid && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs border-green-500 text-green-700"
                          >
                            Fully Paid
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col items-end ml-auto">
                        <span className="text-sm font-medium">
                          $
                          {(
                            item.price / (item.assignedTo?.length || 1)
                          ).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ${item.paidAmount.toFixed(2)} / $
                          {item.price.toFixed(2)} ({paymentProgress}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Your Total (Paid)</h3>
          <div className="text-2xl font-bold text-green-600">
            $
            {currentSession.participants[user.uid]?.totalAmount.toFixed(2) ||
              "0.00"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select items you want to pay for</h3>
      <div className="space-y-2">
        {currentSession.items.map((item) => {
          const isSelected = item.assignedTo?.includes(user.uid);
          const assignedUsers = item.assignedTo || [];
          const fullyPaid = isItemFullyPaid(item);
          const { paid, total } = getItemPaymentStatus(item);
          const paymentProgress = getItemPaymentProgress(item);

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 border rounded-md ${
                fullyPaid
                  ? "bg-green-50 border-green-200"
                  : isSelected
                  ? "bg-blue-50/30 border-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                {fullyPaid ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleItemSelection(item)}
                    id={`item-${item.id}`}
                    disabled={fullyPaid}
                  />
                )}
                <label
                  htmlFor={`item-${item.id}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    fullyPaid ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  {item.name}
                </label>

                {fullyPaid && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs border-green-500 text-green-700"
                  >
                    Fully Paid
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">
                    ${item.price.toFixed(2)}
                  </span>
                  {paymentProgress > 0 && (
                    <span className="text-xs text-gray-500">
                      ${item.paidAmount.toFixed(2)} paid ({paymentProgress}%)
                    </span>
                  )}
                </div>

                {assignedUsers.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    <TooltipProvider>
                      {assignedUsers.map((userId) => {
                        const participant = currentSession.participants[userId];
                        if (!participant) return null;

                        const isPaid = participant.isPaid;

                        return (
                          <Tooltip key={userId}>
                            <TooltipTrigger asChild>
                              <Avatar
                                className={`h-6 w-6 border-2 ${
                                  isPaid ? "border-green-500" : "border-white"
                                }`}
                              >
                                <AvatarFallback
                                  className={`text-xs ${
                                    isPaid ? "bg-green-100" : ""
                                  }`}
                                >
                                  {participant.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {participant.name} {isPaid ? "(Paid)" : ""}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Your Total</h3>
        <div className="text-2xl font-bold">
          $
          {currentSession.participants[user.uid]?.totalAmount.toFixed(2) ||
            "0.00"}
        </div>
      </div>
    </div>
  );
}
