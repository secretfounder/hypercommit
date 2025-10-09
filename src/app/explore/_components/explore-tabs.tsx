import { buttonVariants } from "@/components/ui/button";
import { BookMarkedIcon, Building2Icon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "repositories" | "users" | "organizations";

export interface ExploreTabsProps {
  activeTab: Tab;
}

export function ExploreTabs({ activeTab }: ExploreTabsProps) {
  return (
    <nav className="bg-background border-b px-4 pt-1.5 flex flex-wrap items-center gap-2">
      <Link
        className={cn(
          "border-b-2",
          activeTab === "repositories"
            ? "border-foreground"
            : "border-transparent"
        )}
        href="/explore/repositories"
      >
        <span
          className={buttonVariants({
            variant: "ghost",
            className: "mb-1.5",
          })}
        >
          <BookMarkedIcon className="h-4 w-4" />
          Repositories
        </span>
      </Link>
      <Link
        className={cn(
          "border-b-2",
          activeTab === "users" ? "border-foreground" : "border-transparent"
        )}
        href="/explore/users"
      >
        <span
          className={buttonVariants({
            variant: "ghost",
            className: "mb-1.5",
          })}
        >
          <UsersIcon className="h-4 w-4" />
          Users
        </span>
      </Link>
      <Link
        className={cn(
          "border-b-2",
          activeTab === "organizations"
            ? "border-foreground"
            : "border-transparent"
        )}
        href="/explore/organizations"
      >
        <span
          className={buttonVariants({
            variant: "ghost",
            className: "mb-1.5",
          })}
        >
          <Building2Icon className="h-4 w-4" />
          Organizations
        </span>
      </Link>
    </nav>
  );
}
