"use client";

import { BillItemsList } from "@/components/bill-items-list";
import { ImageUploader } from "@/components/image-uploader";
import { QrCodeGenerator } from "@/components/qr-code-generator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Receipt, Share } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ScanBill() {
  const [currentStep, setCurrentStep] = useState("upload");
  const [billItems, setBillItems] = useState([]);
  const [sessionId, setSessionId] = useState("");

  const handleImageProcessed = (items) => {
    // This would be called after the server processes the image
    setBillItems(items);
    setCurrentStep("items");
  };

  const handleCreateSession = () => {
    // This would create a session in Firebase
    const newSessionId =
      "session-" + Math.random().toString(36).substring(2, 9);
    setSessionId(newSessionId);
    setCurrentStep("share");
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

          <Tabs value={currentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
              <TabsTrigger value="items">Review Items</TabsTrigger>
              <TabsTrigger value="share">Share & Split</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Receipt</CardTitle>
                  <CardDescription>
                    Take a photo of your receipt or upload an existing one.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader onImageProcessed={handleImageProcessed} />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Review Items</CardTitle>
                  <CardDescription>
                    Verify the items detected from your receipt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BillItemsList items={billItems} />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("upload")}
                  >
                    Back
                  </Button>
                  <Button onClick={handleCreateSession}>
                    Create Splitting Session
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="share">
              <Card>
                <CardHeader>
                  <CardTitle>Share with Friends</CardTitle>
                  <CardDescription>
                    Share this QR code with friends to split the bill.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <QrCodeGenerator sessionId={sessionId} />
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Session ID: {sessionId}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("items")}
                  >
                    Back
                  </Button>
                  <Button>
                    <Share className="mr-2 h-4 w-4" />
                    Share Link
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
