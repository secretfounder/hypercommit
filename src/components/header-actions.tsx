"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookMarkedIcon,
  Building2Icon,
  LogOutIcon,
  PlusIcon,
  Settings,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Session } from "@/lib/auth";

type HeaderActionsProps = {
  user: Session["user"];
};

export function HeaderActions({ user }: HeaderActionsProps) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  }

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              className="cursor-pointer flex items-center gap-x-2"
              href="/repositories/new"
            >
              <BookMarkedIcon />
              Repository
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled asChild>
            <Link
              className="cursor-pointer flex items-center gap-x-2"
              href="/organizations/new"
            >
              <Building2Icon />
              Organization
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2">
          <DropdownMenuLabel>
            <span>@{user.username || "user"}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled asChild>
            <Link
              className="cursor-pointer flex items-center gap-x-2"
              href={`/${user.username}`}
            >
              <UserIcon />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled asChild>
            <Link
              className="cursor-pointer flex items-center gap-x-2"
              href="/settings"
            >
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full cursor-pointer text-destructive flex items-center gap-x-2"
            >
              <LogOutIcon className="text-destructive" />
              Sign out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
