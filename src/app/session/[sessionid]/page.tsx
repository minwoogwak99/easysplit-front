"use client";

import { BillItemsSelection } from "@/components/bill-items-selection";
import { QrCodeGenerator } from "@/components/qr-code-generator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { endSession } from "@/lib/session-service";
import { cn } from "@/lib/utils";
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
            <div>
              <div className="flex -space-x-2 ml-2">
                {currentSession && (
                  <TooltipProvider>
                    {Object.entries(currentSession.participants).map(
                      ([userId, user]) => (
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
                          <TooltipContent className="">
                            <p>{user.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </TooltipProvider>
                )}
              </div>
              <div className="text-lg font-semibold">
                Your group paid total: ${currentSession?.totalPaid}
              </div>
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
