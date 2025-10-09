import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "./theme";
import { HeaderActions } from "./header-actions";
import { getSession } from "@/lib/session";

export async function Header({ children }: React.PropsWithChildren) {
  const session = await getSession();

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
        {session?.user ? (
          <HeaderActions user={session.user} />
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
