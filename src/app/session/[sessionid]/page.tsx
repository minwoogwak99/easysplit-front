"use client";

import { BillItemsSelection } from "@/components/bill-items-selection";
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
import { Share } from "lucide-react";

const page = () => {
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
          <h3 className="text-lg font-medium mb-4">Bill Items</h3>
          <BillItemsSelection />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button>
          <Share className="mr-2 h-4 w-4" />
          Share Link
        </Button>
      </CardFooter>
    </Card>
  );
};

export default page;
