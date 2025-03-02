"use client";

import { currentSessionAtom, currentUserAtom } from "@/store/atom";
import { BillItem } from "@/type/types";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { assignItemToUser, unassignItemFromUser } from "@/lib/session-service";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function BillItemsSelection() {
  const session = useAtomValue(currentSessionAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  if (!session || !currentUser) {
    return <div>No active session or user</div>;
  }

  const handleItemSelection = async (item: BillItem) => {
    if (!session || !currentUser) return;

    setIsUpdating({ ...isUpdating, [item.id]: true });

    try {
      const isSelected = item.assignedTo?.includes(currentUser.id);

      if (isSelected) {
        await unassignItemFromUser(session.id, item.id, currentUser.id);
      } else {
        await assignItemToUser(session.id, item.id, currentUser.id);
      }
    } catch (error) {
      console.error("Error updating item selection:", error);
    } finally {
      setIsUpdating({ ...isUpdating, [item.id]: false });
    }
  };

  // Get all participants from the session
  const participants = Object.entries(session.participants).map(([id, data]) => ({
    id,
    name: data.name,
    items: data.items,
  }));

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select items you want to pay for</h3>
      <div className="space-y-2">
        {session.items.map((item) => {
          const isSelected = item.assignedTo?.includes(currentUser.id);
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
                  disabled={isUpdating[item.id]}
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
                <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                {assignedUsers.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    <TooltipProvider>
                      {assignedUsers.map((userId) => {
                        const user = session.participants[userId];
                        if (!user) return null;
                        
                        return (
                          <Tooltip key={userId}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.name)}
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
          ${session.participants[currentUser.id]?.totalAmount.toFixed(2) || "0.00"}
        </div>
      </div>
    </div>
  );
}
