"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded bg-zinc-900/50 text-red-600 border border-zinc-900 font-semibold hover:bg-zinc-950 hover:text-red-500 transition-colors shadow-sm hover:shadow"
      onClick={() => void signOut()}>
      <LogOut />
    </button>
  );
}
