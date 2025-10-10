import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranchIcon, ClockIcon, LockIcon, GlobeIcon } from "lucide-react";

interface RepositoryCardProps {
  owner: string;
  name: string;
  defaultBranch: string;
  createdAt: Date;
  visibility?: string;
}

export function RepositoryCard({
  owner,
  name,
  defaultBranch,
  createdAt,
  visibility = "public",
}: RepositoryCardProps) {
  const relativeTime = getRelativeTime(createdAt);
  const isPrivate = visibility === "private";

  return (
    <Link href={`/${owner}/${name}`}>
      <Card className="hover:opacity-80 transition-opacity">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{name}</CardTitle>
            <Badge variant="outline" className="shrink-0">
              {isPrivate ? (
                <>
                  <LockIcon className="h-3 w-3 mr-1" />
                  Private
                </>
              ) : (
                <>
                  <GlobeIcon className="h-3 w-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
          </div>
          <CardDescription className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5">
              <GitBranchIcon className="h-3.5 w-3.5" />
              {defaultBranch}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <ClockIcon className="h-3.5 w-3.5" />
              Created {relativeTime}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  }
  if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
