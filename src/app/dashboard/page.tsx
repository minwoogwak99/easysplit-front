"use client";

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
import { auth } from "@/lib/firebase";
import { getUserSessions } from "@/lib/session-service";
import { BillSession } from "@/type/types";
import { Receipt, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [createdSessions, setCreatedSessions] = useState<BillSession[]>([]);
  const [participantSessions, setParticipantSessions] = useState<BillSession[]>(
    []
  );
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const router = useRouter();
  const [signOut] = useSignOut(auth);

  useEffect(() => {
    // Fetch user sessions when user is authenticated
    if (user) {
      const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
          const { createdSessions: created, participantSessions: joined } =
            await getUserSessions(user.uid);

          setCreatedSessions(created);
          setParticipantSessions(joined);
        } catch (error) {
          console.error("Error fetching sessions:", error);
        } finally {
          setSessionsLoading(false);
        }
      };

      fetchSessions();
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  };

  // Helper function to render session cards
  const renderSessionCards = (sessions: BillSession[]) => {
    if (sessions.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No active sessions</h3>
          <p className="text-gray-500 mb-4">
            {" You don't have any active bill splitting sessions."}
          </p>
          <Link href="/scan-bill">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Scan a bill to get started
            </Button>
          </Link>
        </div>
      );
    }

    // Sort sessions by date (recent to older)
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedSessions.map((session) => {
          // Calculate total bill amount
          const totalAmount = session.items.reduce(
            (sum, item) => sum + item.price,
            0
          );

          // Count participants
          const participantCount = Object.keys(session.participants).length;

          return (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>
                  Created {new Date(session.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{participantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{session.status}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/session-history/${session.id}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    View History
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" />
            <span>EasySplit</span>
          </Link>
          <Link
            onClick={handleLogout}
            href="/"
            className="flex items-center gap-2 font-semibold ml-auto"
          >
            <span>Logout</span>
          </Link>
        </div>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Link href="/scan-bill">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Scan New Bill
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Sessions</TabsTrigger>
                <TabsTrigger value="created">Created by Me</TabsTrigger>
                <TabsTrigger value="joined">Joined Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Active Bill Sessions
                  </h2>
                  {sessionsLoading ? (
                    <p>Loading your sessions...</p>
                  ) : createdSessions.length === 0 &&
                    participantSessions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">
                        No active sessions
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {"You don't have any active bill splitting sessions."}
                      </p>
                      <Link href="/scan-bill">
                        <Button>
                          <Upload className="mr-2 h-4 w-4" />
                          Scan a bill to get started
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Sort combined sessions by date (recent to older) */}
                      {[...createdSessions, ...participantSessions]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((session) => {
                          // Calculate total bill amount
                          const totalAmount = session.items.reduce(
                            (sum, item) => sum + item.price,
                            0
                          );

                          // Count participants
                          const participantCount = Object.keys(
                            session.participants
                          ).length;

                          return (
                            <Card key={session.id}>
                              <CardHeader>
                                <CardTitle>{session.title}</CardTitle>
                                <CardDescription>
                                  Created{" "}
                                  {new Date(session.createdAt).toLocaleString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span className="font-medium">
                                    ${totalAmount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Participants:</span>
                                  <span>{participantCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <span className="capitalize">
                                    {session.status}
                                  </span>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Link
                                  href={`/session-history/${session.id}`}
                                  className="w-full"
                                >
                                  <Button variant="outline" className="w-full">
                                    {"View History"}
                                  </Button>
                                </Link>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="created">
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Sessions Created by Me
                  </h2>
                  {sessionsLoading ? (
                    <p>{"Loading your sessions..."}</p>
                  ) : (
                    renderSessionCards(createdSessions)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="joined">
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    {" Sessions I've Joined"}
                  </h2>
                  {sessionsLoading ? (
                    <p>{"Loading your sessions..."}</p>
                  ) : (
                    renderSessionCards(participantSessions)
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
