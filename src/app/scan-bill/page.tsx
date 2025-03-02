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
import { billItemsAtom, billProcessStepAtom } from "@/store/atom";
import { useAtom } from "jotai";
import { ArrowLeft, Receipt, Share } from "lucide-react";
import Link from "next/link";

export default function ScanBill() {
  const [billProcessStep, setbillProcessStep] = useAtom(billProcessStepAtom);
  const [billItems, setBillItems] = useAtom(billItemsAtom);

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
          <h2>{billItems.map((item) => item.name)}</h2>

          <Tabs value={billProcessStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
              <TabsTrigger value="items">Review Items</TabsTrigger>
              <TabsTrigger value="share">Share & Split</TabsTrigger>
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
                    onClick={() => {
                      setbillProcessStep("share");
                    }}
                  >
                    Create Splitting Session
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* SHARE CODE STEP */}
            <TabsContent value="share">
              <Card>
                <CardHeader>
                  <CardTitle>Share with Friends</CardTitle>
                  <CardDescription>
                    Share this QR code with friends to split the bill.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QrCodeGenerator />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setbillProcessStep("items")}
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
