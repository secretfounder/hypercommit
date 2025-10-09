"use client";

import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookMarkedIcon,
  Building2Icon,
  LogOutIcon,
  PlusIcon,
  Settings,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  }

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="bg-background border-b px-4 py-3 flex flex-wrap justify-between items-center gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Tooltip>
          <TooltipTrigger className="cursor-pointer">
            <Link href="/">
              <h1 className="font-display text-4xl -mt-1">Hypercommit</h1>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go back home</p>
          </TooltipContent>
        </Tooltip>
        {children}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ThemeToggle />
        {session ? (
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
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-2">
                <DropdownMenuLabel>
                  <span>@{session.user?.username || "user"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled asChild>
                  <Link
                    className="cursor-pointer flex items-center gap-x-2"
                    href={`/${session.user?.username}`}
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
        ) : (
          <>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/sign-up"
            >
              Create an account
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
