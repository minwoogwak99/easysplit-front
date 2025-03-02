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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBillSession, joinBillSession } from "@/lib/session-service";
import { currentSessionAtom, currentUserAtom } from "@/store/atom";
import { BillSession } from "@/type/types";
import { useSetAtom } from "jotai";
import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinSession() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<BillSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const setCurrentSession = useSetAtom(currentSessionAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const sessionData = await getBillSession(sessionId);

        if (!sessionData) {
          setError("Session not found");
        } else if (sessionData.status !== "active") {
          setError("This session is no longer active");
        } else {
          setSession(sessionData);
          setCurrentSession(sessionData);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, setCurrentSession]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    try {
      setJoining(true);
      const participant = await joinBillSession(session.id, name, email);
      setCurrentUser(participant);
      setJoined(true);
    } catch (error) {
      console.error("Error joining session:", error);
      setError("Failed to join session");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
            Join Bill Splitting Session
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>
                {session?.title || "Bill Splitting Session"}
              </CardTitle>
              <CardDescription>
                {joined
                  ? "Select the items you want to pay for"
                  : "Enter your details to join this bill splitting session"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!joined ? (
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={joining}>
                    {joining ? "Joining..." : "Join Session"}
                  </Button>
                </form>
              ) : (
                <BillItemsSelection />
              )}
            </CardContent>
            {joined && (
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Done
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
