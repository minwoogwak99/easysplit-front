"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { auth, db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { BillSession } from "@/type/types";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const SessionHistoryPage = () => {
  const { sessionid } = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [session, setSession] = useState<BillSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionid) return;

    setLoading(true);
    // Set up real-time listener for the session document
    const sessionRef = doc(db, "billSessions", sessionid as string);
    const unsubscribe = onSnapshot(
      sessionRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const sessionData = docSnapshot.data() as BillSession;
          setSession(sessionData);
        } else {
          // Session doesn't exist
          console.error("Session not found");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to session updates:", error);
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [sessionid]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading session history...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Session not found</p>
        <Button onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Calculate total bill amount
  const totalAmount = session.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="h-dvh flex items-center px-2">
      <Card className="mx-auto w-full max-w-4xl mt-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>
                Created {new Date(session.createdAt).toLocaleDateString()} •
                Status: <span className="capitalize">{session.status}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Bill Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Bill Amount:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-medium">
                    ${session.totalPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{Object.keys(session.participants).length}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Participants</h3>
              <div className="space-y-3">
                {Object.entries(session.participants).map(
                  ([userId, participant]) => (
                    <div
                      key={userId}
                      className="flex justify-between items-center p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          className={cn(
                            "h-8 w-8 border-2 border-white",
                            participant.isPaid && "border-green-500"
                          )}
                        >
                          <AvatarFallback>
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{participant.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${participant.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {participant.isPaid ? "Paid" : "Unpaid"}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Bill Items</h3>
            <div className="space-y-2">
              {session.items.map((item) => {
                const assignedUsers = item.assignedTo || [];

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        ${item.price.toFixed(2)}
                      </span>
                      {assignedUsers.length > 0 && (
                        <div className="flex -space-x-2">
                          <TooltipProvider>
                            {assignedUsers.map((userId) => {
                              const user = session.participants[userId];
                              if (!user) return null;

                              return (
                                <Tooltip key={userId}>
                                  <TooltipTrigger asChild>
                                    <Avatar
                                      className={cn(
                                        "h-6 w-6 border-2 border-white",
                                        user.isPaid && "border-green-500"
                                      )}
                                    >
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionHistoryPage;
