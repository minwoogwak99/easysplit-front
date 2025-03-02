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
import { endSession } from "@/lib/session-service";
import { currentSessionAtom } from "@/store/atom";
import { useAtom } from "jotai";
import { Share } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const Page = () => {
  const { sessionid } = useParams();
  const router = useRouter();
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom);

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
            <div className="text-lg font-semibold">
              Your group paid total: ${currentSession?.totalPaid}
            </div>
          </div>
          <BillItemsSelection currentSessionId={sessionid as string} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button>
          <Share className="mr-2 h-4 w-4" />
          Share Link
        </Button>
        <Button
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
