"use client";

import { DashboardNav } from "@/components/dashboard-nav";
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
import { getUserParticipantSessions, getUserSessions } from "@/lib/session-service";
import { BillSession } from "@/type/types";
import { LogOut, Receipt, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [createdSessions, setCreatedSessions] = useState<BillSession[]>([]);
  const [participantSessions, setParticipantSessions] = useState<BillSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        try {
          setSessionsLoading(true);
          
          // Fetch sessions created by the user
          const userCreatedSessions = await getUserSessions(user.uid);
          setCreatedSessions(userCreatedSessions);
          
          // Fetch sessions where the user is a participant
          const userParticipantSessions = await getUserParticipantSessions(user.uid);
          
          // Filter out sessions that the user created (to avoid duplicates)
          const filteredParticipantSessions = userParticipantSessions.filter(
            (session) => session.createdBy !== user.uid
          );
          
          setParticipantSessions(filteredParticipantSessions);
        } catch (error) {
          console.error("Error fetching sessions:", error);
        } finally {
          setSessionsLoading(false);
        }
      }
    };

    if (user) {
      fetchSessions();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Helper function to render session cards
  const renderSessionCards = (sessions: BillSession[]) => {
    if (sessions.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No active sessions</h3>
          <p className="text-gray-500 mb-4">
            You don't have any active bill splitting sessions.
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

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => {
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
                  Created {new Date(session.createdAt).toLocaleDateString()}
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
                  <span className="capitalize">{session.status}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/session/${session.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Session
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
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" />
            <span>EasySplit</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm">
              {user.displayName || user.email}
            </span>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <DashboardNav />
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
                  <h2 className="text-xl font-bold mb-4">Active Bill Sessions</h2>
                  {sessionsLoading ? (
                    <p>Loading your sessions...</p>
                  ) : createdSessions.length === 0 && participantSessions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No active sessions</h3>
                      <p className="text-gray-500 mb-4">
                        You don't have any active bill splitting sessions.
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
                      {[...createdSessions, ...participantSessions].map((session) => {
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
                                Created {new Date(session.createdAt).toLocaleDateString()}
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
                                <span className="capitalize">{session.status}</span>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link href={`/session/${session.id}`} className="w-full">
                                <Button variant="outline" className="w-full">
                                  View Session
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
                  <h2 className="text-xl font-bold mb-4">Sessions Created by Me</h2>
                  {sessionsLoading ? (
                    <p>Loading your sessions...</p>
                  ) : (
                    renderSessionCards(createdSessions)
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="joined">
                <div>
                  <h2 className="text-xl font-bold mb-4">Sessions I've Joined</h2>
                  {sessionsLoading ? (
                    <p>Loading your sessions...</p>
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
