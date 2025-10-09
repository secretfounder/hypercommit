import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GitBranchIcon, ClockIcon } from "lucide-react";

interface RepositoryCardProps {
  owner: string;
  name: string;
  defaultBranch: string;
  createdAt: Date;
}

export function RepositoryCard({
  owner,
  name,
  defaultBranch,
  createdAt,
}: RepositoryCardProps) {
  const relativeTime = getRelativeTime(createdAt);

  return (
    <Link href={`/${owner}/${name}`}>
      <Card className="hover:opacity-80 transition-opacity">
        <CardHeader>
          <CardTitle className="text-base">{name}</CardTitle>
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
