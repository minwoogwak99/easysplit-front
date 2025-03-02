"use client";

import { BillItemsSelection } from "@/components/bill-items-selection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import {
  joinSession,
  leaveSession,
  markParticipantAsPaid,
} from "@/lib/session-service";
import { currentSessionAtom } from "@/store/atom";
import { useAtomValue } from "jotai";
import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";

export default function JoinSession() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [user] = useAuthState(auth);
  const currentSession = useAtomValue(currentSessionAtom);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [signInWithGoogle] = useSignInWithGoogle(auth);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      console.log("error dashboard");
    }
  };

  useEffect(() => {
    const setupUser = async () => {
      if (user) {
        joinSession(sessionId, user.uid);
        const token = await user.getIdToken();
        setAuthToken(token);
        document.cookie = `authToken=${token}; path=/;`;
      }
    };

    setupUser();
  }, [user, sessionId]);

  const handleLeaveSession = async () => {
    if (!user) return;

    try {
      setIsLeaving(true);
      await leaveSession(sessionId, user.uid);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving session:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handlePayment = async () => {
    if (!user || !currentSession) return;

    try {
      setIsProcessingPayment(true);

      // Check if the user has any items to pay for
      const userItems = currentSession.participants[user.uid]?.items || [];
      if (userItems.length === 0) {
        alert("You don't have any items to pay for.");
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
      await markParticipantAsPaid(sessionId, user.uid);

      // const res = await fetch("/api/paybill", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     billSessionId: sessionId,
      //     payerId: user.uid,
      //     authToken: authToken,
      //   }),
      // });
      // const data = await res.json();
      // console.log("Payment processed:", data);

      alert("Payment successful!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
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
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Receipt className="mr-2 h-6 w-6" />
            {user ? "Pay your items" : "Join Bill Splitting Session"}
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentSession?.title || "Bill Splitting Session"}
              </CardTitle>
              <CardDescription>
                {user
                  ? "Select the items you want to pay for"
                  : "Enter your details to join this bill splitting session"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user ? (
                <Button onClick={handleGoogleSignIn}>
                  Sign in with Google
                </Button>
              ) : (
                <BillItemsSelection currentSessionId={sessionId} />
              )}
            </CardContent>
            {user && (
              <CardFooter className="flex flex-col gap-5">
                <Button
                  variant="outline"
                  onClick={handlePayment}
                  className="w-full"
                  disabled={
                    isProcessingPayment ||
                    currentSession?.participants[user.uid]?.isPaid
                  }
                >
                  {isProcessingPayment
                    ? "Processing..."
                    : currentSession?.participants[user.uid]?.isPaid
                    ? "Paid"
                    : "Pay"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLeaveSession}
                  disabled={isLeaving}
                  className="w-full"
                >
                  {isLeaving ? "Leaving..." : "Leave Session"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
