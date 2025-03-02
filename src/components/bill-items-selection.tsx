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

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
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

  const handleItemSelection = async (item: BillItem) => {
    if (!currentSession || !user) return;

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select items you want to pay for</h3>
      <div className="space-y-2">
        {currentSession.items.map((item) => {
          const isSelected = item.assignedTo?.includes(user.uid);
          const assignedUsers = item.assignedTo || [];

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleItemSelection(item)}
                  id={`item-${item.id}`}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {item.name}
                </label>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  ${item.price.toFixed(2)}
                </span>
                {assignedUsers.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    <TooltipProvider>
                      {assignedUsers.map((userId) => {
                        const user = currentSession.participants[userId];
                        if (!user) return null;

                        return (
                          <Tooltip key={userId}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-xs">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.name}</p>
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
