"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

interface AuthProviderInterface {
  children: React.ReactNode;
}
const AuthProvider = ({ children }: AuthProviderInterface) => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  return children;
};

export default AuthProvider;
