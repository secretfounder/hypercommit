import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ExternalLinkIcon } from "lucide-react";
import { Header } from "./header";
import { cn } from "@/lib/utils";

export function CommonHeader({ isExplore }: { isExplore?: boolean }) {
  return (
    <Header>
      <Link
        className={buttonVariants({
          variant: "ghost",
          className: cn("ml-2", isExplore && "bg-accent"),
        })}
        href="/explore/repositories"
      >
        Explore
      </Link>
      <a
        className={buttonVariants({ variant: "ghost" })}
        href="https://blog.hypercommit.com"
        target="_blank"
      >
        Blog
        <ExternalLinkIcon className="h-4 w-4" />
      </a>{" "}
    </Header>
  );
}
