"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginButton from "@/components/LoginButton";

export default function LoginPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isAdmin) {
      router.push("/admin");
    }
  }, [user, isAdmin, router]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="mb-8 text-2xl font-bold">Admin Login</h1>
      <LoginButton />
    </div>
  );
}
