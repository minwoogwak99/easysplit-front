"use client";

import { BillItemsList } from "@/components/bill-items-list";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/firebase";
import { createBillSession } from "@/lib/session-service";
import {
  billItemsAtom,
  billProcessStepAtom,
  currentSessionAtom,
} from "@/store/atom";
import { BillSession } from "@/type/types";
import { useAtom } from "jotai";
import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ScanBill() {
  const [billProcessStep, setbillProcessStep] = useAtom(billProcessStepAtom);
  const [billItems, setBillItems] = useAtom(billItemsAtom);
  const [, setCurrentSession] = useAtom(currentSessionAtom);
  const [sessionTitle, setSessionTitle] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  const router = useRouter();

  const handleCreateSplittingSession = async () => {
    if (billItems.length === 0) {
      setError("Please add at least one item to create a session");
      return;
    }

    setIsCreatingSession(true);
    setError(null);

    try {
      // Create a new session in Firestore
      const sessionId = await createBillSession(
        billItems,
        sessionTitle || undefined
      );

      if (user) {
        // Get the session data
        const sessionData: BillSession = {
          id: sessionId,
          createdAt: Date.now(),
          createdBy: user.uid,
          title:
            sessionTitle || `Bill Session ${new Date().toLocaleDateString()}`,
          items: billItems,
          participants: {
            [user.uid]: {
              name: user.displayName || "Session Creator",
              email: user.email || undefined,
              items: [],
              totalAmount: 0,
              isPaid: false,
            },
          },
          totalPaid: 0,
          status: "active",
        };

        // Update the atoms
        setCurrentSession(sessionData);

        router.push("/session/" + sessionId);
      } else {
        setError("You must be logged in to create a session");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsCreatingSession(false);
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
            Scan & Split Bill
          </h1>

          <Tabs value={billProcessStep} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
              <TabsTrigger value="items">Review Items</TabsTrigger>
            </TabsList>

            {/* UPLOAD STEP */}
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Receipt</CardTitle>
                  <CardDescription>
                    Take a photo of your receipt or upload an existing one.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ITEM CHECK STEP */}
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Review Items</CardTitle>
                  <CardDescription>
                    Verify the items detected from your receipt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BillItemsList />

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="session-title">
                      Session Title (Optional)
                    </Label>
                    <Input
                      id="session-title"
                      placeholder="Enter a title for this bill splitting session"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="mt-2 text-sm text-red-600">{error}</div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBillItems([]);
                      setbillProcessStep("upload");
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateSplittingSession}
                    disabled={isCreatingSession}
                  >
                    {isCreatingSession
                      ? "Creating..."
                      : "Create Splitting Session"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
