"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [signInWithGoogle, user] = useSignInWithGoogle(auth);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch {
      console.log("error dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      document.cookie = `authToken=${user.user.getIdToken()}; path=/;`;
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Log in</CardTitle>
          <CardDescription>Sign in with your google account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12" />
              <path d="M6 12h12" />
            </svg>
            Signin with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
